import { Request, Response } from "express";
import Tiffin from "../models/Tiffin.js";
import { IUser } from "../models/User.js";
import { isPastCutoff } from "../utils/cleanup.js";

interface AuthRequest extends Request {
    user?: IUser;
}

// @desc    Get all tiffins (with filters)
// @route   GET /api/tiffins
// @access  Public
export const getTiffins = async (req: Request, res: Response): Promise<void> => {
    try {
        const { keyword, type, mealType } = req.query;
        let query: any = { isAvailable: true };

        if (keyword) {
            query.name = { $regex: keyword, $options: "i" };
        }
        if (type) {
            query.type = type;
        }
        if (mealType) {
            query.mealType = mealType;
        }

        const tiffins = await Tiffin.find(query).populate("provider", "name address rating reviewCount");

        // Filter out tiffins past their cutoff time
        const activeTiffins = tiffins.filter(tiffin => !isPastCutoff(tiffin.cutoffTime));

        res.json(activeTiffins);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single tiffin
// @route   GET /api/tiffins/:id
// @access  Public
export const getTiffinById = async (req: Request, res: Response): Promise<void> => {
    try {
        const tiffin = await Tiffin.findById(req.params.id).populate("provider", "name address rating reviewCount");

        if (tiffin) {
            res.json(tiffin);
        } else {
            res.status(404).json({ message: "Tiffin service not found" });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Create a tiffin
// @route   POST /api/tiffins
// @access  Private (Provider only)
export const createTiffin = async (req: any, res: Response): Promise<void> => {
    try {
        const { name, description, price, type, mealType, cutoffTime, images } = req.body;

        const tiffin = new Tiffin({
            provider: req.user.id,
            name,
            description,
            price,
            type,
            mealType,
            cutoffTime,
            images,
        });

        const createdTiffin = await tiffin.save();
        res.status(201).json(createdTiffin);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Update a tiffin
// @route   PUT /api/tiffins/:id
// @access  Private (Provider only)
export const updateTiffin = async (req: any, res: Response): Promise<void> => {
    try {
        const { name, description, price, type, mealType, cutoffTime, isAvailable, images } = req.body;

        const tiffin = await Tiffin.findById(req.params.id);

        if (tiffin) {
            // Check if user is the provider owner
            if (tiffin.provider.toString() !== req.user.id) {
                res.status(401).json({ message: "Not authorized to update this tiffin" });
                return;
            }

            tiffin.name = name || tiffin.name;
            tiffin.description = description || tiffin.description;
            tiffin.price = price || tiffin.price;
            tiffin.type = type || tiffin.type;
            tiffin.mealType = mealType || tiffin.mealType;
            tiffin.cutoffTime = cutoffTime || tiffin.cutoffTime;
            tiffin.images = images || tiffin.images;
            if (isAvailable !== undefined) tiffin.isAvailable = isAvailable;

            const updatedTiffin = await tiffin.save();
            res.json(updatedTiffin);
        } else {
            res.status(404).json({ message: "Tiffin not found" });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Delete a tiffin
// @route   DELETE /api/tiffins/:id
// @access  Private (Provider only)
export const deleteTiffin = async (req: any, res: Response): Promise<void> => {
    try {
        const tiffin = await Tiffin.findById(req.params.id);

        if (tiffin) {
            if (tiffin.provider.toString() !== req.user.id) {
                res.status(401).json({ message: "Not authorized to delete this tiffin" });
                return;
            }

            await tiffin.deleteOne();
            res.json({ message: "Tiffin removed" });
        } else {
            res.status(404).json({ message: "Tiffin not found" });
        }
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get provider tiffins
// @route   GET /api/tiffins/provider/me
// @access  Private (Provider only)
export const getMyTiffins = async (req: any, res: Response): Promise<void> => {
    try {
        const tiffins = await Tiffin.find({ provider: req.user.id });
        res.json(tiffins);
    } catch (error: any) {
        res.status(500).json({ message: error.message });
    }
};

// Haversine distance calculation function (module-level for reuse)
const calculateDistance = (lat1: number, lng1: number, lat2: number, lng2: number): number => {
    const R = 6371; // Earth's radius in km
    const dLat = ((lat2 - lat1) * Math.PI) / 180;
    const dLon = ((lng2 - lng1) * Math.PI) / 180;
    const a =
        Math.sin(dLat / 2) * Math.sin(dLat / 2) +
        Math.cos((lat1 * Math.PI) / 180) *
        Math.cos((lat2 * Math.PI) / 180) *
        Math.sin(dLon / 2) *
        Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return Math.round(R * c * 10) / 10; // Distance in km, rounded to 1 decimal
};

// @desc    Get nearby tiffins based on customer location
// @route   GET /api/tiffins/nearby
// @access  Public
export const getNearbyTiffins = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lat, lng, radius = 15, type, mealType, search, minPrice, maxPrice, sort } = req.query;

        if (!lat || !lng) {
            res.status(400).json({ message: "Latitude and longitude are required" });
            return;
        }

        const customerLat = parseFloat(lat as string);
        const customerLng = parseFloat(lng as string);
        const radiusKm = parseFloat(radius as string);

        // Build tiffin query
        let query: any = { isAvailable: true };

        // Handle array or string for type and mealType
        if (type) {
            query.type = Array.isArray(type) ? { $in: type } : type;
        }

        if (mealType) {
            query.mealType = Array.isArray(mealType) ? { $in: mealType } : mealType;
        }

        if (search) {
            query.$or = [
                { name: { $regex: search, $options: "i" } },
                { description: { $regex: search, $options: "i" } },
            ];
        }

        if (minPrice || maxPrice) {
            query.price = {};
            if (minPrice) query.price.$gte = Number(minPrice);
            if (maxPrice) query.price.$lte = Number(maxPrice);
        }

        // Fetch all available tiffins with provider info
        const tiffins = await Tiffin.find(query).populate(
            "provider",
            "name address rating reviewCount"
        );

        // Calculate distance for each tiffin and filter by radius
        const tiffinsWithDistance = tiffins
            .map((tiffin) => {
                const providerCoords = (tiffin.provider as any)?.address?.coordinates;
                let distance: number | null = null;

                if (providerCoords?.lat && providerCoords?.lng) {
                    distance = calculateDistance(
                        customerLat,
                        customerLng,
                        providerCoords.lat,
                        providerCoords.lng
                    );
                }

                return {
                    ...tiffin.toObject(),
                    distance,
                };
            })
            .filter((tiffin) => {
                // Filter out tiffins past their cutoff time (hidden from customers, not deleted)
                if (isPastCutoff(tiffin.cutoffTime)) return false;
                // Include if no coordinates (show at end) or within radius
                if (tiffin.distance === null) return true;
                return tiffin.distance <= radiusKm;
            });

        // Sort the results based on 'sort' parameter, defaulting to distance
        tiffinsWithDistance.sort((a, b) => {
            if (sort === 'price_asc') {
                return a.price - b.price;
            } else if (sort === 'price_desc') {
                return b.price - a.price;
            } else if (sort === 'rating') {
                const ratingA = a.rating || 0;
                const ratingB = b.rating || 0;
                return ratingB - ratingA;
            } else {
                // Default: distance_asc
                if (a.distance === null && b.distance === null) return 0;
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            }
        });

        res.json(tiffinsWithDistance);
    } catch (error: any) {
        console.error("Nearby tiffins error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get all providers (kitchens) with their tiffin counts
// @route   GET /api/providers
// @access  Public
export const getProviders = async (req: Request, res: Response): Promise<void> => {
    try {
        const { lat, lng, radius } = req.query;
        const customerLat = parseFloat(lat as string);
        const customerLng = parseFloat(lng as string);
        const radiusKm = parseFloat(radius as string) || 15;

        // Get all providers with at least one tiffin
        const providersWithTiffins = await Tiffin.aggregate([
            { $match: { isAvailable: true } },
            {
                $group: {
                    _id: "$provider",
                    tiffinCount: { $sum: 1 },
                    avgPrice: { $avg: "$price" },
                    minPrice: { $min: "$price" },
                    maxPrice: { $max: "$price" },
                    types: { $addToSet: "$type" },
                    mealTypes: { $addToSet: "$mealType" },
                },
            },
            {
                $lookup: {
                    from: "users",
                    localField: "_id",
                    foreignField: "_id",
                    as: "providerInfo",
                },
            },
            { $unwind: "$providerInfo" },
            { $match: { "providerInfo.role": "provider" } },
            {
                $project: {
                    _id: 1,
                    name: "$providerInfo.name",
                    address: "$providerInfo.address",
                    phone: "$providerInfo.phone",
                    tiffinCount: 1,
                    avgPrice: { $round: ["$avgPrice", 0] },
                    minPrice: 1,
                    maxPrice: 1,
                    types: 1,
                    mealTypes: 1,
                },
            },
        ]);

        // Calculate distances if location provided
        let result = providersWithTiffins.map((provider) => {
            let distance: number | null = null;
            const coords = provider.address?.coordinates;

            if (!isNaN(customerLat) && !isNaN(customerLng) && coords?.lat && coords?.lng) {
                distance = calculateDistance(customerLat, customerLng, coords.lat, coords.lng);
            }

            return { ...provider, distance };
        });

        // Filter by radius if location provided
        if (!isNaN(customerLat) && !isNaN(customerLng)) {
            result = result.filter((p) => p.distance === null || p.distance <= radiusKm);
            result.sort((a, b) => {
                if (a.distance === null && b.distance === null) return 0;
                if (a.distance === null) return 1;
                if (b.distance === null) return -1;
                return a.distance - b.distance;
            });
        }

        res.json(result);
    } catch (error: any) {
        console.error("Get providers error:", error);
        res.status(500).json({ message: error.message });
    }
};

// @desc    Get single provider with all their tiffins
// @route   GET /api/providers/:id
// @access  Public
export const getProviderById = async (req: Request, res: Response): Promise<void> => {
    try {
        const { id } = req.params;

        if (!id) {
            res.status(400).json({ message: "Provider ID is required" });
            return;
        }

        const User = (await import("../models/User.js")).default;
        const WeeklyMenu = (await import("../models/WeeklyMenu.js")).default;

        // Get provider info
        const provider = await User.findOne({ _id: id, role: "provider" }).select("-password");
        if (!provider) {
            res.status(404).json({ message: "Kitchen not found" });
            return;
        }

        // Get all tiffins from this provider
        const tiffins = await Tiffin.find({ provider: id, isAvailable: true });

        // Get weekly menu
        const today = new Date();
        const weekStart = new Date(today);
        weekStart.setDate(today.getDate() - today.getDay() + 1);
        weekStart.setHours(0, 0, 0, 0);

        const weeklyMenu = await WeeklyMenu.findOne({
            provider: id,
            weekStartDate: weekStart,
        });

        // Calculate stats
        const stats = {
            totalTiffins: tiffins.length,
            avgPrice: tiffins.length > 0 ? Math.round(tiffins.reduce((sum, t) => sum + t.price, 0) / tiffins.length) : 0,
            minPrice: tiffins.length > 0 ? Math.min(...tiffins.map((t) => t.price)) : 0,
            maxPrice: tiffins.length > 0 ? Math.max(...tiffins.map((t) => t.price)) : 0,
            types: [...new Set(tiffins.map((t) => t.type))],
            mealTypes: [...new Set(tiffins.map((t) => t.mealType))],
        };

        res.json({
            provider: {
                _id: provider._id,
                name: provider.name,
                phone: provider.phone,
                address: provider.address,
                createdAt: provider.createdAt,
            },
            tiffins,
            weeklyMenu,
            stats,
        });
    } catch (error: any) {
        console.error("Get provider by ID error:", error);
        res.status(500).json({ message: error.message });
    }
};
