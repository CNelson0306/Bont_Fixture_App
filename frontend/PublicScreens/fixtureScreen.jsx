// src/pages/FixtureScreen.jsx
import React, { useEffect, useState } from "react";
import localforage from "localforage";
import { getFixtures } from "../api";
import { useNavigate } from "react-router-dom";

// ─── helpers ───────────────────────────────────────────────────────────────

const parseDate = (str) => {
  if (!str) return new Date(0);
  if (str.includes("-")) {
    // ISO: YYYY-MM-DD
    return new Date(str);
  }
  // European: DD/MM/YY or DD/MM/YYYY
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

const sortFixtures = (list) =>
  [...list].sort((a, b) => parseDate(a.date) - parseDate(b.date));

// Split "Team A vs Team B" safely, falling back to the raw string.
const splitTeams = (fixture = "") => {
  const parts = fixture.split(" vs ");
  return parts.length >= 2
    ? [parts[0].trim(), parts.slice(1).join(" vs ").trim()]
    : [fixture, ""];
};

// ─── component ─────────────────────────────────────────────────────────────

export default function FixtureScreen() {
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      // 1. Show cached data immediately — feels instant.
      const cached = await localforage.getItem("fixtures");
      if (cached && !cancelled) {
        setFixtures(sortFixtures(cached));
        setLoading(false);
      }

      // 2. Fetch fresh data in the background.
      if (navigator.onLine) {
        try {
          const latest = await getFixtures();
          if (!cancelled) {
            setFixtures(sortFixtures(latest));
            setLoading(false);
            await localforage.setItem("fixtures", latest);
          }
        } catch (err) {
          console.error("Error loading fixtures:", err);
          if (!cancelled) setLoading(false);
        }
      } else {
        if (!cancelled) setLoading(false);
      }
    };

    load();

    const handleOnline = async () => {
      try {
        const latest = await getFixtures();
        if (!cancelled) {
          setFixtures(sortFixtures(latest));
          await localforage.setItem("fixtures", latest);
        }
      } catch (err) {
        console.error("Error syncing fixtures:", err);
      }
    };

    window.addEventListener("online", handleOnline);
    return () => {
      cancelled = true;
      window.removeEventListener("online", handleOnline);
    };
  }, []);

  return (
    <div className="page">
      <header className="page__header">
        <button className="page__back" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1 className="page__title">Fixtures</h1>
        <div className="page__title-spacer" />
      </header>

      {loading ? (
        <div className="loading-pulse">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="skeleton skeleton--card" />
          ))}
        </div>
      ) : fixtures.length === 0 ? (
        <p className="state-message">No fixtures scheduled yet.</p>
      ) : (
        <div className="page__body">
          {fixtures.map((item) => {
            const [home, away] = item.fixture
              ? splitTeams(item.fixture)
              : [item.home, item.away];

            return (
              <div key={item._id} className="fixture-card">
                <div className="fixture-card__meta">
                  <span className="fixture-card__date">
                    {formatDate(item.date)}
                  </span>
                  {item.venue && (
                    <span className="fixture-card__venue">{item.venue}</span>
                  )}
                </div>
                <div className="fixture-card__teams">
                  <span className="fixture-card__team">
                    {home || item.home || "—"}
                  </span>
                  <span className="fixture-card__vs">vs</span>
                  <span className="fixture-card__team fixture-card__team--away">
                    {away || item.away || "—"}
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
