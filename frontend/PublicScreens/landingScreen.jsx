// src/pages/LandingScreen.jsx
import React from "react";
import { useNavigate } from "react-router-dom";
import "../src/index.css";
import logo from "/bont-logo.png"; // Make sure Webpack/Vite can import this

export default function LandingScreen() {
  const navigate = useNavigate();

  return (
    <div className="container">
      <img src={logo} alt="Bont RFC Logo" className="logo" />

      <h1 className="title">🏉 Bont RFC U14's</h1>
      <h2 className="subheading">2025/26 Season</h2>

      <button className="button primary" onClick={() => navigate("/fixtures")}>
        View Fixtures
      </button>
      <button className="button primary" onClick={() => navigate("/results")}>
        View Results
      </button>

      <button className="button primary" onClick={() => navigate("/login")}>
        Admin Login
      </button>
    </div>
  );
}
