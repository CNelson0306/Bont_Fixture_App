import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateFixture, deleteFixture, getFixtureById } from "../api";
import "../src/index.css";

export default function EditFixtureScreen() {
  const { fixtureId } = useParams();
  const navigate = useNavigate();

  const [fixture, setFixture] = useState({
    home: "",
    away: "",
    date: "",
    venue: "",
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const loadFixture = async () => {
      try {
        const data = await getFixtureById(fixtureId);
        if (!data) throw new Error("Fixture not found");
        setFixture(data);
      } catch (err) {
        console.error("Error loading fixture:", err);
        alert("Failed to load fixture");
        navigate(-1);
      } finally {
        setLoading(false);
      }
    };

    loadFixture();
  }, [fixtureId, navigate]);

  const handleUpdate = async () => {
    if (!fixture.home || !fixture.away || !fixture.date || !fixture.venue) {
      alert("All fields are required!");
      return;
    }

    try {
      const { _id, __v, ...updateData } = fixture;
      const updated = await updateFixture(fixtureId, updateData);
      if (!updated) throw new Error("Update failed");

      alert("Fixture updated successfully!");
      navigate(-1);
    } catch (err) {
      console.error("Error updating fixture:", err);
      alert(err.message || "Failed to update fixture");
    }
  };

  const handleDelete = async () => {
    if (window.confirm("Are you sure you want to delete this fixture?")) {
      try {
        const deleted = await deleteFixture(fixtureId);
        if (!deleted) throw new Error("Delete failed");

        alert("Fixture deleted successfully!");
        navigate(-1);
      } catch (err) {
        console.error("Error deleting fixture:", err);
        alert(err.message || "Failed to delete fixture");
      }
    }
  };

  if (loading) {
    return (
      <div className="edit-fixture-container">
        <p className="loading">Loading...</p>
      </div>
    );
  }

  return (
    <div className="fixture-container">
      <button className="top-back-button" onClick={() => navigate(-1)}>
        ◀ Back
      </button>

      <div className="manage-container">
        <h2 className="title">Edit Fixture</h2>

        {["home", "away", "date", "venue"].map((field) => (
          <input
            key={field}
            className="input"
            type="text"
            value={fixture[field] || ""}
            onChange={(e) =>
              setFixture({ ...fixture, [field]: e.target.value })
            }
            placeholder={field.charAt(0).toUpperCase() + field.slice(1)}
          />
        ))}

        <button className="button primary" onClick={handleUpdate}>
          Update Fixture
        </button>

        <button className="button danger" onClick={handleDelete}>
          Delete Fixture
        </button>
      </div>
    </div>
  );
}
