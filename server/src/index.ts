console.log("🔥 Booting GharSe backend...");

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import tiffinRoutes from "./routes/tiffinRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import weeklyMenuRoutes from "./routes/weeklyMenuRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import { startCleanupJob } from "./utils/cleanup.js";

dotenv.config();

const app = express();

// CORS configuration for production
const allowedOrigins = [
    process.env.FRONTEND_URL,
    "http://localhost:3000",
].filter((origin): origin is string => Boolean(origin));

app.use(cors({
    origin: allowedOrigins,
    credentials: true
}));

app.use(express.json({ limit: "5mb" }));

app.get("/", (req, res) => {
    res.send("GharSe API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/tiffins", tiffinRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/weekly-menu", weeklyMenuRoutes);
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/upload", uploadRoutes);

const PORT = process.env.PORT || 8000;

// Connect to MongoDB then start server
connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));

    // Start the cleanup job for expired tiffins
    startCleanupJob();
});