// src/pages/ManageFixtureScreen.jsx
import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFixtures, deleteFixture } from "../api";

const parseDate = (str) => {
  if (!str) return new Date(0);
  if (str.includes("-")) return new Date(str);
  const [day, month, yearRaw] = str.split("/").map(Number);
  return new Date(2000 + yearRaw, month - 1, day);
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

export default function ManageFixtureScreen() {
  const navigate = useNavigate();
  const [fixtures, setFixtures] = useState([]);
  const [loading, setLoading] = useState(true);
  const [confirmDelete, setConfirmDelete] = useState(null); // id of fixture pending delete
  const [deleting, setDeleting] = useState(null); // id currently being deleted

  useEffect(() => {
    const load = async () => {
      try {
        const data = await getFixtures();
        setFixtures(sortFixtures(data));
      } catch (err) {
        console.error("Error fetching fixtures:", err);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, []);

  const handleDeleteRequest = (id) => {
    setConfirmDelete(id);
    // auto-cancel after 4s
    setTimeout(
      () => setConfirmDelete((cur) => (cur === id ? null : cur)),
      4000,
    );
  };

  const handleDeleteConfirm = async (id) => {
    setDeleting(id);
    try {
      await deleteFixture(id);
      setFixtures((prev) => sortFixtures(prev.filter((f) => f._id !== id)));
    } catch (err) {
      console.error("Delete failed:", err);
    } finally {
      setDeleting(null);
      setConfirmDelete(null);
    }
  };

  return (
    <div className="page">
      <header className="page__header">
        <button className="page__back" onClick={() => navigate(-1)}>
          Back
        </button>
        <h1 className="page__title">Manage Fixtures</h1>
        <div className="page__title-spacer" />
      </header>

      {loading ? (
        <div className="loading-pulse">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="skeleton skeleton--card" />
          ))}
        </div>
      ) : fixtures.length === 0 ? (
        <p className="state-message">No fixtures to manage.</p>
      ) : (
        <div className="page__body">
          {fixtures.map((item) => (
            <div key={item._id} className="manage-card">
              <div className="manage-card__meta">
                <span className="fixture-card__date">
                  {formatDate(item.date)}
                </span>
                {item.venue && (
                  <span className="fixture-card__venue">{item.venue}</span>
                )}
              </div>
              <div className="fixture-card__teams">
                <span className="fixture-card__team">{item.home}</span>
                <span className="fixture-card__vs">vs</span>
                <span className="fixture-card__team fixture-card__team--away">
                  {item.away}
                </span>
              </div>
              <div className="manage-card__actions">
                <button
                  className="btn manage-card__btn-edit"
                  onClick={() => navigate(`/edit-fixtures/${item._id}`)}
                >
                  Edit
                </button>
                {confirmDelete === item._id ? (
                  <button
                    className="btn manage-card__btn-delete manage-card__btn-delete--confirm"
                    onClick={() => handleDeleteConfirm(item._id)}
                    disabled={deleting === item._id}
                  >
                    {deleting === item._id ? "Deleting…" : "Confirm delete"}
                  </button>
                ) : (
                  <button
                    className="btn manage-card__btn-delete"
                    onClick={() => handleDeleteRequest(item._id)}
                  >
                    Delete
                  </button>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
