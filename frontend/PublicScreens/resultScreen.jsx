import React, { useEffect, useState } from "react";
import localforage from "localforage";
import { getResults } from "../api";
import { useNavigate } from "react-router-dom";
import "../src/index.css";

export default function ResultScreen() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);

  const formatDate = (dateStr) => {
    if (!dateStr) return "Date not available";
    let day, month, year;
    if (dateStr.includes("-")) [year, month, day] = dateStr.split("-");
    else if (dateStr.includes("/")) [day, month, year] = dateStr.split("/");
    if (year.length === 4) year = year.slice(-2);
    return `${day}/${month}/${year}`;
  };

  const parseDate = (str) => {
    if (!str) return new Date(0);
    const [day, month, year] = str.split("/").map(Number);
    return new Date(day, month - 1, 2000 + year);
  };

  const sortResults = (results) =>
    [...results].sort((a, b) => parseDate(a.date) - parseDate(b.date));

  useEffect(() => {
    const loadResults = async () => {
      try {
        // 1️⃣ Load cached results first
        const cached = await localforage.getItem("results");
        if (cached) setResults(sortResults(cached));

        // 2️⃣ Fetch latest from backend
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

    // Optional: automatically update when back online
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
