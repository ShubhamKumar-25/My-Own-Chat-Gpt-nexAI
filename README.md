# 🤖 NexAI - Full-Stack AI Chatbot with CI/CD & Serverless SQL

NexAI is an "AI-First" full-stack chatbot application built using the **MERN Stack** (MySQL, Express, React, Node.js) and integrated with the ultra-fast **Groq AI API** for context-aware, real-time streaming conversations. The architecture is engineered with a continuous integration pipeline using GitHub Actions, serverless cloud database storage, and optimized production hosting.

---

## 🚀 Key Features

- **Intelligent Conversations:** Powered by Groq AI API for high-speed, accurate, context-aware responses.
- **Secure Authentication:** Secure user signup and login workflows with hashed passwords.
- **Chat History Persistence:** All chat logs and sessions are seamlessly saved to a cloud database.
- **Production-Ready CORS:** Dynamic environment-driven CORS configuration safeguarding backend endpoints.
- **Automated CI/CD Pipeline:** GitHub Actions automation that screens builds and audits package vulnerabilities on every push to `main`.

---

## 🏗️ Architecture & Tech Stack

- **Frontend:** React.js (Vite), Axios, TailwindCSS (Hosted on **Vercel**)
- **Backend:** Node.js, Express.js (Hosted on **Render**)
- **Database:** TiDB Cloud (Serverless MySQL-compatible cluster)
- **AI Engine:** Groq API Cloud
- **DevOps/CI-CD:** GitHub Actions workflow (`deploy.yml`)

---

## 📂 Project Folder Structure

The project uses a structured, decoupled mono-repo layout managed from a single root Git directory:

```text
AI-Chatbot-Project (Root Folder)
  ├── .github/
  │     └── workflows/
  │           └── deploy.yml      # GitHub Actions CI/CD Script
  ├── backend/
  │     ├── routes/               # Express Routes (Auth & Chat)
  │     ├── db.js                 # TiDB MySQL Connection Pooling with SSL
  │     ├── server.js             # Main API Entry Point
  │     ├── .env.example          # Environment blueprint for Server
  │     └── package.json
  ├── frontend/
  │     ├── src/                  # React Source Files (.jsx)
  │     ├── .env.example          # Environment blueprint for Client
  │     └── package.json
  └── .gitignore                  # Root-level unified git ignore rules
```
