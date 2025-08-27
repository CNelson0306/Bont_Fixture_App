import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addFixture } from "../api";
import "../src/index.css";

export default function AddFixtureScreen() {
  const navigate = useNavigate();

  const [homeTeam, setHomeTeam] = useState("");
  const [awayTeam, setAwayTeam] = useState("");
  const [venue, setVenue] = useState("");
  const [date, setDate] = useState("");

  const handleSave = async () => {
    if (!homeTeam || !awayTeam || !venue || !date) {
      alert("All fields (including Date) are required!");
      return;
    }

    const fixturePayload = {
      home: homeTeam,
      away: awayTeam,
      venue,
      date, // already in YYYY-MM-DD format from input[type=date]
    };

    const response = await addFixture(fixturePayload);
    if (response) {
      alert("Fixture saved!");
      setHomeTeam("");
      setAwayTeam("");
      setVenue("");
      setDate("");
    } else {
      alert("Error: Could not save fixture.");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Add Fixture</h1>

      {/* Date Picker */}
      <input
        type="date"
        className="input"
        value={date}
        onChange={(e) => setDate(e.target.value)}
        placeholder="Select Date:"
      />

      {/* Inputs */}
      <input
        className="input"
        type="text"
        placeholder="Home Team"
        value={homeTeam}
        onChange={(e) => setHomeTeam(e.target.value)}
      />
      <input
        className="input"
        type="text"
        placeholder="Away Team"
        value={awayTeam}
        onChange={(e) => setAwayTeam(e.target.value)}
      />
      <input
        className="input"
        type="text"
        placeholder="Venue"
        value={venue}
        onChange={(e) => setVenue(e.target.value)}
      />

      {/* Buttons */}
      <button className="button primary" onClick={handleSave}>
        Save Fixture
      </button>

      <button className="button secondary" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
}
