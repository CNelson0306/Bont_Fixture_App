import React, { useEffect, useState } from "react";
import localforage from "localforage";
import { getFixtures } from "../api";
import { useNavigate } from "react-router-dom";
import "../src/index.css";

export default function FixtureScreen() {
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState([]);

  const parseDate = (str) => {
    const [day, month, year] = str.split("/").map(Number);
    return new Date(2000 + year, month - 1, day);
  };

  const sortFixtures = (fixtures) => {
    return [...fixtures].sort((a, b) => parseDate(a.date) - parseDate(b.date));
  };

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

    // Optional: update automatically when back online
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
            <p className="date-text">{item.date}</p>
            <p className="team-text">
              {item.home} {item.homeScore ? item.homeScore : ""} vs{" "}
              {item.awayScore ? item.awayScore : ""} {item.away}
            </p>
            <p className="venue-text">{item.venue}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
