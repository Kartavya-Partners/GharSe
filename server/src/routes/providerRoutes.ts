import express from "express";
import { getProviders, getProviderById } from "../controllers/tiffinController.js";

const router = express.Router();

// Public routes
router.get("/", getProviders);
router.get("/:id", getProviderById);

export default router;
