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
        setMessages(response.data.messages || []);
      }
    } catch (error) {
      console.error("Session messages load error:", error);
    } finally {
      loading && setLoading(false);
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

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  return (
    <div className="main-layout">
      {/* Dark Overlay behind sidebar in mobile view */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        ></div>
      )}

      {/* Dynamic Sidebar with 'open' class */}
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
          {/* Close Menu Button on Mobile */}
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
            {/* ☰ Hamburger Menu Toggle Button */}
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
