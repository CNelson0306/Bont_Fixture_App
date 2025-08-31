import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import localforage from "localforage";
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

  // Sync queued results automatically when online
  useEffect(() => {
    const syncQueuedResults = async () => {
      if (navigator.onLine) {
        const queued = (await localforage.getItem("queuedResults")) || [];
        for (let result of queued) {
          try {
            await addResult(result);
          } catch (err) {
            console.error("Failed to sync result:", result, err);
          }
        }
        // Clear queue if all synced
        await localforage.setItem("queuedResults", []);
      }
    };

    window.addEventListener("online", syncQueuedResults);
    syncQueuedResults(); // try sync immediately if online

    return () => window.removeEventListener("online", syncQueuedResults);
  }, []);

  const handleSave = async () => {
    if (!fixture || !homeScore || !awayScore || !manOfMatch || !date) {
      alert("All fields (including Date) are required!");
      return;
    }

    const scorers = scorersText
      .split("\n")
      .map((line) => {
        const [name, points] = line.split("-").map((s) => s.trim());
        return { name, points: Number(points) || 0 };
      })
      .filter((s) => s.name);

    let formattedDate = "Date not available";
    if (date) {
      const parts = date.split("-");
      if (parts.length === 3) {
        const [year, month, day] = parts;
        formattedDate = `${day}/${month}/${year.slice(-2)}`;
      }
    }

    const result = {
      fixture,
      homeScore: Number(homeScore),
      awayScore: Number(awayScore),
      manOfMatch,
      date: formattedDate,
      scorers,
    };

    try {
      if (navigator.onLine) {
        // If online, save directly
        await addResult(result);
        alert("Result saved online!");
      } else {
        // If offline, queue locally
        const queued = (await localforage.getItem("queuedResults")) || [];
        queued.push(result);
        await localforage.setItem("queuedResults", queued);
        alert(
          "No internet. Result queued and will sync automatically when online."
        );
      }

      // Reset form
      setFixture("");
      setHomeScore("");
      setAwayScore("");
      setManOfMatch("");
      setDate("");
      setScorersText("");
    } catch (err) {
      console.error("Error saving result:", err);
      alert("Failed to save result.");
    }
  };

  return (
    <div className="container">
      <h1 className="title">Add Result</h1>

      {/* Date */}
      <input
        type="date"
        className="input"
        placeholder="Select Date:"
        value={date}
        onChange={(e) => setDate(e.target.value)}
      />

      {/* Fixture */}
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

      {/* Scorers */}
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
