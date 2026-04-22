// src/backend/routes/archives.js
import express from "express";
import Archive from "../models/Archive.js";

const router = express.Router();

// GET all
router.get("/", async (req, res) => {
  try {
    const archives = await Archive.find().sort({ createdAt: 1 });
    res.json(archives);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

// POST — save a season snapshot
router.post("/", async (req, res) => {
  try {
    const archive = new Archive(req.body);
    const saved = await archive.save();
    res.status(201).json(saved);
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
});

// DELETE — remove an archived season
router.delete("/:id", async (req, res) => {
  try {
    const deleted = await Archive.findByIdAndDelete(req.params.id);
    if (!deleted) return res.status(404).json({ error: "Not found" });
    res.json(deleted);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
});

export default router;
