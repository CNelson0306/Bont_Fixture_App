import mongoose from "mongoose";

const FixtureSchema = new mongoose.Schema({
  home: { type: String, required: true },
  away: { type: String, required: true },
  date: { type: String, required: true },
  venue: { type: String, required: true },
});

const Fixture = mongoose.model("Fixture", FixtureSchema);
export default Fixture;
