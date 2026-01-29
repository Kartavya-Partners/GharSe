import express from "express";
import {
    getWeeklyMenu,
    getMyWeeklyMenu,
    upsertWeeklyMenu,
} from "../controllers/weeklyMenuController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Provider's own menu
router.get("/me", protect, authorize("provider"), getMyWeeklyMenu);
router.post("/", protect, authorize("provider"), upsertWeeklyMenu);

// Public: Get any provider's menu
router.get("/:providerId", getWeeklyMenu);

export default router;
