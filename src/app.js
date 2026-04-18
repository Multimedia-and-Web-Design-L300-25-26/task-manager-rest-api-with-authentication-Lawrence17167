import express from "express";
import mongoose from "mongoose";
import authRoutes from "./routes/authRoutes.js";
import taskRoutes from "./routes/taskRoutes.js";

const app = express();

app.use(express.json());

// Ensure database connection is available if not already connected
if (mongoose.connection.readyState === 0 && process.env.MONGO_URI) {
  mongoose.connect(process.env.MONGO_URI, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 5000
  }).catch(err => console.error("Mongoose connection error:", err.message));
}

app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);

export default app;