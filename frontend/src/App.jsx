import React from "react";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate,
} from "react-router-dom";
import Auth from "./components/Auth";
import ChatWindow from "./components/ChatWindow";

const ProtectedRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return token ? children : <Navigate to="/" replace />;
};

const PublicRoute = ({ children }) => {
  const token = localStorage.getItem("token");
  return !token ? children : <Navigate to="/chat" replace />;
};

function App() {
  return (
    <Router>
      <Routes>
        {/* 1. Login / Signup Route (Home Page) */}
        <Route
          path="/"
          element={
            <PublicRoute>
              <Auth />
            </PublicRoute>
          }
        />

        {/* 2. Secured Chat Dashboard Route */}
        <Route
          path="/chat"
          element={
            <ProtectedRoute>
              <ChatWindow />
            </ProtectedRoute>
          }
        />

        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Router>
  );
}

export default App;
