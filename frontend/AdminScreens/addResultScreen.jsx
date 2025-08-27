import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { addResult } from "../api";
import "../src/index.css";

export default function AddResultScreen() {
  const navigate = useNavigate();

  const [fixture, setFixture] = useState("");
  const [homeScore, setHomeScore] = useState("");
  const [awayScore, setAwayScore] = useState("");
  const [scorersText, setScorersText] = useState("");
  const [manOfMatch, setManOfMatch] = useState("");
  const [date, setDate] = useState("");

  const scorers = scorersText
    .split("\n") // split by new line
    .map((line) => {
      const [name, points] = line.split("-").map((s) => s.trim());
      return { name, points: Number(points) || 0 };
    })
    .filter((s) => s.name);

  let formattedDate = date;
  if (date.includes("-")) {
    const [year, month, day] = date.split("-");
    formattedDate = `${day}/${month}/${year.slice(-2)}`;
  }

  const handleSave = async () => {
    if (!fixture || !homeScore || !awayScore || !manOfMatch || !date) {
      alert("All fields (including Date) are required!");
      return;
    }

    const result = {
      fixture,
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      manOfMatch,
      date: formattedDate,
      scorers,
    };

    const response = await addResult(result);
    if (response) {
      alert("Result saved!");
      setFixture("");
      setHomeScore("");
      setAwayScore("");
      setManOfMatch("");
      setDate("");
      setScorersText("");
    } else {
      alert("Could not save result.");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Add Result</h1>

      {/* Date */}
      <input
        type="date"
        className="input"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* Fixture Name */}
      <input
        type="text"
        className="input"
        placeholder="Fixture (e.g. Team A vs Team B)"
        value={fixture}
        onChange={(e) => setFixture(e.target.value)}
      />

      {/* Scores */}
      <input
        type="number"
        className="input"
        placeholder="Home Score"
        value={homeScore}
        onChange={(e) => setHomeScore(e.target.value)}
      />
      <input
        type="number"
        className="input"
        placeholder="Away Score"
        value={awayScore}
        onChange={(e) => setAwayScore(e.target.value)}
      />

      {/* POINTS SCORERS */}
      <textarea
        className="input"
        rows="5"
        placeholder="Points Scorers - Enter one per line"
        value={scorersText}
        onChange={(e) => setScorersText(e.target.value)}
      />

      {/* MOTM */}
      <input
        type="text"
        className="input"
        placeholder="Man of the Match"
        value={manOfMatch}
        onChange={(e) => setManOfMatch(e.target.value)}
      />

      {/* Buttons */}
      <button className="button primary" onClick={handleSave}>
        Save Result
      </button>

      <button className="button secondary" onClick={() => navigate(-1)}>
        Back
      </button>
    </div>
  );
}
