"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useCart } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";
import NotificationDropdown from "@/components/NotificationDropdown";
import { Button } from "@/components/ui/button";
import {
    ArrowLeft,
    ChefHat,
    Star,
    MapPin,
    Clock,
    Loader2,
    UtensilsCrossed,
    ShoppingBag,
    Phone,
    Calendar,
    Leaf,
    Drumstick,
    Sun,
    Moon,
    Coffee,
} from "lucide-react";
import { motion } from "framer-motion";

interface Tiffin {
    _id: string;
    name: string;
    description: string;
    price: number;
    type: "veg" | "non-veg" | "vegan";
    mealType: "breakfast" | "lunch" | "dinner";
    images: string[];
    cutoffTime: string;
    rating?: number;
}

interface DayMenu {
    lunch: string;
    lunchPrice: number;
    dinner: string;
    dinnerPrice: number;
    isHoliday: boolean;
}

interface WeeklyMenu {
    menu: {
        monday: DayMenu;
        tuesday: DayMenu;
        wednesday: DayMenu;
        thursday: DayMenu;
        friday: DayMenu;
        saturday: DayMenu;
        sunday: DayMenu;
    };
    isVeg: boolean;
}

interface ProviderData {
    provider: {
        _id: string;
        name: string;
        phone?: string;
        address?: {
            street?: string;
            city?: string;
            pincode?: string;
        };
    };
    tiffins: Tiffin[];
    weeklyMenu: WeeklyMenu | null;
    stats: {
        totalTiffins: number;
        avgPrice: number;
        minPrice: number;
        maxPrice: number;
        types: string[];
        mealTypes: string[];
    };
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const DAY_LABELS = ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"];

export default function KitchenDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { isLoading: authLoading, isAuthenticated } = useAuth();
    const router = useRouter();

    const [data, setData] = useState<ProviderData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"menu" | "weekly">("menu");

    const { cartCount, addToCart } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login?role=customer");
        }
    }, [authLoading, isAuthenticated, router]);

    // Fetch provider data
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get(`/providers/${resolvedParams.id}`);
                setData(response.data);
            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load kitchen");
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && resolvedParams.id) {
            fetchData();
        }
    }, [isAuthenticated, resolvedParams.id]);

    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case "veg": return "bg-green-100 text-green-700 border-green-200";
            case "non-veg": return "bg-red-100 text-red-700 border-red-200";
            case "vegan": return "bg-emerald-100 text-emerald-700 border-emerald-200";
            default: return "bg-gray-100 text-gray-700";
        }
    };

    const getMealIcon = (mealType: string) => {
        switch (mealType) {
            case "breakfast": return Coffee;
            case "lunch": return Sun;
            case "dinner": return Moon;
            default: return UtensilsCrossed;
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
        );
    }

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
                <ChefHat className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Kitchen not found</h2>
                <p className="text-gray-500 mb-4">{error || "This kitchen doesn't exist"}</p>
                <Link href="/kitchens">
                    <Button>Browse Other Kitchens</Button>
                </Link>
            </div>
        );
    }

    const { provider, tiffins, weeklyMenu, stats } = data;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.back()} className="text-gray-600 hover:text-gray-900">
                                <ArrowLeft className="w-6 h-6" />
                            </button>
                            <div>
                                <h1 className="text-lg font-semibold text-gray-900">{provider.name}&apos;s Kitchen</h1>
                                <p className="text-sm text-gray-500">{stats.totalTiffins} meals available</p>
                            </div>
                        </div>
                        <div className="flex items-center gap-4">
                            <NotificationDropdown />
                            <button onClick={() => setIsCartOpen(true)} className="relative p-2 rounded-full hover:bg-gray-100 text-gray-600 transition-colors">
                                <ShoppingBag className="w-5 h-5" />
                                {cartCount > 0 && (
                                    <span className="absolute top-0 right-0 w-4 h-4 bg-orange-500 text-white text-[10px] font-bold flex items-center justify-center rounded-full">
                                        {cartCount > 9 ? '9+' : cartCount}
                                    </span>
                                )}
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            <main className="max-w-4xl mx-auto px-4 py-6">
                {/* Kitchen Card */}
                <div className="bg-white rounded-2xl shadow-sm border overflow-hidden mb-6">
                    <div className="h-32 bg-gradient-to-br from-green-100 to-emerald-50 flex items-center justify-center">
                        <div className="w-24 h-24 bg-white rounded-full shadow-lg flex items-center justify-center">
                            <ChefHat className="w-12 h-12 text-green-600" />
                        </div>
                    </div>

                    <div className="p-6">
                        <div className="flex items-start justify-between mb-4">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{provider.name}&apos;s Kitchen</h2>
                                <div className="flex items-center gap-3 mt-2 text-gray-600">
                                    {provider.address?.city && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4" />
                                            {provider.address.city}
                                        </span>
                                    )}
                                    {provider.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-4 h-4" />
                                            {provider.phone}
                                        </span>
                                    )}
                                </div>
                            </div>
                            <div className="flex items-center gap-1 bg-yellow-50 px-3 py-1 rounded-full">
                                <Star className="w-5 h-5 text-yellow-400 fill-yellow-400" />
                                <span className="font-semibold">4.5</span>
                            </div>
                        </div>

                        {/* Stats */}
                        <div className="grid grid-cols-3 gap-4 mb-4">
                            <div className="text-center p-3 bg-gray-50 rounded-xl">
                                <p className="text-2xl font-bold text-gray-900">{stats.totalTiffins}</p>
                                <p className="text-xs text-gray-500">Meals</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-xl">
                                <p className="text-2xl font-bold text-gray-900">₹{stats.minPrice}</p>
                                <p className="text-xs text-gray-500">Starting at</p>
                            </div>
                            <div className="text-center p-3 bg-gray-50 rounded-xl">
                                <p className="text-2xl font-bold text-gray-900">₹{stats.avgPrice}</p>
                                <p className="text-xs text-gray-500">Avg price</p>
                            </div>
                        </div>

                        {/* Type badges */}
                        <div className="flex gap-2">
                            {stats.types.includes("veg") && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-green-100 text-green-700 rounded-full text-sm">
                                    <Leaf className="w-4 h-4" /> Veg
                                </span>
                            )}
                            {stats.types.includes("non-veg") && (
                                <span className="flex items-center gap-1 px-3 py-1 bg-red-100 text-red-700 rounded-full text-sm">
                                    <Drumstick className="w-4 h-4" /> Non-Veg
                                </span>
                            )}
                        </div>
                    </div>
                </div>

                {/* Tabs */}
                <div className="flex gap-2 mb-6">
                    <button
                        onClick={() => setActiveTab("menu")}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${activeTab === "menu"
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-white text-gray-600 border hover:bg-gray-50"
                            }`}
                    >
                        <UtensilsCrossed className="w-5 h-5 inline mr-2" />
                        All Meals
                    </button>
                    <button
                        onClick={() => setActiveTab("weekly")}
                        className={`flex-1 py-3 rounded-xl font-semibold transition-all ${activeTab === "weekly"
                            ? "bg-green-500 text-white shadow-md"
                            : "bg-white text-gray-600 border hover:bg-gray-50"
                            }`}
                    >
                        <Calendar className="w-5 h-5 inline mr-2" />
                        Weekly Menu
                    </button>
                </div>

                {/* All Meals Tab */}
                {activeTab === "menu" && (
                    <div className="space-y-4">
                        {tiffins.length === 0 ? (
                            <div className="text-center py-12 bg-white rounded-2xl border">
                                <UtensilsCrossed className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">No meals available</p>
                            </div>
                        ) : (
                            tiffins.map((tiffin, index) => {
                                const MealIcon = getMealIcon(tiffin.mealType);
                                return (
                                    <motion.div
                                        key={tiffin._id}
                                        initial={{ opacity: 0, y: 10 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.05 }}
                                        className="bg-white rounded-xl border p-4 flex gap-4"
                                    >
                                        {/* Image */}
                                        <div className="w-24 h-24 flex-shrink-0 rounded-lg bg-gradient-to-br from-orange-100 to-red-50 flex items-center justify-center overflow-hidden">
                                            {tiffin.images?.[0] ? (
                                                <img src={tiffin.images[0]} alt={tiffin.name} className="w-full h-full object-cover" />
                                            ) : (
                                                <UtensilsCrossed className="w-8 h-8 text-orange-300" />
                                            )}
                                        </div>

                                        {/* Content */}
                                        <div className="flex-1 min-w-0">
                                            <div className="flex items-start justify-between gap-2">
                                                <div>
                                                    <h3 className="font-semibold text-gray-900">{tiffin.name}</h3>
                                                    <p className="text-sm text-gray-500 line-clamp-2">{tiffin.description}</p>
                                                </div>
                                                <span className={`px-2 py-0.5 rounded text-xs font-medium border ${getTypeBadgeColor(tiffin.type)}`}>
                                                    {tiffin.type}
                                                </span>
                                            </div>

                                            <div className="flex items-center gap-3 mt-2 text-sm text-gray-500">
                                                <span className="flex items-center gap-1">
                                                    <MealIcon className="w-4 h-4" />
                                                    {tiffin.mealType}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    Order by {tiffin.cutoffTime}
                                                </span>
                                            </div>

                                            <div className="flex items-center justify-between mt-3">
                                                <span className="text-xl font-bold text-gray-900">₹{tiffin.price}</span>
                                                <Button
                                                    size="sm"
                                                    className="bg-gradient-to-r from-orange-500 to-red-500"
                                                    onClick={() => {
                                                        addToCart({
                                                            tiffinId: tiffin._id,
                                                            name: tiffin.name,
                                                            price: tiffin.price,
                                                            quantity: 1,
                                                            providerId: provider._id,
                                                            type: tiffin.type,
                                                            image: tiffin.images?.[0] || "",
                                                        });
                                                        setIsCartOpen(true);
                                                    }}
                                                >
                                                    <ShoppingBag className="w-4 h-4 mr-1" />
                                                    Add to Cart
                                                </Button>
                                            </div>
                                        </div>
                                    </motion.div>
                                );
                            })
                        )}
                    </div>
                )}

                {/* Weekly Menu Tab */}
                {activeTab === "weekly" && (
                    <div className="bg-white rounded-2xl border overflow-hidden">
                        {!weeklyMenu ? (
                            <div className="text-center py-12">
                                <Calendar className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                                <p className="text-gray-500">Weekly menu not available</p>
                            </div>
                        ) : (
                            <div className="divide-y">
                                {DAYS.map((day, idx) => {
                                    const dayMenu = weeklyMenu.menu[day];
                                    return (
                                        <div key={day} className={`p-4 ${dayMenu.isHoliday ? "bg-gray-50" : ""}`}>
                                            <div className="flex items-center justify-between mb-2">
                                                <h4 className="font-semibold text-gray-900 capitalize">{DAY_LABELS[idx]}</h4>
                                                {dayMenu.isHoliday && (
                                                    <span className="text-xs bg-red-100 text-red-600 px-2 py-0.5 rounded">Holiday</span>
                                                )}
                                            </div>
                                            {!dayMenu.isHoliday && (
                                                <div className="grid grid-cols-2 gap-4">
                                                    <div className="p-3 bg-yellow-50 rounded-lg">
                                                        <div className="flex items-center gap-2 text-yellow-700 mb-1">
                                                            <Sun className="w-4 h-4" />
                                                            <span className="text-sm font-medium">Lunch</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{dayMenu.lunch || "Not set"}</p>
                                                        {dayMenu.lunchPrice > 0 && (
                                                            <p className="text-sm font-semibold text-gray-900 mt-1">₹{dayMenu.lunchPrice}</p>
                                                        )}
                                                    </div>
                                                    <div className="p-3 bg-purple-50 rounded-lg">
                                                        <div className="flex items-center gap-2 text-purple-700 mb-1">
                                                            <Moon className="w-4 h-4" />
                                                            <span className="text-sm font-medium">Dinner</span>
                                                        </div>
                                                        <p className="text-sm text-gray-700">{dayMenu.dinner || "Not set"}</p>
                                                        {dayMenu.dinnerPrice > 0 && (
                                                            <p className="text-sm font-semibold text-gray-900 mt-1">₹{dayMenu.dinnerPrice}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    );
                                })}
                            </div>
                        )}
                    </div>
                )}
            </main>
        </div>
    );
}
