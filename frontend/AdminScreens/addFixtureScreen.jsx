import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addFixture } from "../api";
import localforage from "localforage";
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

    // Format date to dd/mm/yy
    let formattedDate = "Date not available";
    if (date) {
      const parts = date.split("-"); // YYYY-MM-DD
      if (parts.length === 3) {
        const [year, month, day] = parts;
        formattedDate = `${day}/${month}/${year.slice(-2)}`;
      }
    }

    const fixturePayload = {
      home: homeTeam,
      away: awayTeam,
      venue,
      date: formattedDate,
    };

    const response = await addFixture(fixturePayload);

    if (response) {
      alert("Fixture saved!");

      // Update cached fixtures for offline
      const cached = (await localforage.getItem("fixtures")) || [];
      await localforage.setItem("fixtures", [...cached, fixturePayload]);

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
