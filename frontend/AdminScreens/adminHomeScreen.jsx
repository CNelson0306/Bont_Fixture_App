import React from "react";
import { useNavigate } from "react-router-dom";
import "../src/index.css";

export default function AdminHomeScreen() {
  const navigate = useNavigate();

  const handleLogout = () => {
    const confirmLogout = window.confirm("Are you sure you want to log out?");
    if (confirmLogout) {
      navigate("/", { replace: true });
    }
  };

  return (
    <div className="container">
      <h1 className="title">Admin Dashboard</h1>

      <button
        className="button primary"
        onClick={() => navigate("/add-fixture")}
      >
        Add Fixture
      </button>

      <button
        className="button primary"
        onClick={() => navigate("/add-result")}
      >
        Add Result
      </button>

      <button
        className="button primary"
        onClick={() => navigate("/manage-fixtures")}
      >
        Manage Fixtures
      </button>

      <button
        className="button primary"
        onClick={() => navigate("/manage-results")}
      >
        Manage Results
      </button>

      <button className="button secondary" onClick={handleLogout}>
        Logout
      </button>
    </div>
  );
}
