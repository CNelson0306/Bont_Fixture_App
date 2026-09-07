// src/pages/ResultScreen.jsx
import React, { useEffect, useState } from "react";
import localforage from "localforage";
import { getResults } from "../api";
import { useNavigate } from "react-router-dom";

// ─── helpers ───────────────────────────────────────────────────────────────

const parseDate = (str) => {
  if (!str) return new Date(0);
  if (str.includes("-")) return new Date(str);
  const [day, month, yearRaw] = str.split("/").map(Number);
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
  return new Date(year, month - 1, day);
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

const getBontOutcome = (fixture = "", homeScore, awayScore) => {
  const h = Number(homeScore), a = Number(awayScore);
  if (isNaN(h) || isNaN(a)) return null;
  const [home, away] = fixture.split(" vs ").map((s) => s.trim());
  const bontIsHome = home.toLowerCase().includes("bont");
  const bontIsAway = away?.toLowerCase().includes("bont");
  if (!bontIsHome && !bontIsAway) return null;
  const bontScore  = bontIsHome ? h : a;
  const otherScore = bontIsHome ? a : h;
  if (bontScore > otherScore) return { label: "Win",  cls: "result-card__outcome--win" };
  if (bontScore < otherScore) return { label: "Loss", cls: "result-card__outcome--loss" };
  return                             { label: "Draw", cls: "result-card__outcome--draw" };
};

const calcRecord = (results) => {
  let wins = 0, losses = 0, draws = 0;
  for (const item of results) {
    const outcome = getBontOutcome(item.fixture, item.homeScore, item.awayScore);
    if (!outcome) continue;
    if (outcome.label === "Win")  wins++;
    if (outcome.label === "Loss") losses++;
    if (outcome.label === "Draw") draws++;
  }
  return { wins, losses, draws };
};

// ─── component ─────────────────────────────────────────────────────────────

export default function ResultScreen() {
  const navigate = useNavigate();
  const [results, setResults] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const cached = await localforage.getItem("results");
      if (cached && !cancelled) {
        setResults(sortResults(cached));
        setLoading(false);
      }
      if (navigator.onLine) {
        try {
          const latest = await getResults();
          if (!cancelled) {
            setResults(sortResults(latest));
            setLoading(false);
            await localforage.setItem("results", latest);
          }
        } catch (err) {
          console.error("Error loading results:", err);
          if (!cancelled) setLoading(false);
        }
      } else {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    const handleOnline = async () => {
      try {
        const latest = await getResults();
        if (!cancelled) {
          setResults(sortResults(latest));
          await localforage.setItem("results", latest);
        }
      } catch (err) {
        console.error("Error syncing results:", err);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => {
      cancelled = true;
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  const record = calcRecord(results);
  const played = record.wins + record.losses + record.draws;

  return (
    <div className="page">
      <header className="page__header">
        <button className="page__back" onClick={() => navigate(-1)}>Back</button>
        <h1 className="page__title">Results</h1>
        <div className="page__title-spacer" />
      </header>

      {loading ? (
        <div className="loading-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton skeleton--card" style={{ height: 110 }} />
          ))}
        </div>
      ) : results.length === 0 ? (
        <p className="state-message">No results recorded yet.</p>
      ) : (
        <div className="page__body">

          {/* ── Season record bar ── */}
          {played > 0 && (
            <div className="record__bar">
              <div className="record__pill record__pill--played">
                <span className="record__pill-num">{played}</span>
                <span className="record__pill-label">Played</span>
              </div>
              <div className="record__pill record__pill--win">
                <span className="record__pill-num">{record.wins}</span>
                <span className="record__pill-label">Won</span>
              </div>
              <div className="record__pill record__pill--draw">
                <span className="record__pill-num">{record.draws}</span>
                <span className="record__pill-label">Drawn</span>
              </div>
              <div className="record__pill record__pill--loss">
                <span className="record__pill-num">{record.losses}</span>
                <span className="record__pill-label">Lost</span>
              </div>
            </div>
          )}

          {results.map((item) => {
            const [homeTeam, awayTeam] = item.fixture
              ? item.fixture.split(" vs ").map((s) => s.trim())
              : ["—", "—"];

            const outcome = getBontOutcome(item.fixture, item.homeScore, item.awayScore);
            const hasFooter = (item.scorers && item.scorers.length > 0) || item.manOfMatch;

            return (
              <div key={item._id} className="result-card">
                <div className="result-card__header">
                  <span className="result-card__date">{formatDate(item.date)}</span>
                  {outcome && (
                    <span className={`result-card__outcome ${outcome.cls}`}>
                      {outcome.label}
                    </span>
                  )}
                </div>

                <div className="result-card__scoreboard">
                  <div className="result-card__team-block">
                    <span className="result-card__team-name">{homeTeam}</span>
                    <span className="result-card__score">{item.homeScore ?? "–"}</span>
                  </div>
                  <div className="result-card__scores-center">
                    <span className="result-card__sep">–</span>
                  </div>
                  <div className="result-card__team-block result-card__team-block--away">
                    <span className="result-card__team-name">{awayTeam}</span>
                    <span className="result-card__score">{item.awayScore ?? "–"}</span>
                  </div>
                </div>

                {hasFooter && (
                  <div className="result-card__footer">
                    {item.scorers && item.scorers.length > 0 && (
                      <div>
                        <p className="result-card__scorers-label">Point Scorers</p>
                        <ul className="result-card__scorers-list">
                          {item.scorers.map((s, i) => (
                            <li key={i} className="result-card__scorer-pill">
                              {s.name} · {s.points}pts
                            </li>
                          ))}
                        </ul>
                      </div>
                    )}
                    {item.manOfMatch && (Array.isArray(item.manOfMatch) ? item.manOfMatch.length > 0 : true) && (
                      <div>
                        <p className="result-card__mom-label">
                          {Array.isArray(item.manOfMatch) && item.manOfMatch.length > 1
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
                  </div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
