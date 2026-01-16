console.log("🔥 Booting GharSe backend...");

import express from "express";
import cors from "cors";
import dotenv from "dotenv";
import connectDB from "./config/database.js";
import authRoutes from "./routes/authRoutes.js";
import tiffinRoutes from "./routes/tiffinRoutes.js";
import orderRoutes from "./routes/orderRoutes.js";
import subscriptionRoutes from "./routes/subscriptionRoutes.js";

dotenv.config();

const app = express();
app.use(cors());
app.use(express.json());

app.get("/", (req, res) => {
    res.send("GharSe API is running");
});

app.use("/api/auth", authRoutes);
app.use("/api/tiffins", tiffinRoutes);
app.use("/api/orders", orderRoutes);
app.use("/api/subscriptions", subscriptionRoutes);

const PORT = process.env.PORT || 8000;

// Connect to MongoDB then start server
connectDB().then(() => {
    app.listen(PORT, () => console.log(`🚀 Server running on port ${PORT}`));
});