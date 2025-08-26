import mongoose from "mongoose";

const ResultSchema = new mongoose.Schema({
  fixture: { type: String, required: true },
  homeScore: { type: Number, required: true },
  awayScore: { type: Number, required: true },
  manOfMatch: { type: String, required: true },
  date: { type: String, required: true },
});

const Result = mongoose.model("Result", ResultSchema);
export default Result;
