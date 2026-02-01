import { Request, Response } from "express";
import WeeklyMenu from "../models/WeeklyMenu.js";

// Helper to get Monday of current week
const getWeekStart = (date: Date = new Date()): Date => {
    const d = new Date(date);
    const day = d.getDay();
    const diff = d.getDate() - day + (day === 0 ? -6 : 1); // Adjust for Sunday
    d.setDate(diff);
    d.setHours(0, 0, 0, 0);
    return d;
};

// @desc    Get provider's weekly menu
// @route   GET /api/weekly-menu/:providerId
// @access  Public
export const getWeeklyMenu = async (req: Request<{ providerId: string }>, res: Response): Promise<void> => {
    try {
        const { providerId } = req.params;
        const weekStart = getWeekStart();

        let weeklyMenu = await WeeklyMenu.findOne({
            provider: providerId,
            weekStartDate: weekStart,
        });

        if (!weeklyMenu) {
            // Return empty structure if no menu exists
            res.json({
                provider: providerId,
                weekStartDate: weekStart,
                weeklyPrice: 0,
                menu: {
                    monday: { lunch: "", lunchPrice: 0, lunchType: "veg", dinner: "", dinnerPrice: 0, dinnerType: "veg", isHoliday: false },
                    tuesday: { lunch: "", lunchPrice: 0, lunchType: "veg", dinner: "", dinnerPrice: 0, dinnerType: "veg", isHoliday: false },
                    wednesday: { lunch: "", lunchPrice: 0, lunchType: "veg", dinner: "", dinnerPrice: 0, dinnerType: "veg", isHoliday: false },
                    thursday: { lunch: "", lunchPrice: 0, lunchType: "veg", dinner: "", dinnerPrice: 0, dinnerType: "veg", isHoliday: false },
                    friday: { lunch: "", lunchPrice: 0, lunchType: "veg", dinner: "", dinnerPrice: 0, dinnerType: "veg", isHoliday: false },
                    saturday: { lunch: "", lunchPrice: 0, lunchType: "veg", dinner: "", dinnerPrice: 0, dinnerType: "veg", isHoliday: false },
                    sunday: { lunch: "", lunchPrice: 0, lunchType: "veg", dinner: "", dinnerPrice: 0, dinnerType: "veg", isHoliday: false },
                },
            });
            return;
        }

        res.json(weeklyMenu);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get my weekly menu (provider)
// @route   GET /api/weekly-menu/me
// @access  Private (Provider only)
export const getMyWeeklyMenu = async (req: any, res: Response): Promise<void> => {
    try {
        const weekStart = getWeekStart();

        let weeklyMenu = await WeeklyMenu.findOne({
            provider: req.user.id,
            weekStartDate: weekStart,
        });

        if (!weeklyMenu) {
            res.json({
                provider: req.user.id,
                weekStartDate: weekStart,
                weeklyPrice: 0,
                menu: {
                    monday: { lunch: "", lunchPrice: 0, lunchType: "veg", dinner: "", dinnerPrice: 0, dinnerType: "veg", isHoliday: false },
                    tuesday: { lunch: "", lunchPrice: 0, lunchType: "veg", dinner: "", dinnerPrice: 0, dinnerType: "veg", isHoliday: false },
                    wednesday: { lunch: "", lunchPrice: 0, lunchType: "veg", dinner: "", dinnerPrice: 0, dinnerType: "veg", isHoliday: false },
                    thursday: { lunch: "", lunchPrice: 0, lunchType: "veg", dinner: "", dinnerPrice: 0, dinnerType: "veg", isHoliday: false },
                    friday: { lunch: "", lunchPrice: 0, lunchType: "veg", dinner: "", dinnerPrice: 0, dinnerType: "veg", isHoliday: false },
                    saturday: { lunch: "", lunchPrice: 0, lunchType: "veg", dinner: "", dinnerPrice: 0, dinnerType: "veg", isHoliday: false },
                    sunday: { lunch: "", lunchPrice: 0, lunchType: "veg", dinner: "", dinnerPrice: 0, dinnerType: "veg", isHoliday: false },
                },
            });
            return;
        }

        res.json(weeklyMenu);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create or update weekly menu
// @route   POST /api/weekly-menu
// @access  Private (Provider only)
export const upsertWeeklyMenu = async (req: any, res: Response): Promise<void> => {
    try {
        const { weeklyPrice, menu } = req.body;
        const weekStart = getWeekStart();

        let weeklyMenu = await WeeklyMenu.findOne({
            provider: req.user.id,
            weekStartDate: weekStart,
        });

        if (weeklyMenu) {
            // Update existing
            weeklyMenu.weeklyPrice = weeklyPrice || 0;
            weeklyMenu.menu = menu;
            await weeklyMenu.save();
        } else {
            // Create new
            weeklyMenu = await WeeklyMenu.create({
                provider: req.user.id,
                weekStartDate: weekStart,
                weeklyPrice: weeklyPrice || 0,
                menu,
            });
        }

        res.status(200).json(weeklyMenu);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};
