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

  // Helper to format YYYY-MM-DD -> dd/mm/yy
  const formatDate = (isoDate) => {
    if (!isoDate) return "Date not available";
    const [year, month, day] = isoDate.split("-");
    return `${day}/${month}/${year.slice(-2)}`;
  };

  // Helper to sort fixtures by date
  const sortFixtures = (fixtures) =>
    fixtures.sort((a, b) => {
      const [dayA, monthA, yearA] = a.date.split("/").map(Number);
      const [dayB, monthB, yearB] = b.date.split("/").map(Number);
      return (
        new Date(2000 + yearA, monthA - 1, dayA) -
        new Date(2000 + yearB, monthB - 1, dayB)
      );
    });

  const handleSave = async () => {
    if (!homeTeam || !awayTeam || !venue || !date) {
      alert("All fields (including Date) are required!");
      return;
    }

    const formattedDate = formatDate(date);

    const fixturePayload = {
      home: homeTeam,
      away: awayTeam,
      venue,
      date: formattedDate,
    };

    try {
      const response = await addFixture(fixturePayload);

      if (response) {
        alert("Fixture saved!");

        // 1️⃣ Update offline cache immediately
        const cached = (await localforage.getItem("fixtures")) || [];
        const updatedFixtures = sortFixtures([...cached, fixturePayload]);
        await localforage.setItem("fixtures", updatedFixtures);

        // 2️⃣ Reset form
        setHomeTeam("");
        setAwayTeam("");
        setVenue("");
        setDate("");

        // Optional: navigate back to FixtureScreen
        navigate(-1);
      } else {
        alert("Error: Could not save fixture.");
      }
    } catch (err) {
      console.error("Error saving fixture:", err);
      alert("Error saving fixture. Try again.");
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
