"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import {
    ChefHat,
    LogOut,
    User,
    Loader2,
    Save,
    ArrowLeft,
    Leaf,
    Calendar,
    Sun,
    Moon,
    Coffee,
    UtensilsCrossed,
    IndianRupee,
    Drumstick,
} from "lucide-react";
import { motion } from "framer-motion";

// Types
interface DayMenu {
    lunch: string;
    lunchPrice: number;
    lunchType: "veg" | "non-veg" | "vegan";
    dinner: string;
    dinnerPrice: number;
    dinnerType: "veg" | "non-veg" | "vegan";
    isHoliday: boolean;
}

interface WeeklyMenuData {
    weeklyPrice: number; // Discounted weekly subscription price
    menu: {
        monday: DayMenu;
        tuesday: DayMenu;
        wednesday: DayMenu;
        thursday: DayMenu;
        friday: DayMenu;
        saturday: DayMenu;
        sunday: DayMenu;
    };
}

const DAYS = [
    "monday",
    "tuesday",
    "wednesday",
    "thursday",
    "friday",
    "saturday",
    "sunday",
] as const;

const DAY_LABELS: Record<string, string> = {
    monday: "Mon",
    tuesday: "Tue",
    wednesday: "Wed",
    thursday: "Thur",
    friday: "Fri",
    saturday: "Sat",
    sunday: "Sun",
};

const initialMenu: WeeklyMenuData = {
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
};

export default function WeeklyMenuPage() {
    const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const [menuData, setMenuData] = useState<WeeklyMenuData>(initialMenu);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");

    // Redirect if not provider
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push("/login?role=provider");
            } else if (user?.role !== "provider") {
                router.push("/explore");
            }
        }
    }, [authLoading, isAuthenticated, user, router]);

    // Fetch current menu
    useEffect(() => {
        const fetchMenu = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("/weekly-menu/me");
                if (response.data.menu) {
                    setMenuData({
                        weeklyPrice: response.data.weeklyPrice || 0,
                        menu: response.data.menu,
                    });
                }
            } catch (err) {
                console.error("Error fetching menu:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && user?.role === "provider") {
            fetchMenu();
        }
    }, [isAuthenticated, user]);

    // Handle menu update
    const updateDay = (
        day: keyof WeeklyMenuData["menu"],
        field: keyof DayMenu,
        value: string | boolean | number
    ) => {
        setMenuData((prev) => ({
            ...prev,
            menu: {
                ...prev.menu,
                [day]: {
                    ...prev.menu[day],
                    [field]: value,
                },
            },
        }));
    };

    // Save menu
    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage("");
        try {
            await axios.post("/weekly-menu", menuData);
            setSaveMessage("Menu saved successfully!");
            setTimeout(() => setSaveMessage(""), 3000);
        } catch (err) {
            console.error("Error saving menu:", err);
            setSaveMessage("Failed to save. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== "provider") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ========== NAVBAR ========== */}
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <div className="flex items-center gap-4">
                            <Link
                                href="/dashboard/provider"
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-5 h-5" />
                                <span className="hidden sm:inline">Back to Dashboard</span>
                            </Link>
                        </div>

                        <div className="flex items-center gap-4">
                            <div className="flex items-center gap-2 text-sm">
                                <div className="w-8 h-8 rounded-full bg-green-100 flex items-center justify-center">
                                    <User className="w-4 h-4 text-green-600" />
                                </div>
                                <span className="hidden sm:block font-medium text-gray-700">
                                    {user?.name}
                                </span>
                            </div>
                            <Button
                                variant="ghost"
                                size="sm"
                                onClick={logout}
                                className="text-gray-500 hover:text-red-600"
                            >
                                <LogOut className="w-4 h-4" />
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* ========== MAIN CONTENT ========== */}
            <main className="max-w-5xl mx-auto px-4 lg:px-8 py-8">
                {/* Header */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mb-8"
                >
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-3xl font-bold text-gray-900 mb-2 flex items-center gap-3">
                                <Calendar className="w-8 h-8 text-green-600" />
                                This Week&apos;s Menu
                            </h1>
                            <p className="text-gray-600">
                                Plan your weekly meals for customers
                            </p>
                        </div>

                        {/* Weekly Price */}
                        <div className="flex items-center gap-3">
                            <label className="text-sm font-medium text-gray-700">
                                Weekly Price (Discount)
                            </label>
                            <div className="relative">
                                <IndianRupee className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                                <input
                                    type="number"
                                    value={menuData.weeklyPrice || ""}
                                    onChange={(e) => setMenuData((prev) => ({ ...prev, weeklyPrice: parseInt(e.target.value) || 0 }))}
                                    placeholder="0 = No discount"
                                    className="w-40 h-10 pl-9 pr-3 bg-gray-100 rounded-lg border-0 focus:ring-2 focus:ring-green-400"
                                />
                            </div>
                            <span className="text-xs text-gray-500">Set 0 for no weekly discount</span>
                        </div>
                    </div>
                </motion.div>

                {/* Menu Table */}
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.1 }}
                    className="bg-white rounded-2xl shadow-sm border overflow-hidden"
                >
                    {/* Table Header */}
                    <div className="grid grid-cols-[80px_1fr_1fr] bg-gradient-to-r from-amber-800 to-amber-700 text-white">
                        <div className="p-4 font-bold text-center">Day</div>
                        <div className="p-4 font-bold text-center flex items-center justify-center gap-2">
                            <Sun className="w-5 h-5" />
                            LUNCH
                        </div>
                        <div className="p-4 font-bold text-center flex items-center justify-center gap-2">
                            <Moon className="w-5 h-5" />
                            DINNER
                        </div>
                    </div>

                    {/* Table Body */}
                    {DAYS.map((day, index) => {
                        const dayData = menuData.menu[day];
                        const isHoliday = dayData.isHoliday;

                        return (
                            <div
                                key={day}
                                className={`grid grid-cols-[80px_1fr_1fr] border-t ${index % 2 === 0 ? "bg-amber-50" : "bg-white"
                                    }`}
                            >
                                {/* Day Label */}
                                <div className="p-4 flex flex-col items-center justify-center gap-2 bg-amber-100 border-r">
                                    <span className="font-bold text-amber-900">
                                        {DAY_LABELS[day]}
                                    </span>
                                    <label className="flex items-center gap-1 cursor-pointer">
                                        <input
                                            type="checkbox"
                                            checked={isHoliday}
                                            onChange={(e) => updateDay(day, "isHoliday", e.target.checked)}
                                            className="w-4 h-4 text-red-500 rounded border-gray-300"
                                        />
                                        <span className="text-xs text-gray-600">Off</span>
                                    </label>
                                </div>

                                {/* Lunch */}
                                <div className="p-3 border-r">
                                    {isHoliday ? (
                                        <div className="h-full flex items-center justify-center text-red-600 font-bold">
                                            HOLIDAY
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <textarea
                                                value={dayData.lunch}
                                                onChange={(e) => updateDay(day, "lunch", e.target.value)}
                                                placeholder="Enter lunch menu..."
                                                className="w-full h-16 p-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                                            />
                                            <div className="flex items-center gap-1">
                                                <IndianRupee className="w-4 h-4 text-gray-400" />
                                                <input
                                                    type="number"
                                                    value={dayData.lunchPrice || ""}
                                                    onChange={(e) => updateDay(day, "lunchPrice", parseFloat(e.target.value) || 0)}
                                                    placeholder="Price"
                                                    className="w-full h-8 px-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Dinner */}
                                <div className="p-3">
                                    {isHoliday ? (
                                        <div className="h-full flex items-center justify-center text-red-600 font-bold">
                                            HOLIDAY
                                        </div>
                                    ) : (
                                        <div className="space-y-2">
                                            <textarea
                                                value={dayData.dinner}
                                                onChange={(e) => updateDay(day, "dinner", e.target.value)}
                                                placeholder="Enter dinner menu..."
                                                className="w-full h-16 p-2 border border-gray-200 rounded-lg text-sm resize-none focus:ring-2 focus:ring-green-400 focus:border-green-400"
                                            />
                                            <div className="flex items-center gap-1">
                                                <IndianRupee className="w-4 h-4 text-gray-400" />
                                                <input
                                                    type="number"
                                                    value={dayData.dinnerPrice || ""}
                                                    onChange={(e) => updateDay(day, "dinnerPrice", parseFloat(e.target.value) || 0)}
                                                    placeholder="Price"
                                                    className="w-full h-8 px-2 border border-gray-200 rounded-lg text-sm focus:ring-2 focus:ring-green-400"
                                                />
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        );
                    })}
                </motion.div>

                {/* Save Button */}
                <div className="mt-8 flex items-center justify-between">
                    <div>
                        {saveMessage && (
                            <span
                                className={`text-sm font-medium ${saveMessage.includes("success")
                                    ? "text-green-600"
                                    : "text-red-600"
                                    }`}
                            >
                                {saveMessage}
                            </span>
                        )}
                    </div>
                    <Button
                        onClick={handleSave}
                        disabled={isSaving}
                        className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl px-8"
                    >
                        {isSaving ? (
                            <>
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                Saving...
                            </>
                        ) : (
                            <>
                                <Save className="w-4 h-4 mr-2" />
                                Save Menu
                            </>
                        )}
                    </Button>
                </div>
            </main>
        </div>
    );
}
