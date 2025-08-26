import express from "express";
import mongoose from "mongoose";
import cors from "cors";
import dotenv from "dotenv";

import fixtureRoutes from "./routes/fixtures.js";
import resultRoutes from "./routes/results.js";

dotenv.config();
const app = express();

console.log("MONGO_URI =", process.env.MONGO_URI);

app.use(
  cors({
    origin: [
      "http://localhost:5173", // local dev
      "https://bontrfc.netlify.app", // deployed frontend
    ],
    methods: ["GET", "POST", "PUT", "DELETE"],
    credentials: true,
  })
);

app.use(express.json());

// Connect to MongoDB
mongoose
  .connect(process.env.MONGO_URI)
  .then(() => console.log("✅ MongoDB Connected"))
  .catch((err) => console.error("MongoDB Error:", err));

// API routes
app.use("/api/fixtures", fixtureRoutes);
app.use("/api/results", resultRoutes);

// Test route
app.get("/", (req, res) => {
  res.send("Bont RFC API is running...");
});

const PORT = process.env.PORT || 5001;
app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
