import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ReactMarkdown from "react-markdown";
import "./ChatWindow.css";

const ChatWindow = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]); // Sidebar lists
  const [currentSessionId, setCurrentSessionId] = useState(null); // Active session tracker
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [isListening, setIsListening] = useState(false);
  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

  // Auth System & Initial Loader
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    const token = localStorage.getItem("token");

    if (!token || !storedUser) {
      handleLogout();
      return;
    }

    const parsedUser = JSON.parse(storedUser);
    setUser(parsedUser);
    setUserId(parsedUser.id);

    fetchSidebarHistory();
  }, []);

  const fetchSidebarHistory = async () => {
    try {
      const response = await api.get("/chat/history");
      if (response.data.success) {
        setSessions(response.data.sessions || []);
      }
    } catch (error) {
      console.error("Sidebar history load error:", error);
    }
  };

  const loadSpecificSessionChats = async (sessionId) => {
    try {
      setCurrentSessionId(sessionId);
      setLoading(true);
      const response = await api.get(`/chat/history/${sessionId}`);
      if (response.data.success) {
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error("Session messages load error:", error);
    } finally {
      setLoading(false);
    }
  };

  // --- Voice-to-Text Logic ---
  const handleVoiceInput = () => {
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;

    if (!SpeechRecognition) {
      alert("Speech Recognition is not supported in this browser. Use Chrome!");
      return;
    }

    const recognition = new SpeechRecognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;

    recognition.onstart = () => setIsListening(true);

    recognition.onresult = (event) => {
      const transcript = event.results[0][0].transcript;
      setInput(transcript);
      setIsListening(false);
    };

    recognition.onerror = () => setIsListening(false);
    recognition.onend = () => setIsListening(false);

    recognition.start();
  };

  // 3. NEW CONVERSATION BUTTON CLICK
  const startNewChat = () => {
    setMessages([]);
    setInput("");
    setCurrentSessionId(null); // Resetting session so next message triggers a fresh dynamic session
  };

  // 4. SEND MESSAGE LOGIC (With explicit session management)
  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const activeSessionId = currentSessionId || `session_${Date.now()}`;
    if (!currentSessionId) {
      setCurrentSessionId(activeSessionId);
    }

    const userMsg = { text: input, sender: "user" };
    setMessages((prev) => [...prev, userMsg]);
    const currentInput = input;
    setInput("");
    setLoading(true);

    try {
      const response = await api.post("/chat/send", {
        message: currentInput,
        session_id: activeSessionId,
      });

      if (response.data.success) {
        const aiMsg = { text: response.data.reply, sender: "ai" };
        setMessages((prev) => [...prev, aiMsg]);

        fetchSidebarHistory();
      }
    } catch (error) {
      console.error("Chat Send Error:", error);
      setMessages((prev) => [
        ...prev,
        { text: "⚠️ Connection error or session expired!", sender: "ai" },
      ]);
    } finally {
      setLoading(false);
    }
  };

  // 5. DELETE SINGLE CONVERSATION
  const handleDeleteChat = async (sessionIdToDelete) => {
    if (window.confirm("You want to delete this chat history?")) {
      try {
        await api.delete("/chat/delete", {
          data: { session_id: sessionIdToDelete },
        });

        // Local state updates for smooth UX
        setSessions((prev) => prev.filter((s) => s.id !== sessionIdToDelete));

        if (currentSessionId === sessionIdToDelete) {
          setMessages([]);
          setCurrentSessionId(null);
        }
      } catch (error) {
        console.error("Delete failed error:", error);
        alert("Could not be deleted!");
      }
    }
  };

  // Logout Handler
  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="main-layout">
      <aside className="sidebar">
        <h2
          style={{
            fontSize: "22px",
            marginBottom: "30px",
            color: "#10b981",
            fontWeight: "bold",
          }}
        >
          NexAI
        </h2>

        <button className="new-chat-btn" onClick={startNewChat}>
          + New Conversation
        </button>

        <div
          style={{
            color: "#64748b",
            fontSize: "11px",
            fontWeight: "bold",
            marginBottom: "15px",
            letterSpacing: "1px",
          }}
        >
          RECENT CHATS
        </div>

        {/* Dynamic Sidebar Dashboard Collection */}
        <div className="session-list">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`session-item-container ${currentSessionId === session.id ? "active-session-row" : ""}`}
              style={{
                display: "flex",
                alignItems: "center",
                marginBottom: "8px",
                borderRadius: "6px",
                paddingRight: "5px",
              }}
            >
              <div
                className="session-item"
                style={{ flex: 1, cursor: "pointer" }}
                onClick={() => loadSpecificSessionChats(session.id)}
              >
                💬 {session.title}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation(); // Prevents loading the chat while deleting it
                  handleDeleteChat(session.id);
                }}
                className="delete-btn"
                style={{
                  background: "transparent",
                  border: "none",
                  cursor: "pointer",
                }}
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </aside>

      <div className="chat-container">
        <header className="chat-header">
          <div>
            <span style={{ fontWeight: "700", fontSize: "18px" }}>
              AI Assistant v2.0
            </span>
            <div
              style={{
                display: "flex",
                alignItems: "center",
                gap: "5px",
                fontSize: "12px",
                color: "#10b981",
              }}
            >
              <div
                className="status-dot"
                style={{ backgroundColor: "#10b981" }}
              ></div>{" "}
              Online
            </div>
          </div>

          <div style={{ display: "flex", alignItems: "center", gap: "15px" }}>
            <button onClick={toggleTheme} className="theme-toggle">
              {theme === "dark" ? "☀️ Light" : "🌙 Dark"}
            </button>

            <div className="user-avatar" title={user?.email || "User"}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <button
              onClick={handleLogout}
              className="theme-toggle"
              style={{
                background: "#ef444422",
                color: "#ef4444",
                border: "1px solid #ef444433",
              }}
            >
              🚪 Logout
            </button>
          </div>
        </header>

        <div className="chat-box">
          {messages.length === 0 && (
            <div className="placeholder-text">
              <h1>How can I help you, {user?.name || "Guest"}?</h1>
              <p>
                Start a secure end-to-end conversational session with NexAI.
              </p>
            </div>
          )}

          {messages.map((msg, index) => (
            <div
              key={index}
              className={`message-row ${msg.sender === "user" ? "user-row" : "ai-row"}`}
            >
              <div
                className={`bubble ${msg.sender === "user" ? "user-bubble" : "ai-bubble"}`}
              >
                {msg.sender === "ai" ? (
                  <div className="markdown-content">
                    <ReactMarkdown>{msg.text || msg.ai_response}</ReactMarkdown>
                  </div>
                ) : (
                  msg.text || msg.user_message
                )}
              </div>
            </div>
          ))}

          {loading && (
            <div className="message-row ai-row">
              <div className="bubble ai-bubble">
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
                <div className="typing-dot"></div>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        <div className="input-wrapper">
          <div className="input-area">
            <button
              className={`mic-button ${isListening ? "listening" : ""}`}
              onClick={handleVoiceInput}
              title="Voice Input"
            >
              {isListening ? "🛑" : "🎤"}
            </button>

            <input
              className="chat-input"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder={isListening ? "Listening..." : "Ask me anything..."}
              disabled={loading}
            />
            <button
              className="send-button"
              onClick={handleSend}
              disabled={loading || !input.trim()}
            >
              {loading ? "..." : "Send"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatWindow;
