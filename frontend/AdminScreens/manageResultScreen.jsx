// src/pages/ManageResultsScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResults, deleteResult } from "../api";

const parseDate = (str) => {
  if (!str) return new Date(0);
  if (str.includes("-")) return new Date(str);
  const [day, month, yearRaw] = str.split("/").map(Number);
  return new Date(2000 + yearRaw, month - 1, day);
};

const formatDate = (dateStr) => {
  if (!dateStr) return "TBC";
  const d = parseDate(dateStr);
  if (isNaN(d)) return "TBC";
  return d.toLocaleDateString("en-GB", {
    day: "2-digit",
    month: "short",
    year: "2-digit",
  });
};

const sortResults = (list) =>
  [...list].sort((a, b) => parseDate(b.date) - parseDate(a.date));

// fixture = "Team A vs Team B", determine which side is Bont
const getBontOutcome = (fixture = "", homeScore, awayScore) => {
  const h = Number(homeScore),
    a = Number(awayScore);
  if (isNaN(h) || isNaN(a)) return null;
  const [home, away] = fixture.split(" vs ").map((s) => s.trim());
  const bontIsHome = home.toLowerCase().includes("bont");
  const bontIsAway = away?.toLowerCase().includes("bont");
  if (!bontIsHome && !bontIsAway) return null; // Bont not in fixture
  const bontScore = bontIsHome ? h : a;
  const otherScore = bontIsHome ? a : h;
  if (bontScore > otherScore)
    return { label: "Win", cls: "result-card__outcome--win" };
  if (bontScore < otherScore)
    return { label: "Loss", cls: "result-card__outcome--loss" };
  return { label: "Draw", cls: "result-card__outcome--draw" };
};

export default function ManageResultsScreen() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null);
  const [deleting, setDeleting] = useState(null);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getResults();
        setResults(sortResults(data));
      } catch (err) {
        console.error("Error loading results:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDeleteRequest = (id) => {
    setConfirmDelete(id);
    setTimeout(
      () => setConfirmDelete((cur) => (cur === id ? null : cur)),
      4000,
    );
  };

  const handleDeleteConfirm = async (id) => {
    setDeleting(id);
    try {
      await deleteResult(id);
      setResults((prev) => sortResults(prev.filter((r) => r._id !== id)));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <button className="page__back" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1 className="page__title">Manage Results</h1>
        <div className="page__title-spacer" />
      </header>

      {loading ? (
        <div className="loading-pulse">
          {[...Array(3)].map((_, i) => (
            <div
              key={i}
              className="skeleton skeleton--card"
              style={{ height: 130 }}
            />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="state-message">No results to manage.</p>
      ) : (
        <div className="page__body">
          {results.map((item) => {
            const [homeTeam, awayTeam] = item.fixture
              ? item.fixture.split(" vs ").map((s) => s.trim())
              : ["—", "—"];
            const outcome = getBontOutcome(
              item.fixture,
              item.homeScore,
              item.awayScore,
            );

            return (
              <div key={item._id} className="result-card">
                {/* header */}
                <div className="result-card__header">
                  <span className="result-card__date">
                    {formatDate(item.date)}
                  </span>
                  {outcome && (
                    <span className={`result-card__outcome ${outcome.cls}`}>
                      {outcome.label}
                    </span>
                  )}
                </div>

                {/* scoreboard */}
                <div className="result-card__scoreboard">
                  <div className="result-card__team-block">
                    <span className="result-card__team-name">{homeTeam}</span>
                    <span className="result-card__score">
                      {item.homeScore ?? "–"}
                    </span>
                  </div>
                  <div className="result-card__scores-center">
                    <span className="result-card__sep">–</span>
                  </div>
                  <div className="result-card__team-block result-card__team-block--away">
                    <span className="result-card__team-name">{awayTeam}</span>
                    <span className="result-card__score">
                      {item.awayScore ?? "–"}
                    </span>
                  </div>
                </div>

                {/* scorers + mom */}
                <div className="result-card__footer">
                  {item.scorers && item.scorers.length > 0 && (
                    <div>
                      <p className="result-card__scorers-label">
                        Point Scorers
                      </p>
                      <ul className="result-card__scorers-list">
                        {[...item.scorers]
                          .sort((a, b) => b.points - a.points)
                          .map((s, i) => (
                            <li key={i} className="result-card__scorer-pill">
                              {s.name} · {s.points}pts
                            </li>
                          ))}
                      </ul>
                    </div>
                  )}
                  {item.manOfMatch &&
                    (Array.isArray(item.manOfMatch)
                      ? item.manOfMatch.length > 0
                      : true) && (
                      <div>
                        <p className="result-card__mom-label">
                          {Array.isArray(item.manOfMatch) &&
                          item.manOfMatch.length > 1
                            ? "Men of the Match"
                            : "Man of the Match"}
                        </p>
                        <p className="result-card__mom">
                          {Array.isArray(item.manOfMatch)
                            ? item.manOfMatch.join(" & ")
                            : item.manOfMatch}
                        </p>
                      </div>
                    )}

                  {/* actions */}
                  <div
                    className="manage-card__actions"
                    style={{ marginTop: "0.25rem" }}
                  >
                    <button
                      className="btn manage-card__btn-edit"
                      onClick={() => navigate(`/edit-results/${item._id}`)}
                    >
                      Edit
                    </button>
                    {confirmDelete === item._id ? (
                      <button
                        className="btn manage-card__btn-delete manage-card__btn-delete--confirm"
                        onClick={() => handleDeleteConfirm(item._id)}
                        disabled={deleting === item._id}
                      >
                        {deleting === item._id ? "Deleting…" : "Confirm delete"}
                      </button>
                    ) : (
                      <button
                        className="btn manage-card__btn-delete"
                        onClick={() => handleDeleteRequest(item._id)}
                      >
                        Delete
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
