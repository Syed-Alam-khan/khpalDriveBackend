// Deployment Trigger - V4.1
import express from "express";
import fs from "fs";
import dns from "node:dns";
dns.setServers(["8.8.8.8", "8.8.4.4"]);
import dotenv from "dotenv";
import cors from "cors";
import path from "path";
import cookieParser from "cookie-parser";
import connectDB from "./config/db.js";
import userRoutes from "./routes/userRoutes.js";
import carRoutes from "./routes/carRoutes.js";
import categoryRoutes from "./routes/categoryRoutes.js";

dotenv.config();

// Connect to Database
connectDB();

const app = express();

// Middlewares
app.use(cors({
  origin: (origin, callback) => {
    const allowedOrigins = [
      "http://localhost:5173",
      "http://127.0.0.1:5173",
      "https://khpal-drive.vercel.app"
    ];
    // Allow any Vercel preview URL or the specified origins
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith(".vercel.app")) {
      callback(null, true);
    } else {
      callback(new Error("Not allowed by CORS"));
    }
  },
  credentials: true,
  methods: ["GET", "POST", "PUT", "DELETE", "OPTIONS"],
  allowedHeaders: ["Content-Type", "Authorization", "X-Requested-With", "Accept"],
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());


// Static Folder
const __dirname = path.resolve();
app.use("/uploads", express.static(path.join(__dirname, "/uploads")));

// Routes
app.use("/api/users", userRoutes);
app.use("/api/cars", carRoutes);
app.use("/api/categories", categoryRoutes);

// Health Check / Version Check
app.get("/api/health", (req, res) => {
  res.json({ status: "ok", version: "V4_FORCED", timestamp: new Date() });
});


// Error handling middleware
app.use((err, req, res, next) => {
  const statusCode = res.statusCode === 200 ? 500 : res.statusCode;
  res.status(statusCode);
  res.json({
    message: err.message,
    stack: process.env.NODE_ENV === "production" ? null : err.stack,
  });
});

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`Server is running on port http://localhost:${PORT}`);
});
