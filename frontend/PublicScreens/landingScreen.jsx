// src/pages/LandingScreen.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { warmServer } from "../api";
import logo from "/bont-logo.png";

export default function LandingScreen() {
  const navigate = useNavigate();

  // Wake the Render server the moment the user hits the landing page,
  // before they've even pressed a button.
  useEffect(() => {
    warmServer();
  }, []);

  return (
    <div className="landing">
      <img src={logo} alt="Bont RFC" className="landing__logo" />

      <h1 className="landing__club">Bont RFC</h1>
      <p className="landing__team">U14's</p>
      <p className="landing__season">2025 / 2026 Season</p>

      <div className="landing__divider" />

      <nav className="landing__nav">
        <button
          className="btn btn--primary"
          onClick={() => navigate("/fixtures")}
        >
          🏉 Fixtures
        </button>
        <button
          className="btn btn--outline"
          onClick={() => navigate("/results")}
        >
          📋 Results
        </button>
        <button className="btn btn--ghost" onClick={() => navigate("/login")}>
          Admin Login
        </button>
      </nav>
    </div>
  );
}
