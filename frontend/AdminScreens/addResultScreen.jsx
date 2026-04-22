// src/pages/AddResultScreen.jsx
import React, { useState, useEffect, useRef } from "react";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";
import { addResult } from "../api";

// ─── Squad list — keep alphabetical by first name ──────────────
const SQUAD = [
  "Aiden Giddings",
  "Alfie Reynolds",
  "Cory Laidler",
  "Ethan King",
  "Evan Meadham",
  "Finley Miller",
  "Ieuan Cox",
  "Jacko Davies",
  "Jacob Davies",
  "Kayne Hopkins",
  "Kian Nelson",
  "Kyle Masurier",
  "Leo Morgan",
  "Macauley Phillips",
  "Mason Quick",
  "Osian Moses",
  "Rhys James",
  "Rio Lindsay",
  "Steffan De Silva",
  "Thomas Collins",
  "Tom Richards",
  "Tomos Walters",
  "Tyler Lewis",
  "Unknown",
  "REF",
  "Team",
];

// ─── Man of the Match candidates ───────────────────────────────
const MOM_LIST = [...SQUAD, "Ref", "Team", "Unknown"];

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year.slice(-2)}`;
};

export default function AddResultScreen() {
  const navigate = useNavigate();

  const [fixture, setFixture] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [manOfMatch, setManOfMatch] = useState([]); // array — supports joint MoM
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const [scorers, setScorers] = useState([]);
  const [search, setSearch] = useState("");
  const [activePlayer, setActivePlayer] = useState(null);
  const [pointsInput, setPointsInput] = useState("");
  const pointsRef = useRef(null);

  const [momSearch, setMomSearch] = useState("");

  // ─── offline queue sync ───────────────────────────────────────
  useEffect(() => {
    const sync = async () => {
      if (!navigator.onLine) return;
      const queued = (await localforage.getItem("queuedResults")) || [];
      for (const result of queued) {
        try {
          await addResult(result);
        } catch (e) {
          console.error(e);
        }
      }
      await localforage.setItem("queuedResults", []);
    };
    window.addEventListener("online", sync);
    sync();
    return () => window.removeEventListener("online", sync);
  }, []);

  useEffect(() => {
    if (activePlayer && pointsRef.current) pointsRef.current.focus();
  }, [activePlayer]);

  // ─── scorer helpers ───────────────────────────────────────────
  const filtered = SQUAD.filter((name) =>
    name.toLowerCase().includes(search.toLowerCase()),
  );

  const togglePlayer = (name) => {
    if (activePlayer === name) {
      setActivePlayer(null);
      setPointsInput("");
      return;
    }
    const existing = scorers.find((s) => s.name === name);
    setActivePlayer(name);
    setPointsInput(existing ? String(existing.points) : "");
  };

  const confirmPoints = (name) => {
    const pts = parseInt(pointsInput, 10);
    if (!pointsInput || isNaN(pts) || pts <= 0) {
      setScorers((prev) => prev.filter((s) => s.name !== name));
    } else {
      setScorers((prev) => {
        const without = prev.filter((s) => s.name !== name);
        return [...without, { name, points: pts }];
      });
    }
    setActivePlayer(null);
    setPointsInput("");
    setSearch("");
  };

  const removeScorer = (name) =>
    setScorers((prev) => prev.filter((s) => s.name !== name));

  // ─── save ─────────────────────────────────────────────────────
  const handleSave = async () => {
    setError("");
    if (
      !fixture.trim() ||
      !homeScore ||
      !awayScore ||
      manOfMatch.length === 0 ||
      !date
    ) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    const result = {
      fixture: fixture.trim(),
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      manOfMatch: manOfMatch.join(" & "), // stored as string
      date: formatDate(date),
      scorers,
    };
    try {
      if (navigator.onLine) {
        const response = await addResult(result);
        if (!response) {
          setError("Could not save result. Please try again.");
          setSaving(false);
          return;
        }
      } else {
        const queued = (await localforage.getItem("queuedResults")) || [];
        queued.push(result);
        await localforage.setItem("queuedResults", queued);
      }
      setSaved(true);
      setTimeout(() => navigate(-1), 900);
    } catch (err) {
      console.error(err);
      setError("Something went wrong. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <button className="page__back" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1 className="page__title">Add Result</h1>
        <div className="page__title-spacer" />
      </header>

      <div className="form__body">
        <div className="form__card">
          {/* Date */}
          <div className="form__field">
            <label className="form__label" htmlFor="date">
              Date
            </label>
            <input
              id="date"
              className="input"
              type="date"
              value={date}
              onChange={(e) => {
                setDate(e.target.value);
                setError("");
              }}
            />
          </div>

          {/* Fixture */}
          <div className="form__field">
            <label className="form__label" htmlFor="fixture">
              Fixture
            </label>
            <input
              id="fixture"
              className="input"
              type="text"
              placeholder="e.g. Bont RFC vs Neath RFC"
              value={fixture}
              onChange={(e) => {
                setFixture(e.target.value);
                setError("");
              }}
            />
          </div>

          {/* Scores */}
          <div className="form__row">
            <div className="form__field">
              <label className="form__label" htmlFor="home-score">
                Home
              </label>
              <input
                id="home-score"
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={homeScore}
                onChange={(e) => {
                  setHomeScore(e.target.value);
                  setError("");
                }}
              />
            </div>
            <div className="form__field">
              <label className="form__label" htmlFor="away-score">
                Away
              </label>
              <input
                id="away-score"
                className="input"
                type="number"
                min="0"
                placeholder="0"
                value={awayScore}
                onChange={(e) => {
                  setAwayScore(e.target.value);
                  setError("");
                }}
              />
            </div>
          </div>

          {/* ── Point Scorers ── */}
          <div className="form__field">
            <label className="form__label">Point Scorers</label>

            {/* selected chips */}
            {scorers.length > 0 && (
              <div className="scorer-chips">
                {scorers.map((s) => (
                  <div key={s.name} className="scorer-chip">
                    <span>
                      {s.name} · {s.points}pts
                    </span>
                    <button
                      className="scorer-chip__remove"
                      onClick={() => removeScorer(s.name)}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* search bar */}
            <div className="scorer-search-wrap">
              <span className="scorer-search-icon">🔍</span>
              <input
                className="input scorer-search-input"
                type="text"
                placeholder="Search player…"
                value={search}
                onChange={(e) => {
                  setSearch(e.target.value);
                  setActivePlayer(null);
                  setPointsInput("");
                }}
              />
              {search.length > 0 && (
                <button
                  className="scorer-search-clear"
                  onClick={() => {
                    setSearch("");
                    setActivePlayer(null);
                    setPointsInput("");
                  }}
                >
                  ✕
                </button>
              )}
            </div>

            {/* results — only shown while searching */}
            {search.length > 0 && (
              <div className="player-list">
                {filtered.length === 0 ? (
                  <p className="player-list__empty">No players found</p>
                ) : (
                  filtered.map((name) => {
                    const isScorer = scorers.some((s) => s.name === name);
                    const isActive = activePlayer === name;
                    return (
                      <div key={name} className="player-tile-wrap">
                        <button
                          className={`player-tile ${isScorer ? "player-tile--scored" : ""} ${isActive ? "player-tile--active" : ""}`}
                          onClick={() => togglePlayer(name)}
                        >
                          <span className="player-tile__name">{name}</span>
                          {isScorer && !isActive && (
                            <span className="player-tile__pts">
                              {scorers.find((s) => s.name === name).points}pts
                            </span>
                          )}
                          {!isScorer && !isActive && (
                            <span className="player-tile__add">+ Add pts</span>
                          )}
                        </button>

                        {isActive && (
                          <div className="player-points-row">
                            <input
                              ref={pointsRef}
                              className="input player-points-input"
                              type="number"
                              min="1"
                              placeholder="pts"
                              value={pointsInput}
                              onChange={(e) => setPointsInput(e.target.value)}
                              onKeyDown={(e) =>
                                e.key === "Enter" && confirmPoints(name)
                              }
                            />
                            <button
                              className="btn btn--primary player-points-confirm"
                              onClick={() => confirmPoints(name)}
                            >
                              ✓
                            </button>
                          </div>
                        )}
                      </div>
                    );
                  })
                )}
              </div>
            )}
          </div>

          {/* Man of the Match */}
          <div className="form__field">
            <label className="form__label">Man of the Match</label>

            {/* selected chips — show always so you can add more */}
            {manOfMatch.length > 0 && (
              <div className="scorer-chips">
                {manOfMatch.map((name) => (
                  <div key={name} className="scorer-chip">
                    <span>⭐ {name}</span>
                    <button
                      className="scorer-chip__remove"
                      onClick={() => {
                        setManOfMatch((prev) => prev.filter((n) => n !== name));
                        setError("");
                      }}
                    >
                      ✕
                    </button>
                  </div>
                ))}
              </div>
            )}

            {/* search — always visible so you can add joint MoM */}
            <div className="scorer-search-wrap">
              <span className="scorer-search-icon">🔍</span>
              <input
                className="input scorer-search-input"
                type="text"
                placeholder="Search player…"
                value={momSearch}
                onChange={(e) => {
                  setMomSearch(e.target.value);
                  setError("");
                }}
              />
              {momSearch.length > 0 && (
                <button
                  className="scorer-search-clear"
                  onClick={() => setMomSearch("")}
                >
                  ✕
                </button>
              )}
            </div>

            {momSearch.length > 0 && (
              <div className="player-list">
                {MOM_LIST.filter(
                  (n) =>
                    n.toLowerCase().includes(momSearch.toLowerCase()) &&
                    !manOfMatch.includes(n),
                ).length === 0 ? (
                  <p className="player-list__empty">No players found</p>
                ) : (
                  MOM_LIST.filter(
                    (n) =>
                      n.toLowerCase().includes(momSearch.toLowerCase()) &&
                      !manOfMatch.includes(n),
                  ).map((name) => (
                    <div key={name} className="player-tile-wrap">
                      <button
                        className="player-tile"
                        onClick={() => {
                          setManOfMatch((prev) => [...prev, name]);
                          setMomSearch("");
                          setError("");
                        }}
                      >
                        <span className="player-tile__name">{name}</span>
                        <span className="player-tile__add">Select</span>
                      </button>
                    </div>
                  ))
                )}
              </div>
            )}
          </div>

          {!navigator.onLine && (
            <p className="form__offline-notice">
              📶 Offline — result will sync when back online.
            </p>
          )}

          {error && <p className="form__error">{error}</p>}

          <button
            className={`btn btn--primary form__submit ${saved ? "form__submit--saved" : ""}`}
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saved ? "✓ Saved!" : saving ? "Saving…" : "Save Result"}
          </button>
        </div>
      </div>
    </div>
  );
}
