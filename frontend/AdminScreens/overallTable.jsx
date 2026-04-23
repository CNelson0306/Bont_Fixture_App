// src/pages/StandingsScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getResults, saveArchive, getArchives } from "../api";

// ─── Build standings from results array ────────────────────────
const buildStandings = (results) => {
  const map = {};

  for (const result of results) {
    // Points scorers
    for (const scorer of result.scorers || []) {
      if (!scorer.name) continue;
      if (!map[scorer.name])
        map[scorer.name] = { name: scorer.name, points: 0, mom: 0 };
      map[scorer.name].points += Number(scorer.points) || 0;
    }
    // Man of the Match — normalise to array (old data may be a string)
    const momRaw = result.manOfMatch;
    const momList = Array.isArray(momRaw) ? momRaw : momRaw ? [momRaw] : [];
    for (const mom of momList) {
      const name = mom.trim();
      if (!name) continue;
      if (!map[name]) map[name] = { name, points: 0, mom: 0 };
      map[name].mom += 1;
    }
  }

  return Object.values(map).sort((a, b) => {
    if (b.points !== a.points) return b.points - a.points;
    if (b.mom !== a.mom) return b.mom - a.mom;
    return a.name.localeCompare(b.name);
  });
};

const TABS = ["Standings", "Archives"];

export default function OverallTable() {
  const navigate = useNavigate();

  const [tab, setTab] = useState("Standings");
  const [standings, setStandings] = useState([]);
  const [archives, setArchives] = useState([]);
  const [loading, setLoading] = useState(true);
  const [archLoading, setArchLoading] = useState(false);
  const [error, setError] = useState("");

  // archive form
  const [seasonLabel, setSeasonLabel] = useState("");
  const [archiving, setArchiving] = useState(false);
  const [confirmReset, setConfirmReset] = useState(false);
  const [archiveSaved, setArchiveSaved] = useState(false);

  // expanded archive row
  const [expandedArch, setExpandedArch] = useState(null);

  // ─── load standings ─────────────────────────────────────────
  useEffect(() => {
    const load = async () => {
      try {
        const results = await getResults();
        setStandings(buildStandings(results));
      } catch (err) {
        console.error(err);
        setError("Failed to load standings.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  // ─── load archives when tab switches ───────────────────────
  useEffect(() => {
    if (tab !== "Archives") return;
    const load = async () => {
      setArchLoading(true);
      try {
        const data = await getArchives();
        setArchives(data || []);
      } catch (err) {
        console.error(err);
        setError("Failed to load archives.");
      } finally {
        setArchLoading(false);
      }
    };
    load();
  }, [tab]);

  // ─── archive & reset ────────────────────────────────────────
  const handleArchive = async () => {
    setError("");
    if (!seasonLabel.trim()) {
      setError("Please enter a season label (e.g. 2024/25).");
      return;
    }
    if (!confirmReset) {
      setConfirmReset(true);
      setTimeout(() => setConfirmReset(false), 5000);
      return;
    }
    setArchiving(true);
    try {
      await saveArchive({
        season: seasonLabel.trim(),
        standings: standings,
        createdAt: new Date().toISOString(),
      });
      setArchiveSaved(true);
      setConfirmReset(false);
      setSeasonLabel("");
      setTimeout(() => setArchiveSaved(false), 3000);
    } catch (err) {
      console.error(err);
      setError("Failed to save archive. Please try again.");
    } finally {
      setArchiving(false);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <button className="page__back" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1 className="page__title">Standings</h1>
        <div className="page__title-spacer" />
      </header>

      {/* Tab bar */}
      <div className="standings__tabs">
        {TABS.map((t) => (
          <button
            key={t}
            className={`standings__tab ${tab === t ? "standings__tab--active" : ""}`}
            onClick={() => {
              setTab(t);
              setError("");
            }}
          >
            {t}
          </button>
        ))}
      </div>

      {/* ── STANDINGS TAB ── */}
      {tab === "Standings" && (
        <div className="page__body">
          {loading ? (
            <div className="loading-pulse">
              {[...Array(5)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton skeleton--card"
                  style={{ height: 52 }}
                />
              ))}
            </div>
          ) : standings.length === 0 ? (
            <p className="state-message">
              No results recorded yet — standings will appear once results are
              added.
            </p>
          ) : (
            <>
              {/* Table header */}
              <div className="standings__header-row">
                <span className="standings__col-rank">#</span>
                <span className="standings__col-name">Player</span>
                <span className="standings__col-stat">Pts</span>
                <span className="standings__col-stat">MoM</span>
              </div>

              {standings.map((player, index) => (
                <div
                  key={player.name}
                  className={`standings__row ${index === 0 ? "standings__row--top" : ""}`}
                >
                  <span className="standings__col-rank">
                    {index === 0 ? "🏆" : index + 1}
                  </span>
                  <span className="standings__col-name">{player.name}</span>
                  <span className="standings__col-stat standings__col-stat--pts">
                    {player.points}
                  </span>
                  <span className="standings__col-stat">
                    {player.mom > 0 ? `${player.mom}x` : "—"}
                  </span>
                </div>
              ))}

              {/* Archive section */}
              <div className="standings__archive-box">
                <p className="standings__archive-title">Archive This Season</p>
                <p className="standings__archive-hint">
                  Saves a snapshot of standings for future reference.
                </p>
                <div className="form__field">
                  <label className="form__label" htmlFor="season-label">
                    Season Label
                  </label>
                  <input
                    id="season-label"
                    className="input"
                    type="text"
                    placeholder="e.g. 2024/25"
                    value={seasonLabel}
                    onChange={(e) => {
                      setSeasonLabel(e.target.value);
                      setError("");
                      setConfirmReset(false);
                    }}
                  />
                </div>

                {error && <p className="form__error">{error}</p>}

                {archiveSaved && (
                  <p className="standings__archive-success">
                    ✓ Season archived successfully!
                  </p>
                )}

                <button
                  className={`btn ${confirmReset ? "manage-card__btn-delete manage-card__btn-delete--confirm" : "btn--outline"} standings__archive-btn`}
                  onClick={handleArchive}
                  disabled={archiving}
                >
                  {archiving
                    ? "Archiving…"
                    : confirmReset
                      ? "⚠️ Confirm — this cannot be undone"
                      : "Archive Season"}
                </button>
              </div>
            </>
          )}
        </div>
      )}

      {/* ── ARCHIVES TAB ── */}
      {tab === "Archives" && (
        <div className="page__body">
          {archLoading ? (
            <div className="loading-pulse">
              {[...Array(3)].map((_, i) => (
                <div
                  key={i}
                  className="skeleton skeleton--card"
                  style={{ height: 64 }}
                />
              ))}
            </div>
          ) : archives.length === 0 ? (
            <p className="state-message">No archived seasons yet.</p>
          ) : (
            archives
              .slice()
              .reverse()
              .map((arch) => (
                <div key={arch._id} className="archive__card">
                  <button
                    className="archive__card-header"
                    onClick={() =>
                      setExpandedArch(
                        expandedArch === arch._id ? null : arch._id,
                      )
                    }
                  >
                    <span className="archive__season">{arch.season}</span>
                    <span className="archive__meta">
                      {arch.standings?.length ?? 0} players ·{" "}
                      {arch.createdAt
                        ? new Date(arch.createdAt).toLocaleDateString("en-GB", {
                            day: "2-digit",
                            month: "short",
                            year: "numeric",
                          })
                        : ""}
                    </span>
                    <span className="archive__chevron">
                      {expandedArch === arch._id ? "▲" : "▼"}
                    </span>
                  </button>

                  {expandedArch === arch._id && (
                    <div className="archive__body">
                      <div className="standings__header-row">
                        <span className="standings__col-rank">#</span>
                        <span className="standings__col-name">Player</span>
                        <span className="standings__col-stat">Pts</span>
                        <span className="standings__col-stat">MoM</span>
                      </div>
                      {(arch.standings || []).map((p, i) => (
                        <div
                          key={p.name}
                          className={`standings__row ${i === 0 ? "standings__row--top" : ""}`}
                        >
                          <span className="standings__col-rank">
                            {i === 0 ? "🏆" : i + 1}
                          </span>
                          <span className="standings__col-name">{p.name}</span>
                          <span className="standings__col-stat standings__col-stat--pts">
                            {p.points}
                          </span>
                          <span className="standings__col-stat">
                            {p.mom > 0 ? `${p.mom}x` : "—"}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              ))
          )}
        </div>
      )}
    </div>
  );
}
