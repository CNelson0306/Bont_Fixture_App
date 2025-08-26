import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getFixtures, deleteFixture } from "../api"; // adjust path if needed
import "../src/index.css";

export default function ManageFixtureScreen() {
  const [fixtures, setFixtures] = useState([]);
  const navigate = useNavigate();

  // Parse DD/MM/YY to Date
  const parseDate = (str) => {
    const [day, month, year] = str.split("/").map(Number);
    return new Date(2000 + year, month - 1, day);
  };

  // Sort fixtures earliest first
  const sortFixtures = (fixtures) =>
    [...fixtures].sort((a, b) => parseDate(a.date) - parseDate(b.date));

  const loadFixtures = async () => {
    try {
      const data = await getFixtures();
      setFixtures(sortFixtures(data));
    } catch (error) {
      console.error("Error fetching fixtures:", error);
    }
  };

  useEffect(() => {
    loadFixtures();
  }, []);

  const handleDelete = async (id) => {
    if (window.confirm("Are you sure you want to delete this fixture?")) {
      try {
        await deleteFixture(id);
        setFixtures((prev) => sortFixtures(prev.filter((f) => f._id !== id)));
      } catch (err) {
        console.error("Delete failed", err);
      }
    }
  };

  return (
    <div className="fixture-container">
      <button className="top-back-button" onClick={() => navigate(-1)}>
        ◀ Back
      </button>
      <div className="manage-fixtures">
        <h2 className="title">Manage Fixtures</h2>
        {fixtures.map((item) => (
          <div key={item._id} className="card">
            <p className="date-text">{item.date}</p>
            <p className="team-text">
              {item.home} vs {item.away}
            </p>
            <p className="venue-text">@ {item.venue}</p>

            <div className="actions">
              <button
                className="button edit"
                onClick={() => navigate(`/edit-fixtures/${item._id}`)}
              >
                Edit
              </button>
              <button
                className="button danger"
                onClick={() => handleDelete(item._id)}
              >
                Delete
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
