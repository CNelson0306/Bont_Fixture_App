import React, { useEffect, useState } from "react";
import { getFixtures } from "../api";
import { useNavigate } from "react-router-dom";
import "../src/index.css";

export default function FixtureScreen() {
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState([]);

  // --- Helpers to parse and sort dates ---
  const parseDate = (str) => {
    const [day, month, year] = str.split("/").map(Number);
    return new Date(2000 + year, month - 1, day);
  };

  const sortFixtures = (fixtures) => {
    return [...fixtures].sort((a, b) => parseDate(a.date) - parseDate(b.date));
  };

  useEffect(() => {
    getFixtures().then((data) => setFixtures(sortFixtures(data)));
  }, []);

  return (
    <div className="fixture-container">
      <button className="top-back-button" onClick={() => navigate(-1)}>
        ◀ Back
      </button>

      <div className="fixture-list">
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
