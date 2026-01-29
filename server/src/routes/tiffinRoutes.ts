import express from "express";
import {
    getTiffins,
    getTiffinById,
    createTiffin,
    updateTiffin,
    deleteTiffin,
    getMyTiffins,
    getNearbyTiffins,
} from "../controllers/tiffinController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

// Public routes
router.get("/nearby", getNearbyTiffins);

router.route("/")
    .get(getTiffins)
    .post(protect, authorize("provider"), createTiffin);

router.get("/provider/me", protect, authorize("provider"), getMyTiffins);

router.route("/:id")
    .get(getTiffinById)
    .put(protect, authorize("provider"), updateTiffin)
    .delete(protect, authorize("provider"), deleteTiffin);

export default router;
