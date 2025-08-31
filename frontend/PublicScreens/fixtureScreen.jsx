import React, { useEffect, useState } from "react";
import localforage from "localforage";
import { getFixtures } from "../api";
import { useNavigate } from "react-router-dom";
import "../src/index.css";

export default function FixtureScreen() {
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState([]);

  // --- Helpers ---
  const formatDate = (dateStr) => {
    if (!dateStr) return "Date not available";
    let day, month, year;
    if (dateStr.includes("-")) {
      // ISO format YYYY-MM-DD
      [year, month, day] = dateStr.split("-");
    } else if (dateStr.includes("/")) {
      // Already in dd/mm/yy
      [day, month, year] = dateStr.split("/");
      if (year.length === 4) year = year.slice(-2);
    }
    return `${day}/${month}/${year}`;
  };

  const parseDate = (str) => {
    if (!str) return new Date(0);
    const [day, month, year] = str.split("/").map(Number);
    return new Date(2000 + year, month - 1, day);
  };

  const sortFixtures = (fixtures) =>
    [...fixtures].sort((a, b) => parseDate(a.date) - parseDate(b.date));

  useEffect(() => {
    const loadFixtures = async () => {
      try {
        // 1️⃣ Load cached fixtures first
        const cached = await localforage.getItem("fixtures");
        if (cached) setFixtures(sortFixtures(cached));

        // 2️⃣ Fetch latest from backend if online
        if (navigator.onLine) {
          const latest = await getFixtures();
          setFixtures(sortFixtures(latest));
          await localforage.setItem("fixtures", latest); // update cache
        }
      } catch (err) {
        console.error("Error loading fixtures:", err);
      }
    };

    loadFixtures();

    // Automatically sync when back online
    const handleOnline = async () => {
      try {
        const latest = await getFixtures();
        setFixtures(sortFixtures(latest));
        await localforage.setItem("fixtures", latest);
      } catch (err) {
        console.error("Error syncing fixtures:", err);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <div className="fixture-container">
      <button className="top-back-button" onClick={() => navigate(-1)}>
        ◀ Back
      </button>

      <div className="fixture-list">
        <h2 className="title">Bont U14's Fixtures</h2>
        {fixtures.map((item) => (
          <div key={item._id} className="fixture-item">
            <p className="date-text">{formatDate(item.date)}</p>
            <p className="team-text">
              {item.home} {item.homeScore ?? ""} vs {item.awayScore ?? ""}{" "}
              {item.away}
            </p>
            <p className="venue-text">{item.venue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
