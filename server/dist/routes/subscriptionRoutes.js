import express from "express";
import { createSubscription, getMySubscriptions, getProviderSubscriptions } from "../controllers/subscriptionController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";
const router = express.Router();
router.post("/", protect, authorize("customer"), createSubscription);
router.get("/my", protect, authorize("customer"), getMySubscriptions);
router.get("/provider", protect, authorize("provider"), getProviderSubscriptions);
export default router;
//# sourceMappingURL=subscriptionRoutes.js.map