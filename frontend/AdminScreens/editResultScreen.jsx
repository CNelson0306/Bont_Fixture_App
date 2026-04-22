// src/pages/EditResultScreen.jsx
import React, { useEffect, useState, useRef } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateResult, deleteResult, getResultById } from "../api";

// ─── Squad list ─────────────────────────────────────────────────
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

const MOM_LIST = [...SQUAD, "Ref", "Team", "Unknown"];

// ─── Date helpers ────────────────────────────────────────────────
const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  if (dateStr.includes("-")) return dateStr;
  const [day, month, yearRaw] = dateStr.split("/").map(Number);
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

const fromInputDate = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year.slice(-2)}`;
};

export default function EditResultScreen() {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [fixture, setFixture] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [manOfMatch, setManOfMatch] = useState([]); // array — supports joint MoM
  const [date, setDate] = useState("");
  const [scorers, setScorers] = useState([]); // [{ name, points }]

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  // scorer search
  const [search, setSearch] = useState("");
  const [activePlayer, setActivePlayer] = useState(null);
  const [pointsInput, setPointsInput] = useState("");
  const pointsRef = useRef(null);

  // MoM search
  const [momSearch, setMomSearch] = useState("");

  // ─── load ──────────────────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const data = await getResultById(resultId);
        if (!data) throw new Error("Result not found");
        setFixture(data.fixture || "");
        setHomeScore(data.homeScore?.toString() || "");
        setAwayScore(data.awayScore?.toString() || "");
        // manOfMatch stored as string — split on " & " to get array
        const mom = data.manOfMatch || "";
        setManOfMatch(
          Array.isArray(mom)
            ? mom
            : mom
              ? mom
                  .split(" & ")
                  .map((s) => s.trim())
                  .filter(Boolean)
              : [],
        );
        setDate(data.date || "");
        setScorers(
          (data.scorers || []).map((s) => ({
            name: s.name,
            points: Number(s.points) || 0,
          })),
        );
      } catch (err) {
        console.error(err);
        setError("Failed to load result.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [resultId]);

  useEffect(() => {
    if (activePlayer && pointsRef.current) pointsRef.current.focus();
  }, [activePlayer]);

  // ─── scorer helpers ────────────────────────────────────────────
  const filtered = SQUAD.filter((n) =>
    n.toLowerCase().includes(search.toLowerCase()),
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

  // ─── save ──────────────────────────────────────────────────────
  const handleUpdate = async () => {
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
    try {
      await updateResult(resultId, {
        fixture: fixture.trim(),
        homeScore: Number(homeScore),
        awayScore: Number(awayScore),
        manOfMatch: manOfMatch.join(" & "), // stored as string
        date: date.includes("-") ? fromInputDate(date) : date,
        scorers,
      });
      setSaved(true);
      setTimeout(() => navigate(-1), 900);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update result.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = () => {
    setConfirmDelete(true);
    setTimeout(() => setConfirmDelete(false), 4000);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      await deleteResult(resultId);
      navigate(-1);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete result.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <button className="page__back" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1 className="page__title">Edit Result</h1>
        <div className="page__title-spacer" />
      </header>

      {loading ? (
        <div className="loading-pulse">
          <div className="skeleton skeleton--card" style={{ height: 480 }} />
        </div>
      ) : (
        <div className="form__body">
          <div className="form__card">
            {/* Date */}
            <div className="form__field">
              <label className="form__label" htmlFor="edit-date">
                Date
              </label>
              <input
                id="edit-date"
                className="input"
                type="date"
                value={toInputDate(date)}
                onChange={(e) => {
                  setDate(fromInputDate(e.target.value));
                  setError("");
                }}
              />
            </div>

            {/* Fixture */}
            <div className="form__field">
              <label className="form__label" htmlFor="edit-fixture">
                Fixture
              </label>
              <input
                id="edit-fixture"
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
                <label className="form__label" htmlFor="edit-home">
                  Home
                </label>
                <input
                  id="edit-home"
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
                <label className="form__label" htmlFor="edit-away">
                  Away
                </label>
                <input
                  id="edit-away"
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
                              <span className="player-tile__add">
                                + Add pts
                              </span>
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

            {/* ── Man of the Match ── */}
            <div className="form__field">
              <label className="form__label">Man of the Match</label>

              {manOfMatch.length > 0 && (
                <div className="scorer-chips">
                  {manOfMatch.map((name) => (
                    <div key={name} className="scorer-chip">
                      <span>⭐ {name}</span>
                      <button
                        className="scorer-chip__remove"
                        onClick={() => {
                          setManOfMatch((prev) =>
                            prev.filter((n) => n !== name),
                          );
                          setError("");
                        }}
                      >
                        ✕
                      </button>
                    </div>
                  ))}
                </div>
              )}

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

            {error && <p className="form__error">{error}</p>}

            <button
              className={`btn btn--primary form__submit ${saved ? "form__submit--saved" : ""}`}
              onClick={handleUpdate}
              disabled={saving || saved}
            >
              {saved ? "✓ Updated!" : saving ? "Saving…" : "Update Result"}
            </button>

            <div className="edit__divider" />

            {confirmDelete ? (
              <button
                className="btn manage-card__btn-delete manage-card__btn-delete--confirm"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                style={{ width: "100%" }}
              >
                {deleting ? "Deleting…" : "Tap again to confirm delete"}
              </button>
            ) : (
              <button
                className="btn manage-card__btn-delete"
                onClick={handleDeleteRequest}
                style={{ width: "100%" }}
              >
                Delete Result
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
