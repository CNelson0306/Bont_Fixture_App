// src/pages/EditFixtureScreen.jsx
import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { updateFixture, deleteFixture, getFixtureById } from "../api";

// Convert DD/MM/YY or DD/MM/YYYY → YYYY-MM-DD for the date input
const toInputDate = (dateStr) => {
  if (!dateStr) return "";
  if (dateStr.includes("-")) return dateStr; // already ISO
  const [day, month, yearRaw] = dateStr.split("/").map(Number);
  const year = yearRaw < 100 ? 2000 + yearRaw : yearRaw;
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
};

// Convert YYYY-MM-DD → DD/MM/YY for storage
const fromInputDate = (isoDate) => {
  if (!isoDate) return "";
  const [year, month, day] = isoDate.split("-");
  return `${day}/${month}/${year.slice(-2)}`;
};

const FIELD_LABELS = {
  home: "Home Team",
  away: "Away Team",
  venue: "Venue",
};

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
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [confirmDelete, setConfirmDelete] = useState(false);
  const [deleting, setDeleting] = useState(false);

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getFixtureById(fixtureId);
        if (!data) throw new Error("Fixture not found");
        setFixture(data);
      } catch (err) {
        console.error(err);
        setError("Failed to load fixture.");
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [fixtureId]);

  const handleUpdate = async () => {
    setError("");
    if (
      !fixture.home.trim() ||
      !fixture.away.trim() ||
      !fixture.date ||
      !fixture.venue.trim()
    ) {
      setError("All fields are required.");
      return;
    }
    setSaving(true);
    try {
      const { _id, __v, ...updateData } = fixture;
      const updated = await updateFixture(fixtureId, updateData);
      if (!updated) throw new Error("Update failed");
      setSaved(true);
      setTimeout(() => navigate(-1), 900);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to update fixture.");
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteRequest = () => {
    setConfirmDelete(true);
    setTimeout(() => setConfirmDelete(false), 4000);
  };

  const handleDeleteConfirm = async () => {
    setDeleting(true);
    try {
      const deleted = await deleteFixture(fixtureId);
      if (!deleted) throw new Error("Delete failed");
      navigate(-1);
    } catch (err) {
      console.error(err);
      setError(err.message || "Failed to delete fixture.");
      setDeleting(false);
      setConfirmDelete(false);
    }
  };

  const setField = (field, value) => {
    setFixture((prev) => ({ ...prev, [field]: value }));
    setError("");
  };

  return (
    <div className="page">
      <header className="page__header">
        <button className="page__back" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1 className="page__title">Edit Fixture</h1>
        <div className="page__title-spacer" />
      </header>

      {loading ? (
        <div className="loading-pulse">
          <div className="skeleton skeleton--card" style={{ height: 320 }} />
        </div>
      ) : (
        <div className="form__body">
          <div className="form__card">
            {/* Date */}
            <div className="form__field">
              <label className="form__label" htmlFor="edit-date">
                Date
              </label>
              <input
                id="edit-date"
                className="input"
                type="date"
                value={toInputDate(fixture.date)}
                onChange={(e) =>
                  setField("date", fromInputDate(e.target.value))
                }
              />
            </div>

            {/* Text fields */}
            {["home", "away", "venue"].map((field) => (
              <div className="form__field" key={field}>
                <label className="form__label" htmlFor={`edit-${field}`}>
                  {FIELD_LABELS[field]}
                </label>
                <input
                  id={`edit-${field}`}
                  className="input"
                  type="text"
                  value={fixture[field] || ""}
                  onChange={(e) => setField(field, e.target.value)}
                  placeholder={FIELD_LABELS[field]}
                />
              </div>
            ))}

            {error && <p className="form__error">{error}</p>}

            <button
              className={`btn btn--primary form__submit ${saved ? "form__submit--saved" : ""}`}
              onClick={handleUpdate}
              disabled={saving || saved}
            >
              {saved ? "✓ Updated!" : saving ? "Saving…" : "Update Fixture"}
            </button>

            <div className="edit__divider" />

            {confirmDelete ? (
              <button
                className="btn manage-card__btn-delete manage-card__btn-delete--confirm"
                onClick={handleDeleteConfirm}
                disabled={deleting}
                style={{ width: "100%" }}
              >
                {deleting ? "Deleting…" : "Tap again to confirm delete"}
              </button>
            ) : (
              <button
                className="btn manage-card__btn-delete"
                onClick={handleDeleteRequest}
                style={{ width: "100%" }}
              >
                Delete Fixture
              </button>
            )}
          </div>
        </div>
      )}
    </div>
  );
}
