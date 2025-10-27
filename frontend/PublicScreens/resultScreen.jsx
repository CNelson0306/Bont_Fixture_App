import React, { useEffect, useState } from "react";
import localforage from "localforage";
import { getResults } from "../api";
import { useNavigate } from "react-router-dom";
import "../src/index.css";

export default function ResultScreen() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);

  // ✅ Safely parse both "YYYY-MM-DD" and "DD/MM/YY" or "DD/MM/YYYY"
  const parseDate = (str) => {
    if (!str) return new Date(0);

    // ISO style (yyyy-mm-dd)
    if (str.includes("-")) {
      return new Date(str);
    }

    // European style (dd/mm/yy or dd/mm/yyyy)
    const [day, month, yearRaw] = str.split("/").map(Number);
    const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
    return new Date(year, month - 1, day);
  };

  // ✅ Consistent date display (e.g. "27/10/25")
  const formatDate = (dateStr) => {
    if (!dateStr) return "Date not available";
    const date = parseDate(dateStr);
    if (isNaN(date)) return "Invalid date";
    return date.toLocaleDateString("en-GB", {
      day: "2-digit",
      month: "2-digit",
      year: "2-digit",
    });
  };

  // ✅ Sort results newest → oldest
  const sortResults = (results) =>
    [...results].sort((a, b) => parseDate(b.date) - parseDate(a.date));

  useEffect(() => {
    const loadResults = async () => {
      try {
        // Load cached results first
        const cached = await localforage.getItem("results");
        if (cached) setResults(sortResults(cached));

        // Fetch latest from backend
        if (navigator.onLine) {
          const latest = await getResults();
          setResults(sortResults(latest));
          await localforage.setItem("results", latest); // update cache
        }
      } catch (err) {
        console.error("Error loading results:", err);
      }
    };

    loadResults();

    // Auto-refresh when back online
    const handleOnline = async () => {
      try {
        const latest = await getResults();
        setResults(sortResults(latest));
        await localforage.setItem("results", latest);
      } catch (err) {
        console.error("Error syncing results:", err);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => window.removeEventListener("online", handleOnline);
  }, []);

  return (
    <div className="results-container">
      <button className="top-back-button" onClick={() => navigate(-1)}>
        ◀ Back
      </button>
      <h2 className="title">Team Results</h2>
      {results.map((item) => {
        const [homeTeam, awayTeam] = item.fixture.split(" vs ");
        return (
          <div key={item._id} className="result-card">
            <div className="result-date">{formatDate(item.date)}</div>
            <div className="teams-row">
              <span className="team-text">{homeTeam}</span>
              <span className="team-text">{awayTeam}</span>
            </div>
            <div className="scores-row">
              <span className="score">{item.homeScore}</span>
              <span className="score">{item.awayScore}</span>
            </div>
            {item.scorers && item.scorers.length > 0 && (
              <div className="scorers">
                <h4>Point Scorers</h4>
                <ul>
                  {item.scorers.map((scorer, index) => (
                    <li key={index}>
                      {scorer.name} - {scorer.points}pts
                    </li>
                  ))}
                </ul>
              </div>
            )}
            <div className="mom-text">Man of the match - {item.manOfMatch}</div>
          </div>
        );
      })}
    </div>
  );
}
