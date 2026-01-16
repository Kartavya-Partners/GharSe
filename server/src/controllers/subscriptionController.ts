import { Request, Response } from "express";
import Subscription from "../models/Subscription.js";
import Tiffin from "../models/Tiffin.js";
import { IUser } from "../models/User.js";

// @desc    Create a subscription
// @route   POST /api/subscriptions
// @access  Private (Customer)
export const createSubscription = async (req: any, res: Response): Promise<void> => {
    try {
        const { tiffinId, startDate, endDate, frequency, daysOfWeek, deliveryAddress } = req.body;

        const tiffin = await Tiffin.findById(tiffinId);
        if (!tiffin) {
            res.status(404).json({ message: "Tiffin not found" });
            return;
        }

        // Calculate total price based on duration
        const start = new Date(startDate);
        const end = new Date(endDate);
        const diffTime = Math.abs(end.getTime() - start.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24)) + 1; // Inclusive

        let totalDays = 0;
        if (frequency === "daily") {
            totalDays = diffDays;
        } else if (frequency === "weekly") {
            // Simple approximation or need complex logic for exact days
            // For MVP, assuming "weekly" means 5 days/week or specific days
            if (daysOfWeek && daysOfWeek.length > 0) {
                // Count occurrences of specific days - simplified for MVP
                totalDays = Math.floor(diffDays / 7) * daysOfWeek.length;
            } else {
                totalDays = diffDays; // Fallback
            }
        } else if (frequency === "monthly") {
            totalDays = diffDays; // Monthly usually logic is 30 days flat? keeping simple
        }

        const totalPrice = tiffin.price * totalDays;

        const subscription = new Subscription({
            customer: req.user.id,
            tiffin: tiffinId,
            provider: tiffin.provider,
            startDate,
            endDate,
            frequency,
            daysOfWeek: daysOfWeek || [],
            status: "active",
            totalPrice,
            deliveryAddress,
        });

        const createdSubscription = await subscription.save();
        res.status(201).json(createdSubscription);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my subscriptions
// @route   GET /api/subscriptions/my
// @access  Private (Customer)
export const getMySubscriptions = async (req: any, res: Response): Promise<void> => {
    try {
        const subs = await Subscription.find({ customer: req.user.id })
            .populate("tiffin", "name type images")
            .populate("provider", "name")
            .sort("-createdAt");
        res.json(subs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}

// @desc    Get provider subscriptions
// @route   GET /api/subscriptions/provider
// @access  Private (Provider)
export const getProviderSubscriptions = async (req: any, res: Response): Promise<void> => {
    try {
        const subs = await Subscription.find({ provider: req.user.id })
            .populate("tiffin", "name")
            .populate("customer", "name phone address")
            .sort("-createdAt");
        res.json(subs);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
}
