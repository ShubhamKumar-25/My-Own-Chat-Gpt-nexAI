import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import ReactMarkdown from "react-markdown";
import "./ChatWindow.css";

/* ------------------------------------------------------------------
   TypingMessage
   ------------------------------------------------------------------
   Reveals `text` word-by-word (ChatGPT style). It keeps its own
   local state so only THIS bubble re-renders on every tick, not the
   whole message list. `onTick` is called after every word so the
   parent can auto-scroll while typing.
   `speed` = ms delay between each word.
------------------------------------------------------------------- */
const TypingMessage = ({ text, speed = 35, onTick, onDone }) => {
  const [displayed, setDisplayed] = useState("");

  useEffect(() => {
    if (!text) return;

    const words = text.split(" ");
    let i = 0;
    setDisplayed("");

    const interval = setInterval(() => {
      i += 1;
      setDisplayed(words.slice(0, i).join(" "));

      if (onTick) onTick();

      if (i >= words.length) {
        clearInterval(interval);
        if (onDone) onDone();
      }
    }, speed);

    return () => clearInterval(interval);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [text]);

  return (
    <div className="markdown-content">
      <ReactMarkdown>{displayed}</ReactMarkdown>
    </div>
  );
};

const ChatWindow = () => {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [userId, setUserId] = useState("");
  const [user, setUser] = useState(null);
  const [sessions, setSessions] = useState([]);
  const [currentSessionId, setCurrentSessionId] = useState(null);
  const [theme, setTheme] = useState(localStorage.getItem("theme") || "dark");
  const [isListening, setIsListening] = useState(false);

  // ☰ Hamburger State for Mobile
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
    localStorage.setItem("theme", theme);
  }, [theme]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  };

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
      setSidebarOpen(false);

      const response = await api.get(`/chat/history/${sessionId}`);
      if (response.data.success) {
        // History load hone par typing effect NAHI chahiye,
        // isliye har message ko isNew:false mark kar dete hain.
        const historyMsgs = (response.data.messages || []).map((m) => ({
          ...m,
          isNew: false,
        }));
        setMessages(historyMsgs);
      }
    } catch (error) {
      console.error("Session messages load error:", error);
    } finally {
      setLoading(false);
    }
  };

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

  const startNewChat = () => {
    setMessages([]);
    setInput("");
    setCurrentSessionId(null);
    setSidebarOpen(false);
  };

  const handleSend = async () => {
    if (!input.trim() || loading) return;

    const activeSessionId = currentSessionId || `session_${Date.now()}`;
    if (!currentSessionId) {
      setCurrentSessionId(activeSessionId);
    }

    const userMsg = { text: input, sender: "user", isNew: false };
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
        // isNew:true -> sirf isi message par typing animation chalegi
        const aiMsg = {
          text: response.data.reply,
          sender: "ai",
          isNew: true,
        };
        setMessages((prev) => [...prev, aiMsg]);
        fetchSidebarHistory();
      }
    } catch (error) {
      console.error("Chat Send Error:", error);
      setMessages((prev) => [
        ...prev,
        {
          text: "⚠️ Connection error or session expired!",
          sender: "ai",
          isNew: true,
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteChat = async (sessionIdToDelete) => {
    if (window.confirm("You want to delete this chat history?")) {
      try {
        await api.delete("/chat/delete", {
          data: { session_id: sessionIdToDelete },
        });

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

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/");
  };

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, loading]);

  return (
    <div className="main-layout">
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      <aside className={`sidebar ${sidebarOpen ? "open" : ""}`}>
        <div
          className="sidebar-header"
          style={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            marginBottom: "30px",
          }}
        >
          <h2
            style={{ fontSize: "22px", color: "#10b981", fontWeight: "bold" }}
          >
            NexAI
          </h2>
          <button
            className="sidebar-close-btn"
            onClick={() => setSidebarOpen(false)}
          >
            ✕
          </button>
        </div>

        <button className="new-chat-btn" onClick={startNewChat}>
          + New Conversation
        </button>

        <div className="recent-chats-label">RECENT CHATS</div>

        <div className="session-list">
          {sessions.map((session) => (
            <div
              key={session.id}
              className={`session-item-container ${currentSessionId === session.id ? "active-session-row" : ""}`}
            >
              <div
                className="session-item"
                onClick={() => loadSpecificSessionChats(session.id)}
              >
                💬 {session.title}
              </div>
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  handleDeleteChat(session.id);
                }}
                className="delete-btn"
              >
                🗑️
              </button>
            </div>
          ))}
        </div>
      </aside>

      <div className="chat-container">
        <header className="chat-header">
          <div className="header-start">
            <button
              className="hamburger-btn"
              onClick={() => setSidebarOpen(true)}
            >
              ☰
            </button>

            <div className="header-title-group">
              <span className="header-title">AI Assistant v2.0</span>
              <div className="status-container">
                <div className="status-dot"></div>
                <span className="status-text">Online</span>
              </div>
            </div>
          </div>

          <div className="header-actions">
            <button onClick={toggleTheme} className="theme-toggle">
              <span className="btn-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
              <span className="btn-label">
                {theme === "dark" ? "Light" : "Dark"}
              </span>
            </button>

            <div className="user-avatar" title={user?.email || "User"}>
              {user?.name ? user.name.charAt(0).toUpperCase() : "U"}
            </div>

            <button onClick={handleLogout} className="logout-btn">
              <span className="btn-icon">🚪</span>
              <span className="btn-label">Logout</span>
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

          {messages.map((msg, index) => {
            const rawText = msg.text || msg.ai_response || msg.user_message;

            return (
              <div
                key={index}
                className={`message-row ${msg.sender === "user" ? "user-row" : "ai-row"}`}
              >
                <div
                  className={`bubble ${msg.sender === "user" ? "user-bubble" : "ai-bubble"}`}
                >
                  {msg.sender === "ai" ? (
                    msg.isNew ? (
                      // Sirf newly-arrived AI reply par typing effect
                      <TypingMessage
                        text={rawText}
                        speed={35}
                        onTick={scrollToBottom}
                      />
                    ) : (
                      <div className="markdown-content">
                        <ReactMarkdown>{rawText}</ReactMarkdown>
                      </div>
                    )
                  ) : (
                    rawText
                  )}
                </div>
              </div>
            );
          })}

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
