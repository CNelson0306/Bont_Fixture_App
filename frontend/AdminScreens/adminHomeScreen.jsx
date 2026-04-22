// src/pages/AdminHomeScreen.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";

const NAV_ITEMS = [
  {
    label: "Add Fixture",
    route: "/add-fixture",
    icon: "📅",
    description: "Schedule a new match",
  },
  {
    label: "Add Result",
    route: "/add-result",
    icon: "✏️",
    description: "Record a match result",
  },
  {
    label: "Manage Fixtures",
    route: "/manage-fixtures",
    icon: "📋",
    description: "Edit or delete fixtures",
  },
  {
    label: "Manage Results",
    route: "/manage-results",
    icon: "📊",
    description: "Edit or delete results",
  },
  {
    label: "Standings",
    route: "/standings",
    icon: "🏅",
    description: "Season standings",
  },
];

export default function AdminHomeScreen() {
  const navigate = useNavigate();
  const [confirmingLogout, setConfirmingLogout] = useState(false);

  const handleLogout = () => {
    if (confirmingLogout) {
      navigate("/", { replace: true });
    } else {
      setConfirmingLogout(true);
      // Auto-cancel after 4 seconds if they change their mind
      setTimeout(() => setConfirmingLogout(false), 4000);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <div className="page__title-spacer" />
        <h1 className="page__title">Dashboard</h1>
        <div className="page__title-spacer" />
      </header>

      <div className="admin__body">
        <p className="admin__subtitle">Bont RFC · U15's Admin</p>

        <div className="admin__grid">
          {NAV_ITEMS.map((item) => (
            <button
              key={item.route}
              className="admin__tile"
              onClick={() => navigate(item.route)}
            >
              <span className="admin__tile-icon">{item.icon}</span>
              <span className="admin__tile-label">{item.label}</span>
              <span className="admin__tile-desc">{item.description}</span>
            </button>
          ))}
        </div>

        <button
          className={`btn admin__logout ${confirmingLogout ? "admin__logout--confirm" : ""}`}
          onClick={handleLogout}
        >
          {confirmingLogout ? "Tap again to confirm logout" : "Logout"}
        </button>
      </div>
    </div>
  );
}
