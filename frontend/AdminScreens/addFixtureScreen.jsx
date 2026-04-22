// src/pages/AddFixtureScreen.jsx
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addFixture } from "../api";
import localforage from "localforage";

const formatDate = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year.slice(-2)}`;
};

const sortFixtures = (fixtures) =>
  [...fixtures].sort((a, b) => {
    const parse = (d) => {
      const [day, month, year] = d.split("/").map(Number);
      return new Date(2000 + year, month - 1, day);
    };
    return parse(a.date) - parse(b.date);
  });

export default function AddFixtureScreen() {
  const navigate = useNavigate();

  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSave = async () => {
    setError("");
    if (!homeTeam.trim() || !awayTeam.trim() || !venue.trim() || !date) {
      setError("All fields are required.");
      return;
    }

    setSaving(true);
    const fixturePayload = {
      home: homeTeam.trim(),
      away: awayTeam.trim(),
      venue: venue.trim(),
      date: formatDate(date),
    };

    try {
      const response = await addFixture(fixturePayload);
      if (response) {
        const cached = (await localforage.getItem("fixtures")) || [];
        await localforage.setItem(
          "fixtures",
          sortFixtures([...cached, fixturePayload]),
        );

        setSaved(true);
        setTimeout(() => navigate(-1), 900);
      } else {
        setError("Could not save fixture. Please try again.");
      }
    } catch (err) {
      console.error("Error saving fixture:", err);
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
        <h1 className="page__title">Add Fixture</h1>
        <div className="page__title-spacer" />
      </header>

      <div className="form__body">
        <div className="form__card">
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

          <div className="form__field">
            <label className="form__label" htmlFor="home">
              Home Team
            </label>
            <input
              id="home"
              className="input"
              type="text"
              placeholder="e.g. Bont RFC"
              value={homeTeam}
              onChange={(e) => {
                setHomeTeam(e.target.value);
                setError("");
              }}
            />
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="away">
              Away Team
            </label>
            <input
              id="away"
              className="input"
              type="text"
              placeholder="e.g. Neath RFC"
              value={awayTeam}
              onChange={(e) => {
                setAwayTeam(e.target.value);
                setError("");
              }}
            />
          </div>

          <div className="form__field">
            <label className="form__label" htmlFor="venue">
              Venue
            </label>
            <input
              id="venue"
              className="input"
              type="text"
              placeholder="e.g. Home"
              value={venue}
              onChange={(e) => {
                setVenue(e.target.value);
                setError("");
              }}
            />
          </div>

          {error && <p className="form__error">{error}</p>}

          <button
            className={`btn btn--primary form__submit ${saved ? "form__submit--saved" : ""}`}
            onClick={handleSave}
            disabled={saving || saved}
          >
            {saved ? "✓ Saved!" : saving ? "Saving…" : "Save Fixture"}
          </button>
        </div>
      </div>
    </div>
  );
}
