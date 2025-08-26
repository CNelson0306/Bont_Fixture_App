import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateResult, deleteResult, getResultById } from "../api";
import "../src/index.css";

export default function EditResultScreen() {
  const { resultId } = useParams();
  const navigate = useNavigate();

  const [result, setResult] = useState({
    fixture: "",
    homeScore: "",
    awayScore: "",
    manOfMatch: "",
    date: "",
  });

  useEffect(() => {
    const loadResult = async () => {
      try {
        const data = await getResultById(resultId);
        if (!data) throw new Error("Result not found");

        setResult({
          fixture: data.fixture || "",
          homeScore: data.homeScore?.toString() || "",
          awayScore: data.awayScore?.toString() || "",
          manOfMatch: data.manOfMatch || "",
          date: data.date || "",
        });
      } catch (err) {
        console.error("Error loading result:", err);
        alert("Failed to load result");
        navigate(-1);
      }
    };

    loadResult();
  }, [resultId, navigate]);

  const handleUpdate = async () => {
    if (!result.date || !result.fixture) {
      alert("Date and Fixture are required.");
      return;
    }

    try {
      await updateResult(resultId, {
        fixture: result.fixture,
        homeScore: Number(result.homeScore),
        awayScore: Number(result.awayScore),
        manOfMatch: result.manOfMatch,
        date: result.date,
      });

      alert("Result updated successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error updating result:", err);
      alert(err.message || "Failed to update result");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this result?")) {
      try {
        await deleteResult(resultId);
        alert("Result deleted successfully!");
        navigate(-1);
      } catch (err) {
        console.error("Error deleting result:", err);
        alert(err.message || "Failed to delete result");
      }
    }
  };

  return (
    <div className="fixture-container">
      <button className="top-back-button" onClick={() => navigate(-1)}>
        ◀ Back
      </button>

      <div className="manage-container">
        <h2 className="title">Edit Result</h2>

        <input
          className="input"
          type="text"
          value={result.date}
          onChange={(e) => setResult({ ...result, date: e.target.value })}
          placeholder="Date (DD/MM/YY)"
        />

        <input
          className="input"
          type="text"
          value={result.fixture}
          onChange={(e) => setResult({ ...result, fixture: e.target.value })}
          placeholder="Fixture (e.g. Team A vs Team B)"
        />

        <input
          className="input"
          type="number"
          value={result.homeScore}
          onChange={(e) => setResult({ ...result, homeScore: e.target.value })}
          placeholder="Home Score"
        />

        <input
          className="input"
          type="number"
          value={result.awayScore}
          onChange={(e) => setResult({ ...result, awayScore: e.target.value })}
          placeholder="Away Score"
        />

        <input
          className="input"
          type="text"
          value={result.manOfMatch}
          onChange={(e) => setResult({ ...result, manOfMatch: e.target.value })}
          placeholder="Man of the Match"
        />

        <button className="button primary" onClick={handleUpdate}>
          Update Result
        </button>

        <button className="button danger" onClick={handleDelete}>
          Delete Result
        </button>
      </div>
    </div>
  );
}
