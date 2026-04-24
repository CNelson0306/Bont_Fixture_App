// src/pages/LandingScreen.jsx
import React, { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { warmAndPrefetch, getFixtures, getResults } from "../api";
import logo from "/bont-logo.png";

export default function LandingScreen() {
  const navigate = useNavigate();

  // Fire prefetch the moment the landing screen mounts
  useEffect(() => {
    warmAndPrefetch();
  }, []);

  // onTouchStart fires ~100ms before onClick — gives a head start
  // on the navigation + data fetch before the user's finger lifts
  const prefetchFixtures = () => getFixtures().catch(() => {});
  const prefetchResults = () => getResults().catch(() => {});

  return (
    <div className="landing">
      <img src={logo} alt="Bont RFC" className="landing__logo" />

      <h1 className="landing__club">Bont RFC</h1>
      <p className="landing__team">U14's</p>
      <p className="landing__season">2025 / 26 Season</p>

      <div className="landing__divider" />

      <nav className="landing__nav">
        <button
          className="btn btn--primary"
          onTouchStart={prefetchFixtures}
          onMouseEnter={prefetchFixtures}
          onClick={() => navigate("/fixtures")}
        >
          🏉 Fixtures
        </button>
        <button
          className="btn btn--outline"
          onTouchStart={prefetchResults}
          onMouseEnter={prefetchResults}
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
