
const db = require('../config/db');
const Groq = require('groq-sdk');
require('dotenv').config();

const groq = new Groq({
    apiKey: process.env.GROQ_API_KEY,
});

// 1. Process Chat & Save with Session ID
exports.processChat = async (req, res) => {

    const { message, session_id } = req.body; 
    const userId = req.user.id; 

    if (!message) return res.status(400).json({ error: "Message is required" });

    const activeSessionId = session_id || `session_${Date.now()}`;

    try {
    const chatCompletion = await groq.chat.completions.create({
        messages: [
            {
                role: "system",
                content: `You are an advanced AI assistant with exceptional reasoning ability (IQ 200-level depth). Follow these rules in every response:

- Never give short, one-line, or surface-level answers — always explain step by step with clear logical flow.
- Break complex ideas into simple, digestible parts.
- Use bullet points or numbered lists for structure.
- Use analogies or real-world examples to make abstract concepts intuitive.
- Use **bold text** for headings/key terms and proper Markdown code blocks for any programming snippets.
- Maintain a conversational, mentor-like tone — intelligent but approachable, never robotic or overly formal.
- Every answer should feel complete: context → explanation → example/analogy → summary/insight.
- Avoid unnecessary repetition, but never sacrifice depth for brevity.`
            },
            { role: "user", content: message }
        ],
        model: "llama-3.3-70b-versatile",
    });

    const aiResponse = chatCompletion.choices[0]?.message?.content || "";

    await db.execute(
        'INSERT INTO chats (user_id, session_id, user_message, ai_response) VALUES (?, ?, ?, ?)',
        [userId, activeSessionId, message, aiResponse]
    );

    res.status(200).json({ success: true, reply: aiResponse, session_id: activeSessionId });

} catch (error) {
    console.error("Chat Error:", error);
    res.status(500).json({ error: "AI processing failed" });
}
};

exports.getChatHistory = async (req, res) => {
    const userId = req.user.id; 

    try {

        const [rows] = await db.execute(
            `SELECT session_id, MIN(user_message) AS title, MIN(timestamp) AS created_at 
             FROM chats 
             WHERE user_id = ? 
             GROUP BY session_id 
             ORDER BY created_at DESC`,
            [userId]
        );

        const sessions = rows.map(row => ({
            id: row.session_id,
            title: row.title.length > 25 ? row.title.substring(0, 25) + "..." : row.title
        }));

        res.status(200).json({ success: true, sessions });
    } catch (error) {
        console.error("History Error:", error);
        res.status(500).json({ error: "Could not fetch history list" });
    }
};

exports.getMessagesBySession = async (req, res) => {
    const userId = req.user.id;
    const { sessionId } = req.params;
    try {
        const [rows] = await db.execute(
            'SELECT user_message, ai_response FROM chats WHERE user_id = ? AND session_id = ? ORDER BY timestamp ASC',
            [userId, sessionId]
        );

        const messages = [];
        rows.forEach(chat => {
            messages.push({ text: chat.user_message, sender: 'user' });
            messages.push({ text: chat.ai_response, sender: 'ai' });
        });

        res.status(200).json({ success: true, messages });
    } catch (error) {
        console.error("Session Messages Error:", error);
        res.status(500).json({ error: "Could not fetch session messages" });
    }
};

exports.deleteChat = async (req, res) => {
    const userId = req.user.id; 
    const { session_id } = req.body; 

    if (!session_id) return res.status(400).json({ error: "Session ID is required to delete" });

    try {
        await db.execute('DELETE FROM chats WHERE user_id = ? AND session_id = ?', [userId, session_id]);
        res.status(200).json({ success: true, message: "Selected chat session deleted successfully" });
    } catch (error) {
        console.error("Delete Single Error:", error);
        res.status(500).json({ error: "Delete failed" });
    }
};

exports.clearAll = async (req, res) => {
    const userId = req.user.id; 
    try {
        await db.execute('DELETE FROM chats WHERE user_id = ?', [userId]);
        res.status(200).json({ success: true, message: "Your complete history cleared successfully" });
    } catch (error) {
        console.error("Clear All Error:", error);
        res.status(500).json({ error: "Clear all failed" });
    }
};