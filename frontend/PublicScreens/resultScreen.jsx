import React, { useEffect, useState } from "react";
import { getResults } from "../api";
import { useNavigate } from "react-router-dom";
import "../src/index.css";

export default function ResultScreen() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);

  const parseDate = (str) => {
    if (!str) return new Date(0); // put undated results at the start
    const [day, month, year] = str.split("/").map(Number);
    return new Date(day, month - 1, 2000 + year);
  };

  const sortResults = (results) =>
    [...results].sort((a, b) => parseDate(a.date) - parseDate(b.date));

  useEffect(() => {
    getResults().then((data) => {
      console.log("Results from backend", data);
      setResults(sortResults(data));
    });
  }, []);

  return (
    <div className="results-container">
      <button className="top-back-button" onClick={() => navigate(-1)}>
        ◀ Back
      </button>

      {results.map((item) => {
        const [homeTeam, awayTeam] = item.fixture.split(" vs ");
        return (
          <div key={item._id} className="result-card">
            <div className="result-date">
              {item.date ? item.date : "Date not available"}
            </div>

            <div className="teams-row">
              <span className="team-text">{homeTeam}</span>
              <span className="team-text">{awayTeam}</span>
            </div>

            <div className="scores-row">
              <span className="score">{item.homeScore}</span>
              <span className="score">{item.awayScore}</span>
            </div>

            {/* ✅ Scorers List */}
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
