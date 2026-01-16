import express from "express";
import {
    createOrder,
    getMyOrders,
    getProviderOrders,
    updateOrderStatus,
} from "../controllers/orderController.js";
import { protect, authorize } from "../middleware/authMiddleware.js";

const router = express.Router();

router.post("/", protect, authorize("customer"), createOrder);
router.get("/myorders", protect, authorize("customer"), getMyOrders);
router.get("/provider", protect, authorize("provider"), getProviderOrders);
router.put("/:id/status", protect, authorize("provider"), updateOrderStatus);

export default router;
