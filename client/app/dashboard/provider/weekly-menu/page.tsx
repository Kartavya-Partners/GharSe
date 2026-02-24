"use client";

import { useState, useEffect, useMemo } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import ProfileDropdown from "@/components/provider/ProfileDropdown";
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
    UtensilsCrossed,
    IndianRupee,
    Drumstick,
    Plus,
    X,
    Search,
    ChevronLeft,
    ChevronRight,
    Tag,
    Copy,
    Sparkles,
    GripVertical,
    Bell,
    Settings,
    ShoppingBag,
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
    weeklyPrice: number;
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

interface Tiffin {
    _id: string;
    name: string;
    price: number;
    type: "veg" | "non-veg";
    description?: string;
    image?: string;
    isAvailable: boolean;
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
    monday: "MON",
    tuesday: "TUE",
    wednesday: "WED",
    thursday: "THU",
    friday: "FRI",
    saturday: "SAT",
    sunday: "SUN",
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

// Get week dates
function getWeekDates(weekOffset: number) {
    const today = new Date();
    const dayOfWeek = today.getDay();
    const mondayOffset = dayOfWeek === 0 ? -6 : 1 - dayOfWeek;
    const monday = new Date(today);
    monday.setDate(today.getDate() + mondayOffset + weekOffset * 7);

    const dates: Date[] = [];
    for (let i = 0; i < 7; i++) {
        const d = new Date(monday);
        d.setDate(monday.getDate() + i);
        dates.push(d);
    }
    return dates;
}

function getWeekNumber(date: Date) {
    const start = new Date(date.getFullYear(), 0, 1);
    const diff = date.getTime() - start.getTime();
    const oneWeek = 1000 * 60 * 60 * 24 * 7;
    return Math.ceil((diff / oneWeek) + 1);
}

export default function WeeklyMenuPage() {
    const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
    const router = useRouter();

    const [menuData, setMenuData] = useState<WeeklyMenuData>(initialMenu);
    const [tiffins, setTiffins] = useState<Tiffin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isSaving, setIsSaving] = useState(false);
    const [saveMessage, setSaveMessage] = useState("");
    const [weekOffset, setWeekOffset] = useState(0);
    const [dishSearch, setDishSearch] = useState("");
    const [dishFilter, setDishFilter] = useState<"all" | "veg" | "non-veg">("all");
    const [editingCell, setEditingCell] = useState<{ day: string; meal: "lunch" | "dinner" } | null>(null);
    const [sidebarTab, setSidebarTab] = useState<"library" | "templates">("library");

    const weekDates = useMemo(() => getWeekDates(weekOffset), [weekOffset]);
    const weekNum = getWeekNumber(weekDates[0]);
    const todayStr = new Date().toDateString();

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

    // Fetch current menu + tiffins
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [menuRes, tiffinsRes] = await Promise.all([
                    axios.get("/weekly-menu/me").catch(() => ({ data: null })),
                    axios.get("/tiffins/provider/me").catch(() => ({ data: [] })),
                ]);
                if (menuRes.data?.menu) {
                    setMenuData({
                        weeklyPrice: menuRes.data.weeklyPrice || 0,
                        menu: menuRes.data.menu,
                    });
                }
                setTiffins(tiffinsRes.data || []);
            } catch (err) {
                console.error("Error fetching data:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && user?.role === "provider") {
            fetchData();
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

    // Add dish from sidebar to a meal slot
    const addDishToSlot = (tiffin: Tiffin) => {
        if (!editingCell) return;
        const { day, meal } = editingCell;
        const dayKey = day as keyof WeeklyMenuData["menu"];
        if (meal === "lunch") {
            updateDay(dayKey, "lunch", tiffin.name);
            updateDay(dayKey, "lunchPrice", tiffin.price);
            updateDay(dayKey, "lunchType", tiffin.type as DayMenu["lunchType"]);
        } else {
            updateDay(dayKey, "dinner", tiffin.name);
            updateDay(dayKey, "dinnerPrice", tiffin.price);
            updateDay(dayKey, "dinnerType", tiffin.type as DayMenu["dinnerType"]);
        }
        setEditingCell(null);
    };

    // Clear a meal slot
    const clearSlot = (day: keyof WeeklyMenuData["menu"], meal: "lunch" | "dinner") => {
        if (meal === "lunch") {
            updateDay(day, "lunch", "");
            updateDay(day, "lunchPrice", 0);
        } else {
            updateDay(day, "dinner", "");
            updateDay(day, "dinnerPrice", 0);
        }
    };

    // Save menu
    const handleSave = async () => {
        setIsSaving(true);
        setSaveMessage("");
        try {
            await axios.post("/weekly-menu", menuData);
            setSaveMessage("Plan saved!");
            setTimeout(() => setSaveMessage(""), 3000);
        } catch (err) {
            console.error("Error saving menu:", err);
            setSaveMessage("Failed to save.");
        } finally {
            setIsSaving(false);
        }
    };

    // Clone week (copy all meals to next week — currently UI-only)
    const handleCloneWeek = () => {
        setSaveMessage("Week cloned! Adjust meals as needed.");
        setTimeout(() => setSaveMessage(""), 3000);
    };

    // Filter dishes
    const filteredDishes = tiffins.filter((t) => {
        const matchesSearch = t.name.toLowerCase().includes(dishSearch.toLowerCase());
        const matchesFilter = dishFilter === "all" || t.type === dishFilter;
        return matchesSearch && matchesFilter && t.isAvailable;
    });

    // Calculate total item value
    const totalItemValue = useMemo(() => {
        return DAYS.reduce((total, day) => {
            const d = menuData.menu[day];
            if (d.isHoliday) return total;
            return total + (d.lunchPrice || 0) + (d.dinnerPrice || 0);
        }, 0);
    }, [menuData]);

    // Discount percentage
    const discountPct = useMemo(() => {
        if (!menuData.weeklyPrice || menuData.weeklyPrice >= totalItemValue || totalItemValue === 0) return 0;
        return Math.round(((totalItemValue - menuData.weeklyPrice) / totalItemValue) * 100);
    }, [totalItemValue, menuData.weeklyPrice]);

    // Format week range
    const weekRange = useMemo(() => {
        const start = weekDates[0];
        const end = weekDates[6];
        const fmt = (d: Date) => d.toLocaleDateString("en-IN", { month: "short", day: "numeric" });
        return `${fmt(start)} - ${fmt(end)}`;
    }, [weekDates]);

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f1a15]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
        );
    }

    if (!isAuthenticated || user?.role !== "provider") {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0f1a15]">
            {/* ========== TOP NAVBAR ========== */}
            <header className="sticky top-0 z-50 bg-[#0d1a14] border-b border-white/5">
                <div className="max-w-[1400px] mx-auto px-4 lg:px-6">
                    <div className="flex items-center justify-between h-14">
                        <div className="flex items-center gap-6">
                            <Link href="/" className="flex items-center gap-2">
                                <div className="bg-teal-600 p-1.5 rounded-lg">
                                    <ChefHat className="w-4 h-4 text-white" />
                                </div>
                                <span className="text-base font-bold text-white">GharSe Partner</span>
                            </Link>
                            <nav className="hidden md:flex items-center gap-1">
                                <Link href="/dashboard/provider/orders" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                    Dashboard
                                </Link>
                                <span className="px-3 py-1.5 text-sm text-teal-400 font-medium border-b-2 border-teal-400">
                                    Menu Builder
                                </span>
                                <Link href="/dashboard/provider/order-history" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                    Orders
                                </Link>
                                <Link href="/dashboard/provider" className="px-3 py-1.5 text-sm text-gray-400 hover:text-white transition-colors rounded-lg hover:bg-white/5">
                                    Menu Items
                                </Link>
                            </nav>
                        </div>

                        <div className="flex items-center gap-3">
                            <ProfileDropdown />
                        </div>
                    </div>
                </div>
            </header>

            {/* ========== MAIN LAYOUT: Content + Sidebar ========== */}
            <div className="max-w-[1400px] mx-auto flex">
                {/* ===== LEFT: Main Content ===== */}
                <div className="flex-1 min-w-0 px-4 lg:px-6 py-6">
                    {/* Header */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="mb-6"
                    >
                        <div className="flex items-center gap-2 text-xs text-gray-500 mb-2">
                            <span className="text-teal-400 font-semibold">PLAN BUILDER</span>
                            <span>&#x2022;</span>
                            <span>Standard Tiffin</span>
                        </div>
                        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4">
                            <div>
                                <h1 className="text-2xl lg:text-3xl font-extrabold text-white tracking-tight mb-1">
                                    Weekly Schedule
                                </h1>
                                <p className="text-gray-500 text-sm">
                                    Configure your Lunch &amp; Dinner menu for the week of <strong className="text-gray-300">{weekRange}</strong>
                                </p>
                            </div>

                            <div className="flex items-center gap-3">
                                {/* Week Navigator */}
                                <div className="flex items-center bg-[#1a2b23] rounded-xl border border-white/5 overflow-hidden">
                                    <button
                                        onClick={() => setWeekOffset((o) => o - 1)}
                                        className="p-2 hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                                    >
                                        <ChevronLeft className="w-4 h-4" />
                                    </button>
                                    <span className="px-4 text-sm font-medium text-white whitespace-nowrap">
                                        Week {weekNum}
                                    </span>
                                    <button
                                        onClick={() => setWeekOffset((o) => o + 1)}
                                        className="p-2 hover:bg-white/5 transition-colors text-gray-400 hover:text-white"
                                    >
                                        <ChevronRight className="w-4 h-4" />
                                    </button>
                                </div>

                                {/* Save Button */}
                                <Button
                                    onClick={handleSave}
                                    disabled={isSaving}
                                    className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl px-5 h-10"
                                >
                                    {isSaving ? (
                                        <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                    ) : (
                                        <Save className="w-4 h-4 mr-2" />
                                    )}
                                    Save Plan
                                </Button>
                            </div>
                        </div>

                        {saveMessage && (
                            <motion.div
                                initial={{ opacity: 0, y: -5 }}
                                animate={{ opacity: 1, y: 0 }}
                                className={`mt-3 text-sm font-medium ${saveMessage.includes("saved") || saveMessage.includes("cloned") ? "text-teal-400" : "text-red-400"}`}
                            >
                                {saveMessage}
                            </motion.div>
                        )}
                    </motion.div>

                    {/* ===== CALENDAR GRID ===== */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: 0.05 }}
                    >
                        {/* Day Headers */}
                        <div className="grid grid-cols-7 gap-2 mb-3">
                            {DAYS.map((day, i) => {
                                const date = weekDates[i];
                                const isToday = date.toDateString() === todayStr;

                                return (
                                    <div
                                        key={day}
                                        className={`text-center py-3 rounded-xl border ${isToday
                                            ? "bg-teal-600 border-teal-500 shadow-lg shadow-teal-500/20"
                                            : "bg-[#1a2b23] border-white/5"
                                            }`}
                                    >
                                        <div className={`text-[10px] font-bold tracking-wider mb-0.5 ${isToday ? "text-teal-100" : "text-gray-500"}`}>
                                            {DAY_LABELS[day]}
                                        </div>
                                        <div className={`text-xl font-bold ${isToday ? "text-white" : "text-gray-300"}`}>
                                            {date.getDate()}
                                        </div>
                                        {isToday && <div className="w-1.5 h-1.5 bg-orange-400 rounded-full mx-auto mt-1" />}
                                    </div>
                                );
                            })}
                        </div>

                        {/* Holiday Row */}
                        <div className="grid grid-cols-7 gap-2 mb-1">
                            {DAYS.map((day) => {
                                const dayData = menuData.menu[day];
                                return (
                                    <div key={day + "-holiday"} className="flex items-center justify-center py-1">
                                        <label className="flex items-center gap-1.5 cursor-pointer">
                                            <div
                                                className={`relative w-8 h-[18px] rounded-full transition-colors ${dayData.isHoliday ? "bg-red-500" : "bg-white/10"
                                                    }`}
                                                onClick={() => updateDay(day, "isHoliday", !dayData.isHoliday)}
                                            >
                                                <div
                                                    className={`absolute top-[2px] w-[14px] h-[14px] rounded-full bg-white transition-transform ${dayData.isHoliday ? "left-[18px]" : "left-[2px]"
                                                        }`}
                                                />
                                            </div>
                                            <span className={`text-[10px] font-medium ${dayData.isHoliday ? "text-red-400" : "text-gray-600"}`}>
                                                Holiday
                                            </span>
                                        </label>
                                    </div>
                                );
                            })}
                        </div>

                        {/* Lunch Row */}
                        <div className="mb-4">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-bold text-white italic">Lunch</span>
                                <span className="text-[10px] text-gray-600">12pm - 2pm</span>
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {DAYS.map((day) => {
                                    const dayData = menuData.menu[day];
                                    const isEditing = editingCell?.day === day && editingCell?.meal === "lunch";

                                    if (dayData.isHoliday) {
                                        return (
                                            <div key={day + "-lunch"} className="bg-[#162420] rounded-xl border border-white/5 p-3 flex flex-col items-center justify-center min-h-[120px] opacity-50">
                                                <UtensilsCrossed className="w-6 h-6 text-gray-600 mb-1" />
                                                <span className="text-[9px] font-bold text-gray-600 tracking-wider">KITCHEN CLOSED</span>
                                            </div>
                                        );
                                    }

                                    if (dayData.lunch) {
                                        return (
                                            <div
                                                key={day + "-lunch"}
                                                className={`bg-[#1a2b23] rounded-xl border min-h-[120px] p-3 relative group transition-all ${isEditing ? "border-teal-500 ring-2 ring-teal-500/20" : "border-white/5 hover:border-teal-500/30"
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => clearSlot(day, "lunch")}
                                                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <div className="flex items-center gap-1 mb-2">
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${dayData.lunchType === "veg"
                                                        ? "bg-green-500/20 text-green-400"
                                                        : "bg-red-500/20 text-red-400"
                                                        }`}>
                                                        {dayData.lunchType === "veg" ? "VEG" : "NON-VEG"}
                                                    </span>
                                                    <span className="text-teal-400 text-xs font-bold flex items-center">
                                                        <IndianRupee className="w-2.5 h-2.5" />{dayData.lunchPrice}
                                                    </span>
                                                </div>
                                                <p className="text-white text-xs font-medium leading-tight line-clamp-3">{dayData.lunch}</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <button
                                            key={day + "-lunch"}
                                            onClick={() => setEditingCell({ day, meal: "lunch" })}
                                            className={`bg-[#162420] rounded-xl border border-dashed min-h-[120px] flex flex-col items-center justify-center gap-2 transition-all ${isEditing
                                                ? "border-teal-500 bg-teal-500/5"
                                                : "border-white/10 hover:border-teal-500/40 hover:bg-teal-500/5"
                                                }`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                <Plus className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <span className="text-[10px] text-gray-600 font-medium">Add Lunch</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* Dinner Row */}
                        <div className="mb-6">
                            <div className="flex items-center gap-2 mb-2">
                                <span className="text-sm font-bold text-white italic">Dinner</span>
                                <span className="text-[10px] text-gray-600">7pm - 9pm</span>
                            </div>
                            <div className="grid grid-cols-7 gap-2">
                                {DAYS.map((day) => {
                                    const dayData = menuData.menu[day];
                                    const isEditing = editingCell?.day === day && editingCell?.meal === "dinner";

                                    if (dayData.isHoliday) {
                                        return (
                                            <div key={day + "-dinner"} className="bg-[#162420] rounded-xl border border-white/5 p-3 flex flex-col items-center justify-center min-h-[120px] opacity-50">
                                                <UtensilsCrossed className="w-6 h-6 text-gray-600 mb-1" />
                                                <span className="text-[9px] font-bold text-gray-600 tracking-wider">KITCHEN CLOSED</span>
                                            </div>
                                        );
                                    }

                                    if (dayData.dinner) {
                                        return (
                                            <div
                                                key={day + "-dinner"}
                                                className={`bg-[#1a2b23] rounded-xl border min-h-[120px] p-3 relative group transition-all ${isEditing ? "border-teal-500 ring-2 ring-teal-500/20" : "border-white/5 hover:border-teal-500/30"
                                                    }`}
                                            >
                                                <button
                                                    onClick={() => clearSlot(day, "dinner")}
                                                    className="absolute top-1.5 right-1.5 w-5 h-5 rounded-full bg-red-500/20 text-red-400 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                                <div className="flex items-center gap-1 mb-2">
                                                    <span className={`px-1.5 py-0.5 rounded text-[8px] font-bold ${dayData.dinnerType === "veg"
                                                        ? "bg-green-500/20 text-green-400"
                                                        : "bg-red-500/20 text-red-400"
                                                        }`}>
                                                        {dayData.dinnerType === "veg" ? "VEG" : "NON-VEG"}
                                                    </span>
                                                    <span className="text-teal-400 text-xs font-bold flex items-center">
                                                        <IndianRupee className="w-2.5 h-2.5" />{dayData.dinnerPrice}
                                                    </span>
                                                </div>
                                                <p className="text-white text-xs font-medium leading-tight line-clamp-3">{dayData.dinner}</p>
                                            </div>
                                        );
                                    }

                                    return (
                                        <button
                                            key={day + "-dinner"}
                                            onClick={() => setEditingCell({ day, meal: "dinner" })}
                                            className={`bg-[#162420] rounded-xl border border-dashed min-h-[120px] flex flex-col items-center justify-center gap-2 transition-all ${isEditing
                                                ? "border-teal-500 bg-teal-500/5"
                                                : "border-white/10 hover:border-teal-500/40 hover:bg-teal-500/5"
                                                }`}
                                        >
                                            <div className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center">
                                                <Plus className="w-4 h-4 text-gray-500" />
                                            </div>
                                            <span className="text-[10px] text-gray-600 font-medium">Add Dinner</span>
                                        </button>
                                    );
                                })}
                            </div>
                        </div>

                        {/* ===== SUBSCRIPTION OFFER ===== */}
                        <motion.div
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            transition={{ delay: 0.15 }}
                            className="bg-[#1a2b23] rounded-2xl border border-white/5 p-5 flex flex-col lg:flex-row items-start lg:items-center gap-6"
                        >
                            {/* Left info */}
                            <div className="flex items-start gap-3 flex-1">
                                <div className="w-10 h-10 rounded-xl bg-teal-500/10 flex items-center justify-center flex-shrink-0">
                                    <Tag className="w-5 h-5 text-teal-400" />
                                </div>
                                <div>
                                    <h3 className="text-white font-bold text-sm mb-0.5">Weekly Subscription Offer</h3>
                                    <p className="text-gray-500 text-xs">
                                        Set a bundle price for users who subscribe to the full week.
                                    </p>
                                </div>
                            </div>

                            {/* Pricing */}
                            <div className="flex items-center gap-4">
                                <div className="text-center">
                                    <div className="text-[10px] text-gray-500 font-semibold tracking-wider mb-1">TOTAL ITEM VALUE</div>
                                    <div className="text-xl font-bold text-white flex items-center justify-center">
                                        <IndianRupee className="w-4 h-4" />{totalItemValue.toLocaleString()}
                                    </div>
                                </div>

                                <ChevronRight className="w-5 h-5 text-gray-600" />

                                <div className="text-center">
                                    <div className="text-[10px] text-teal-400 font-semibold tracking-wider mb-1">BUNDLE PRICE</div>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-2.5 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-gray-500" />
                                        <input
                                            type="number"
                                            value={menuData.weeklyPrice || ""}
                                            onChange={(e) => setMenuData((prev) => ({ ...prev, weeklyPrice: parseInt(e.target.value) || 0 }))}
                                            placeholder="0"
                                            className="w-28 h-10 pl-8 pr-3 bg-[#0f1a15] rounded-lg border border-white/10 text-white text-sm font-bold focus:ring-2 focus:ring-teal-500/50 focus:border-teal-500/50"
                                        />
                                    </div>
                                </div>

                                {discountPct > 0 && (
                                    <div className="flex items-center gap-1 px-3 py-1.5 bg-teal-500/10 rounded-lg border border-teal-500/20">
                                        <span className="text-teal-400 text-sm">&#x223C;</span>
                                        <span className="text-teal-400 font-bold text-sm">{discountPct}% Discount</span>
                                    </div>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                </div>

                {/* ===== RIGHT SIDEBAR ===== */}
                <div className="hidden lg:block w-[300px] border-l border-white/5 bg-[#0d1a14] min-h-[calc(100vh-56px)]">
                    <div className="sticky top-[56px] overflow-y-auto max-h-[calc(100vh-56px)] p-4">
                        {/* Tabs */}
                        <div className="flex border-b border-white/5 mb-4">
                            <button
                                onClick={() => setSidebarTab("library")}
                                className={`flex-1 pb-2 text-sm font-medium transition-colors border-b-2 ${sidebarTab === "library"
                                    ? "text-teal-400 border-teal-400"
                                    : "text-gray-500 border-transparent hover:text-gray-300"
                                    }`}
                            >
                                Menu Library
                            </button>
                            <button
                                onClick={() => setSidebarTab("templates")}
                                className={`flex-1 pb-2 text-sm font-medium transition-colors border-b-2 ${sidebarTab === "templates"
                                    ? "text-teal-400 border-teal-400"
                                    : "text-gray-500 border-transparent hover:text-gray-300"
                                    }`}
                            >
                                Templates
                            </button>
                        </div>

                        {sidebarTab === "library" ? (
                            <>
                                {/* Quick Actions */}
                                <div className="mb-4">
                                    <h4 className="text-[10px] font-semibold text-gray-500 tracking-wider mb-2">QUICK ACTIONS</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        <button
                                            onClick={handleCloneWeek}
                                            className="p-3 bg-[#1a2b23] rounded-xl border border-white/5 hover:border-teal-500/30 transition-all flex flex-col items-center gap-1.5"
                                        >
                                            <Copy className="w-5 h-5 text-gray-400" />
                                            <span className="text-[10px] text-gray-400 font-medium">Clone Week</span>
                                        </button>
                                        <button className="p-3 bg-[#1a2b23] rounded-xl border border-white/5 hover:border-teal-500/30 transition-all flex flex-col items-center gap-1.5">
                                            <Sparkles className="w-5 h-5 text-purple-400" />
                                            <span className="text-[10px] text-gray-400 font-medium">Auto Fill</span>
                                        </button>
                                    </div>
                                </div>

                                {/* Search */}
                                <div className="relative mb-3">
                                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                                    <input
                                        type="text"
                                        placeholder="Search dishes..."
                                        value={dishSearch}
                                        onChange={(e) => setDishSearch(e.target.value)}
                                        className="w-full h-9 pl-9 pr-3 bg-[#1a2b23] border border-white/10 rounded-lg text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30"
                                    />
                                </div>

                                {/* Filter Tabs */}
                                <div className="flex gap-2 mb-4">
                                    {(["all", "veg", "non-veg"] as const).map((f) => (
                                        <button
                                            key={f}
                                            onClick={() => setDishFilter(f)}
                                            className={`px-3 py-1 rounded-full text-xs font-medium transition-all ${dishFilter === f
                                                ? "bg-teal-600 text-white"
                                                : "bg-[#1a2b23] text-gray-400 hover:text-white border border-white/5"
                                                }`}
                                        >
                                            {f === "all" ? "All" : f === "veg" ? "Veg" : "Non-Veg"}
                                        </button>
                                    ))}
                                </div>

                                {/* Editing indicator */}
                                {editingCell && (
                                    <div className="mb-3 p-2 bg-teal-500/10 border border-teal-500/20 rounded-lg flex items-center justify-between">
                                        <span className="text-xs text-teal-400">
                                            Adding {editingCell.meal} for {DAY_LABELS[editingCell.day]}
                                        </span>
                                        <button onClick={() => setEditingCell(null)} className="text-gray-500 hover:text-white">
                                            <X className="w-3.5 h-3.5" />
                                        </button>
                                    </div>
                                )}

                                {/* Available Dishes */}
                                <h4 className="text-[10px] font-semibold text-gray-500 tracking-wider mb-2">AVAILABLE DISHES</h4>
                                <div className="space-y-2">
                                    {filteredDishes.length === 0 ? (
                                        <div className="text-center py-8">
                                            <UtensilsCrossed className="w-8 h-8 text-gray-600 mx-auto mb-2" />
                                            <p className="text-xs text-gray-600">No dishes found</p>
                                            <Link href="/dashboard/provider" className="text-xs text-teal-400 hover:underline mt-1 block">
                                                Add items in Menu Management
                                            </Link>
                                        </div>
                                    ) : (
                                        filteredDishes.map((dish) => (
                                            <button
                                                key={dish._id}
                                                onClick={() => editingCell && addDishToSlot(dish)}
                                                className={`w-full flex items-center gap-3 p-2.5 rounded-xl border transition-all text-left ${editingCell
                                                    ? "bg-[#1a2b23] border-white/5 hover:border-teal-500/30 hover:bg-teal-500/5 cursor-pointer"
                                                    : "bg-[#1a2b23] border-white/5 opacity-60 cursor-default"
                                                    }`}
                                            >
                                                {/* Dish image */}
                                                <div className="w-10 h-10 rounded-lg bg-[#0f1a15] flex-shrink-0 overflow-hidden">
                                                    {dish.image ? (
                                                        <img src={dish.image} alt={dish.name} className="w-full h-full object-cover" />
                                                    ) : (
                                                        <div className="w-full h-full flex items-center justify-center">
                                                            <UtensilsCrossed className="w-4 h-4 text-gray-600" />
                                                        </div>
                                                    )}
                                                </div>

                                                {/* Dish info */}
                                                <div className="flex-1 min-w-0">
                                                    <span className="text-sm font-medium text-white truncate block">{dish.name}</span>
                                                    <div className="flex items-center gap-2 text-[10px] text-gray-500">
                                                        <span className={`flex items-center gap-0.5 ${dish.type === "veg" ? "text-green-400" : "text-red-400"}`}>
                                                            <span className={`w-1.5 h-1.5 rounded-full ${dish.type === "veg" ? "bg-green-400" : "bg-red-400"}`} />
                                                            {dish.type === "veg" ? "Veg" : "Non-Veg"}
                                                        </span>
                                                    </div>
                                                </div>

                                                {/* Price */}
                                                <span className="text-teal-400 text-sm font-bold flex items-center flex-shrink-0">
                                                    <IndianRupee className="w-3 h-3" />{dish.price}
                                                </span>

                                                <GripVertical className="w-4 h-4 text-gray-600 flex-shrink-0" />
                                            </button>
                                        ))
                                    )}
                                </div>

                                {/* Create Custom Dish */}
                                <Link
                                    href="/dashboard/provider"
                                    className="mt-4 w-full flex items-center justify-center gap-2 p-3 rounded-xl border border-dashed border-white/10 text-gray-400 hover:text-teal-400 hover:border-teal-500/30 transition-all"
                                >
                                    <Plus className="w-4 h-4" />
                                    <span className="text-sm font-medium">Create Custom Dish</span>
                                </Link>
                            </>
                        ) : (
                            /* Templates Tab */
                            <div className="text-center py-10">
                                <div className="w-14 h-14 bg-teal-500/10 rounded-full flex items-center justify-center mx-auto mb-3">
                                    <Sparkles className="w-7 h-7 text-teal-500" />
                                </div>
                                <h3 className="text-white font-semibold text-sm mb-1">Templates Coming Soon</h3>
                                <p className="text-gray-500 text-xs">
                                    Save and reuse your favorite weekly meal plans.
                                </p>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
