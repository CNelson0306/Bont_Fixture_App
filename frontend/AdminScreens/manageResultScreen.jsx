import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResults, deleteResult } from "../api"; // adjust path if needed
import "../src/index.css";

export default function ManageResultsScreen() {
  const [results, setResults] = useState([]);
  const navigate = useNavigate();

  const formatDate = (dateStr) => {
    if (!dateStr) return "Date not available";

    let day, month, year;

    // if it's ISO format "yyyy-mm-dd"
    if (dateStr.includes("-")) {
      [year, month, day] = dateStr.split("-");
    }
    // if it's already "dd/mm/yy"
    else if (dateStr.includes("/")) {
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

  const sortResults = (results) =>
    [...results].sort((a, b) => parseDate(a.date) - parseDate(b.date));

  const loadResults = async () => {
    try {
      const data = await getResults();
      setResults(sortResults(data));
    } catch (err) {
      console.error("Error loading results:", err);
    }
  };

  useEffect(() => {
    loadResults();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this result?")) {
      try {
        await deleteResult(id);
        loadResults();
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  return (
    <div className="results-container">
      <button className="top-back-button" onClick={() => navigate(-1)}>
        ◀ Back
      </button>

      <h2 className="title">Manage Results</h2>

      {results.map((item) => {
        const [homeTeam, awayTeam] = item.fixture.split(" vs ");
        return (
          <div key={item._id} className="result-card">
            {/* Date */}
            <p className="result-date">{formatDate(item.date) || "Date N/A"}</p>

            {/* Teams */}
            <div className="teams-row">
              <p className="team-text">{homeTeam}</p>
              <p className="team-text">{awayTeam}</p>
            </div>

            {/* Scores */}
            <div className="scores-row">
              <p className="score">{item.homeScore}</p>
              <p className="score">{item.awayScore}</p>
            </div>

            {/* ✅ Scorers List */}
            {item.scorers && item.scorers.length > 0 ? (
              <div className="manage-scorers">
                <h4>Point Scorers</h4>
                <ul
                  style={{ listStyle: "none", paddingLeft: 0, marginLeft: 0 }}
                >
                  {item.scorers
                    .sort((a, b) => b.points - a.points)
                    .map((scorer, index) => (
                      <li key={index}>
                        {scorer.name} - {scorer.points} pts
                      </li>
                    ))}
                </ul>
              </div>
            ) : (
              <p>No scorers recorded</p>
            )}

            {/* Man of the Match */}
            <p className="mom-text">Man of the Match - {item.manOfMatch}</p>

            {/* Actions */}
            <div className="actions">
              <button
                className="button edit"
                onClick={() => navigate(`/edit-results/${item._id}`)}
              >
                Edit
              </button>
              <button
                className="button danger"
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
}
