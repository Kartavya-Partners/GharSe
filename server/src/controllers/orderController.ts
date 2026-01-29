import { Request, Response } from "express";
import Order from "../models/Order.js";
import Tiffin from "../models/Tiffin.js";
import { IUser } from "../models/User.js";

interface AuthRequest extends Request {
    user?: IUser;
}

// @desc    Create a new order
// @route   POST /api/orders
// @access  Private (Customer)
export const createOrder = async (req: any, res: Response): Promise<void> => {
    try {
        const { tiffinId, quantity, deliveryDate, deliveryAddress, deliveryInstructions } = req.body;

        const tiffin = await Tiffin.findById(tiffinId);

        if (!tiffin) {
            res.status(404).json({ message: "Tiffin service not found" });
            return;
        }

        if (!tiffin.isAvailable) {
            res.status(400).json({ message: "This tiffin is currently unavailable" });
            return;
        }

        // Cutoff Time Logic
        // Parse cutoff time (e.g., "10:30")
        // If order is for TODAY, check if current time < cutoff time
        const timeParts = tiffin.cutoffTime.split(":").map(Number);
        const cutoffHour = timeParts[0] || 0;
        const cutoffMinute = timeParts[1] || 0;
        const now = new Date();
        const orderDate = new Date(deliveryDate);

        // Normalize dates to midnight for comparison
        const isToday = now.toDateString() === orderDate.toDateString();

        if (isToday) {
            if (
                now.getHours() > cutoffHour ||
                (now.getHours() === cutoffHour && now.getMinutes() >= cutoffMinute)
            ) {
                res.status(400).json({
                    message: `Cutoff time (${tiffin.cutoffTime}) passed for today's order. Please select tomorrow.`,
                });
                return;
            }
        }

        const totalPrice = tiffin.price * quantity;

        const order = new Order({
            customer: req.user.id,
            tiffin: tiffinId,
            provider: tiffin.provider,
            deliveryDate,
            quantity,
            totalPrice,
            deliveryAddress,
            deliveryInstructions: deliveryInstructions || "",
            status: "pending",
            // Store snapshot for order history preservation
            tiffinSnapshot: {
                name: tiffin.name,
                price: tiffin.price,
                type: tiffin.type,
            },
        });

        const createdOrder = await order.save();
        res.status(201).json(createdOrder);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my orders (Customer)
// @route   GET /api/orders/myorders
// @access  Private (Customer)
export const getMyOrders = async (req: any, res: Response): Promise<void> => {
    try {
        const orders = await Order.find({ customer: req.user.id })
            .populate("tiffin", "name price")
            .populate("provider", "name")
            .sort("-createdAt");
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get provider orders
// @route   GET /api/orders/provider
// @access  Private (Provider)
export const getProviderOrders = async (req: any, res: Response): Promise<void> => {
    try {
        const orders = await Order.find({ provider: req.user.id })
            .populate("tiffin", "name type")
            .populate("customer", "name phone address")
            .sort("-createdAt");
        res.json(orders);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update order status
// @route   PUT /api/orders/:id/status
// @access  Private (Provider)
export const updateOrderStatus = async (req: any, res: Response): Promise<void> => {
    try {
        const { status } = req.body;
        const order = await Order.findById(req.params.id);

        if (order) {
            if (order.provider.toString() !== req.user.id) {
                res.status(401).json({ message: "Not authorized" });
                return;
            }

            order.status = status;
            const updatedOrder = await order.save();
            res.json(updatedOrder);
        } else {
            res.status(404).json({ message: "Order not found" });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
