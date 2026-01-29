import express from "express";
import {
    getSavedAddresses,
    addSavedAddress,
    updateSavedAddress,
    deleteSavedAddress,
    getProfile,
    updateProfile,
} from "../controllers/userController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

// Profile
router.get("/profile", protect, getProfile);
router.put("/profile", protect, updateProfile);

// Saved addresses
router.get("/addresses", protect, getSavedAddresses);
router.post("/addresses", protect, addSavedAddress);
router.put("/addresses/:addressId", protect, updateSavedAddress);
router.delete("/addresses/:addressId", protect, deleteSavedAddress);

export default router;
