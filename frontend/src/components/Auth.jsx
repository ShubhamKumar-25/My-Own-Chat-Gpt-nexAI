import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import api from "../services/api";
import "../styles/Auth.css";

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    username: "",
    email: "",
    password: "",
  });
  const [error, setError] = useState("");
  const navigate = useNavigate();

  const handleChange = (e) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    try {
      if (isLogin) {
        // Login Request
        const response = await api.post("/auth/login", {
          email: formData.email,
          password: formData.password,
        });

        if (response.data.token) {
          localStorage.setItem("token", response.data.token);
          localStorage.setItem("user", JSON.stringify(response.data.user));
          navigate("/chat");
        }
      } else {
        const response = await api.post("/auth/signup", {
          name: formData.name,
          username: formData.username,
          email: formData.email,
          password: formData.password,
        });

        alert(
          response.data.message || "Registration Successful! Please Login.",
        );
        setIsLogin(true);
      }
    } catch (err) {
      setError(err.response?.data?.error || "Something went wrong. Try again.");
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        <h2>{isLogin ? "NexAI - Obsidian" : "Create Account"}</h2>
        <p className="auth-subtitle">
          {isLogin
            ? "Welcome back! Please login to your assistant."
            : "Join the premium conversational platform."}
        </p>

        {error && <div className="error-msg">{error}</div>}

        <form className="auth-form" onSubmit={handleSubmit}>
          {!isLogin && (
            <>
              <div className="input-group">
                <label>Full Name</label>
                <input
                  type="text"
                  name="name"
                  required
                  onChange={handleChange}
                  placeholder="John Doe"
                />
              </div>
              <div className="input-group">
                <label>Username</label>
                <input
                  type="text"
                  name="username"
                  required
                  onChange={handleChange}
                  placeholder="johndoe123"
                />
              </div>
            </>
          )}

          <div className="input-group">
            <label>Email Address</label>
            <input
              type="email"
              name="email"
              required
              onChange={handleChange}
              placeholder="Enter your email"
            />
          </div>

          <div className="input-group">
            <label>Password</label>
            <input
              type="password"
              name="password"
              required
              onChange={handleChange}
              placeholder="Enter your password"
            />
          </div>

          <button type="submit" className="auth-btn">
            {isLogin ? "Sign In" : "Sign Up"}
          </button>
        </form>

        <p className="auth-switch">
          {isLogin ? "Don't have an account? " : "Already have an account? "}
          <span
            onClick={() => {
              setIsLogin(!isLogin);
              setError("");
            }}
          >
            {isLogin ? "Sign Up" : "Sign In"}
          </span>
        </p>
      </div>
    </div>
  );
};

export default Auth;
