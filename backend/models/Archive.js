import mongoose from "mongoose";

const ArchiveSchema = new mongoose.Schema({
  season: { type: String, required: true },
  createdAt: { type: String, required: true },
  standings: [
    {
      name: String,
      points: Number,
      mom: Number,
    },
  ],
});

const Archive = mongoose.model("Archive", ArchiveSchema);
export default Archive;
