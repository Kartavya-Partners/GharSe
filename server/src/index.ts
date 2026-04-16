import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";

// Routes
import authRoutes from "./routes/authRoutes.js";
import tiffinRoutes from "./routes/tiffinRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";
import userRoutes from "./routes/userRoutes.js";
import providerRoutes from "./routes/providerRoutes.js";
import uploadRoutes from "./routes/uploadRoutes.js";
import weeklyMenuRoutes from "./routes/weeklyMenuRoutes.js";

// Load env vars
dotenv.config();

const app = express();

console.log("🔥 Booting GharSe backend...");

// Middleware
app.use(cors());
app.use(express.json());

// Routes setup
app.use("/api/auth", authRoutes);
app.use("/api/tiffins", tiffinRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/subscriptions", subscriptionRoutes);
app.use("/api/users", userRoutes);
app.use("/api/providers", providerRoutes);
app.use("/api/upload", uploadRoutes);
app.use("/api/weekly-menu", weeklyMenuRoutes);

// Health check
app.get("/", (req, res) => {
    res.send("GharSe API is running");
});

const PORT = process.env.PORT || 8000;

// Connect to MongoDB then start server
connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
}).catch(err => {
    console.error("Failed to connect to MongoDB", err);
});
