"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
    X,
    Clock,
    Flame,
    Leaf,
    Drumstick,
    Salad,
    ChefHat,
    Star,
    Navigation,
    ShoppingBag,
    UtensilsCrossed,
    MapPin,
    IndianRupee,
} from "lucide-react";
import { Button } from "@/components/ui/button";

interface Tiffin {
    _id: string;
    name: string;
    description: string;
    price: number;
    type: "veg" | "non-veg" | "vegan";
    mealType: "breakfast" | "lunch" | "dinner";
    images: string[];
    isAvailable: boolean;
    cutoffTime: string;
    rating?: number;
    reviewCount?: number;
    provider: {
        _id: string;
        name: string;
        address?: {
            city?: string;
        };
    };
    distance?: number;
}

interface TiffinDetailsModalProps {
    tiffin: Tiffin | null;
    isOpen: boolean;
    onClose: () => void;
    onOrder: (tiffin: Tiffin) => void;
}

export default function TiffinDetailsModal({
    tiffin,
    isOpen,
    onClose,
    onOrder,
}: TiffinDetailsModalProps) {
    if (!tiffin) return null;

    const getTypeColor = (type: string) => {
        switch (type) {
            case "veg":
                return "text-green-600 bg-green-100 border-green-200";
            case "non-veg":
                return "text-red-600 bg-red-100 border-red-200";
            case "vegan":
                return "text-emerald-600 bg-emerald-100 border-emerald-200";
            default:
                return "text-gray-600 bg-gray-100 border-gray-200";
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case "veg":
                return Leaf;
            case "non-veg":
                return Drumstick;
            case "vegan":
                return Salad;
            default:
                return UtensilsCrossed;
        }
    };

    const TypeIcon = getTypeIcon(tiffin.type);

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
                    onClick={onClose}
                >
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95, y: 20 }}
                        animate={{ opacity: 1, scale: 1, y: 0 }}
                        exit={{ opacity: 0, scale: 0.95, y: 20 }}
                        onClick={(e) => e.stopPropagation()}
                        className="bg-white rounded-3xl shadow-2xl w-full max-w-2xl overflow-hidden max-h-[90vh] flex flex-col"
                    >
                        {/* Header Image */}
                        <div className="relative h-64 sm:h-72 bg-gray-100 shrink-0">
                            {tiffin.images && tiffin.images.length > 0 ? (
                                <img
                                    src={tiffin.images[0]}
                                    alt={tiffin.name}
                                    className="w-full h-full object-cover"
                                />
                            ) : (
                                <div className="w-full h-full flex items-center justify-center bg-orange-50">
                                    <UtensilsCrossed className="w-20 h-20 text-orange-200" />
                                </div>
                            )}

                            {/* Close Button */}
                            <button
                                onClick={onClose}
                                className="absolute top-4 right-4 p-2 bg-white/90 backdrop-blur hover:bg-white rounded-full text-gray-800 transition-colors shadow-lg"
                            >
                                <X className="w-5 h-5" />
                            </button>

                            {/* Type Badge */}
                            <div className={`absolute bottom-4 left-4 flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-semibold border shadow-sm ${getTypeColor(tiffin.type)}`}>
                                <TypeIcon className="w-4 h-4" />
                                <span className="capitalize">{tiffin.type}</span>
                            </div>
                        </div>

                        {/* Content Scrollable Area */}
                        <div className="flex-1 overflow-y-auto p-6 space-y-6">
                            {/* Title & Price */}
                            <div className="flex items-start justify-between gap-4">
                                <div>
                                    <h2 className="text-2xl font-bold text-gray-900 mb-1">
                                        {tiffin.name}
                                    </h2>
                                    <div className="flex items-center gap-2 text-gray-500">
                                        <ChefHat className="w-4 h-4" />
                                        <span className="font-medium text-gray-700">
                                            {tiffin.provider?.name || "Home Kitchen"}
                                        </span>
                                    </div>
                                </div>
                                <div className="text-right shrink-0">
                                    <div className="text-3xl font-bold text-green-600 flex items-center justify-end">
                                        <IndianRupee className="w-6 h-6" />
                                        {tiffin.price}
                                    </div>
                                    <span className="text-sm text-gray-400">per meal</span>
                                </div>
                            </div>

                            {/* Ratings & Info */}
                            <div className="flex flex-wrap gap-4 py-4 border-y border-gray-100">
                                <div className="flex items-center gap-1.5 px-3 py-1 bg-yellow-50 text-yellow-700 rounded-lg">
                                    <Star className="w-4 h-4 fill-yellow-500 text-yellow-500" />
                                    <span className="font-bold">{tiffin.rating?.toFixed(1) || "New"}</span>
                                    <span className="text-xs opacity-75">({tiffin.reviewCount || 0} reviews)</span>
                                </div>

                                <div className="flex items-center gap-1.5 px-3 py-1 bg-blue-50 text-blue-700 rounded-lg">
                                    <Clock className="w-4 h-4" />
                                    <span className="text-sm font-medium">Order by {tiffin.cutoffTime}</span>
                                </div>

                                {tiffin.distance !== undefined && tiffin.distance !== null && (
                                    <div className="flex items-center gap-1.5 px-3 py-1 bg-purple-50 text-purple-700 rounded-lg">
                                        <Navigation className="w-4 h-4" />
                                        <span className="text-sm font-medium">{tiffin.distance} km away</span>
                                    </div>
                                )}
                            </div>

                            {/* Description */}
                            <div className="space-y-3">
                                <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                    <Flame className="w-5 h-5 text-orange-500" />
                                    About this meal
                                </h3>
                                <p className="text-gray-600 leading-relaxed">
                                    {tiffin.description}
                                </p>
                            </div>

                            {/* Location */}
                            {tiffin.provider?.address?.city && (
                                <div className="flex items-center gap-2 text-sm text-gray-500 bg-gray-50 p-3 rounded-xl border border-gray-100">
                                    <MapPin className="w-4 h-4 text-gray-400" />
                                    <span>
                                        Kitchen located in <span className="font-medium text-gray-700">{tiffin.provider.address.city}</span>
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Footer Action */}
                        <div className="p-6 pt-2 shrink-0 bg-white border-t border-gray-50">
                            <Button
                                onClick={() => onOrder(tiffin)}
                                className="w-full h-14 text-lg bg-gradient-to-r from-orange-500 to-red-600 hover:from-orange-600 hover:to-red-700 shadow-xl shadow-orange-500/20 rounded-xl"
                            >
                                <ShoppingBag className="w-5 h-5 mr-2" />
                                Order Now
                            </Button>
                        </div>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
