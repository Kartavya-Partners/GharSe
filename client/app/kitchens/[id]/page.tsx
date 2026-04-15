"use client";

import { useState, useEffect, use } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import CartSidebar from "@/components/CartSidebar";
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
    Plus,
    ChevronLeft,
    ChevronRight,
    BadgeCheck,
    X,
    Check,
    Home,
    Briefcase,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// ─── Types ───────────────────────────────────────────────────────────────────

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
    _id?: string;
    menu: {
        monday: DayMenu;
        tuesday: DayMenu;
        wednesday: DayMenu;
        thursday: DayMenu;
        friday: DayMenu;
        saturday: DayMenu;
        sunday: DayMenu;
    };
    weeklyPrice?: number;
    weekStartDate?: string;
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

interface Address {
    _id: string;
    label?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: { lat: number; lng: number };
}

const DAYS = ["monday", "tuesday", "wednesday", "thursday", "friday", "saturday", "sunday"] as const;
const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// ─── Helper: Format cutoff time for badge ────────────────────────────────────

function formatCutoff(time: string): string {
    const [h, m] = time.split(":").map(Number);
    const suffix = h >= 12 ? "PM" : "AM";
    const hour12 = h % 12 || 12;
    return `${hour12}:${(m || 0).toString().padStart(2, "0")} ${suffix}`;
}

// ─── Component ───────────────────────────────────────────────────────────────

export default function KitchenDetailPage({ params }: { params: Promise<{ id: string }> }) {
    const resolvedParams = use(params);
    const { isLoading: authLoading, isAuthenticated, user } = useAuth();
    const { location, requestLocation } = useLocation();
    const router = useRouter();

    const [data, setData] = useState<ProviderData | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [activeTab, setActiveTab] = useState<"menu" | "weekly">("menu");

    const { cartCount, addToCart } = useCart();
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Subscription modal
    const [showSubscribeModal, setShowSubscribeModal] = useState(false);
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState("");
    const [isSubscribing, setIsSubscribing] = useState(false);
    const [subscribeError, setSubscribeError] = useState("");
    const [subscribeSuccess, setSubscribeSuccess] = useState(false);

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

    // Fetch addresses when subscribe modal opens
    useEffect(() => {
        if (!showSubscribeModal || !isAuthenticated) return;
        const fetchAddresses = async () => {
            try {
                const res = await axios.get("/users/profile");
                const userData = res.data;
                if (userData.addresses && userData.addresses.length > 0) {
                    setSavedAddresses(userData.addresses);
                    const def = userData.addresses.find((a: any) => a.isDefault);
                    setSelectedAddressId(def ? def._id : userData.addresses[0]._id);
                } else if (userData.address && userData.address.street) {
                    const main: Address = { _id: "main", label: "Home", ...userData.address };
                    setSavedAddresses([main]);
                    setSelectedAddressId("main");
                }
            } catch { }
        };
        fetchAddresses();
    }, [showSubscribeModal, isAuthenticated]);

    // ─── Handlers ────────────────────────────────────────────────────────────

    const handleSubscribe = async () => {
        if (!data) return;
        const addr = savedAddresses.find((a) => a._id === selectedAddressId);
        if (!addr) {
            setSubscribeError("Please select a delivery address.");
            return;
        }

        setIsSubscribing(true);
        setSubscribeError("");

        // Use next Monday as start, Sunday as end
        const now = new Date();
        const dayOfWeek = now.getDay(); // 0=Sun
        const daysUntilMon = dayOfWeek === 0 ? 1 : 8 - dayOfWeek;
        const startDate = new Date(now);
        startDate.setDate(now.getDate() + daysUntilMon);
        startDate.setHours(0, 0, 0, 0);
        const endDate = new Date(startDate);
        endDate.setDate(startDate.getDate() + 6);

        try {
            // We need a tiffin ID for the subscription model — use the first available tiffin
            const firstTiffin = data.tiffins[0];
            if (!firstTiffin) {
                setSubscribeError("No meals available to subscribe to.");
                setIsSubscribing(false);
                return;
            }

            await axios.post("/subscriptions", {
                tiffinId: firstTiffin._id,
                startDate: startDate.toISOString(),
                endDate: endDate.toISOString(),
                frequency: "weekly",
                daysOfWeek: [1, 2, 3, 4, 5, 6], // Mon–Sat
                deliveryAddress: {
                    street: addr.street,
                    city: addr.city,
                    state: addr.state,
                    pincode: addr.pincode,
                    coordinates: addr.coordinates,
                },
            });

            setSubscribeSuccess(true);
            setTimeout(() => {
                setShowSubscribeModal(false);
                setSubscribeSuccess(false);
            }, 2000);
        } catch (err: any) {
            setSubscribeError(err.response?.data?.message || "Failed to subscribe. Please try again.");
        } finally {
            setIsSubscribing(false);
        }
    };

    // ─── Loading / Error states ──────────────────────────────────────────────

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    if (error || !data) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7]">
                <ChefHat className="w-16 h-16 text-gray-300 mb-4" />
                <h2 className="text-xl font-semibold text-gray-900 mb-2">Kitchen not found</h2>
                <p className="text-gray-500 mb-4">{error || "This kitchen doesn't exist"}</p>
                <Link href="/kitchens" className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors">
                    Browse Other Kitchens
                </Link>
            </div>
        );
    }

    const { provider, tiffins, weeklyMenu, stats } = data;

    // Cuisine tags from available types
    const cuisineTags: string[] = [];
    if (stats.types.includes("veg") && !stats.types.includes("non-veg")) cuisineTags.push("PURE VEG");
    else if (stats.types.includes("veg")) cuisineTags.push("Veg");
    if (stats.types.includes("non-veg")) cuisineTags.push("Non-Veg");
    if (stats.types.includes("vegan")) cuisineTags.push("Vegan");
    cuisineTags.push("Home Style");

    // Calculate weekly total
    const weeklyTotal = weeklyMenu
        ? DAYS.reduce((sum, day) => {
            const d = weeklyMenu.menu[day];
            if (d.isHoliday) return sum;
            return sum + (d.lunchPrice || 0) + (d.dinnerPrice || 0);
        }, 0)
        : 0;
    const weeklyPrice = weeklyMenu?.weeklyPrice && weeklyMenu.weeklyPrice > 0 ? weeklyMenu.weeklyPrice : weeklyTotal;

    return (
        <div className="min-h-screen bg-[#FDFBF7]">
            <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />

            {/* ═══════ HERO HEADER ═══════ */}
            <section className="relative">
                <div className="bg-gradient-to-br from-[#1a3a2a] via-[#2d5a3d] to-[#3a6b4a] pt-8 pb-12 px-4">
                    <div className="max-w-6xl mx-auto">
                        <div className="flex flex-col md:flex-row items-start md:items-center gap-6">
                            {/* Avatar */}
                            <div className="w-28 h-28 rounded-2xl bg-orange-100/80 shadow-lg flex items-center justify-center flex-shrink-0 overflow-hidden border-4 border-white/20">
                                <ChefHat className="w-14 h-14 text-orange-400" />
                            </div>

                            {/* Info */}
                            <div className="flex-1">
                                <div className="flex items-center gap-3 mb-2">
                                    <h1 className="text-3xl md:text-4xl font-bold text-white tracking-tight">
                                        {provider.name}&apos;s Kitchen
                                    </h1>
                                    <BadgeCheck className="w-7 h-7 text-green-400 flex-shrink-0" />
                                </div>
                                <div className="flex flex-wrap items-center gap-4 mb-4 text-white/80 text-sm">
                                    {provider.address?.city && (
                                        <span className="flex items-center gap-1">
                                            <MapPin className="w-4 h-4 text-orange-400" />
                                            {provider.address.street ? `${provider.address.street}, ` : ""}{provider.address.city}
                                        </span>
                                    )}
                                    <span className="flex items-center gap-1">
                                        <Star className="w-4 h-4 text-yellow-400 fill-yellow-400" />
                                        <span className="font-semibold text-white">4.8</span>
                                        <span className="text-white/60">(500+ reviews)</span>
                                    </span>
                                </div>
                                <div className="flex flex-wrap gap-2">
                                    {cuisineTags.map((tag) => (
                                        <span
                                            key={tag}
                                            className={`px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wide ${tag === "PURE VEG"
                                                ? "bg-green-500 text-white"
                                                : tag === "Non-Veg"
                                                    ? "bg-red-500/80 text-white"
                                                    : "bg-white/15 text-white/90 backdrop-blur-sm border border-white/20"
                                                }`}
                                        >
                                            {tag === "PURE VEG" && "● "}{tag}
                                        </span>
                                    ))}
                                </div>
                            </div>

                            {/* Performance + Contact */}
                            <div className="flex flex-col items-end gap-3 flex-shrink-0">
                                <div className="text-right">
                                    <p className="text-xs text-white/50 uppercase tracking-widest font-semibold mb-1">Performance</p>
                                    <p className="text-3xl font-bold text-white">1.2k+
                                        <span className="text-sm font-normal text-white/60 ml-1">Meals Served</span>
                                    </p>
                                </div>
                                {provider.phone && (
                                    <a
                                        href={`tel:${provider.phone}`}
                                        className="flex items-center gap-2 px-5 py-2.5 bg-white text-gray-900 rounded-xl font-semibold text-sm hover:bg-gray-100 transition-colors shadow-md"
                                    >
                                        <Phone className="w-4 h-4" /> Contact Chef
                                    </a>
                                )}
                            </div>
                        </div>
                    </div>
                </div>
            </section>

            {/* ═══════ TAB SWITCHER ═══════ */}
            <div className="max-w-6xl mx-auto px-4 -mt-6 relative z-10">
                <div className="flex justify-center">
                    <div className="inline-flex bg-white rounded-full shadow-lg border border-gray-100 p-1.5">
                        <button
                            onClick={() => setActiveTab("menu")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === "menu"
                                ? "bg-gray-900 text-white shadow-md"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <UtensilsCrossed className="w-4 h-4" /> All Meals
                        </button>
                        <button
                            onClick={() => setActiveTab("weekly")}
                            className={`flex items-center gap-2 px-6 py-2.5 rounded-full text-sm font-semibold transition-all ${activeTab === "weekly"
                                ? "bg-gray-900 text-white shadow-md"
                                : "text-gray-500 hover:text-gray-700"
                                }`}
                        >
                            <Calendar className="w-4 h-4" /> Weekly Menu
                        </button>
                    </div>
                </div>
            </div>

            {/* ═══════ CONTENT ═══════ */}
            <main className="max-w-6xl mx-auto px-4 py-10">

                {/* ─── ALL MEALS TAB ─── */}
                {activeTab === "menu" && (
                    <div>
                        {tiffins.length === 0 ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                <UtensilsCrossed className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">No meals available right now</p>
                                <p className="text-gray-400 text-sm mt-1">Check back later for fresh listings</p>
                            </div>
                        ) : (
                            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                                {tiffins.map((tiffin, index) => (
                                    <motion.div
                                        key={tiffin._id}
                                        initial={{ opacity: 0, y: 20 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: index * 0.06 }}
                                        className="bg-white rounded-2xl overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all group"
                                    >
                                        {/* Image + badges */}
                                        <div className="relative h-48 bg-gradient-to-br from-orange-50 to-amber-50 overflow-hidden">
                                            {tiffin.images?.[0] ? (
                                                <Image
                                                    src={tiffin.images[0]}
                                                    alt={tiffin.name}
                                                    fill
                                                    className="object-cover group-hover:scale-105 transition-transform duration-500"
                                                />
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center">
                                                    <UtensilsCrossed className="w-12 h-12 text-orange-200" />
                                                </div>
                                            )}

                                            {/* Cutoff badge */}
                                            <div className="absolute top-3 left-3 right-3 flex justify-center">
                                                <span className="px-3 py-1 bg-[#1a3a2a] text-white text-[10px] font-bold uppercase tracking-wider rounded-full shadow-lg">
                                                    Order before {formatCutoff(tiffin.cutoffTime)}
                                                </span>
                                            </div>

                                            {/* Meal type pill */}
                                            <div className="absolute bottom-3 left-3">
                                                <span className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold shadow-sm backdrop-blur-md ${tiffin.mealType === "lunch"
                                                    ? "bg-white/90 text-green-700"
                                                    : tiffin.mealType === "dinner"
                                                        ? "bg-white/90 text-purple-700"
                                                        : "bg-white/90 text-orange-700"
                                                    }`}>
                                                    <span className={`w-2 h-2 rounded-full ${tiffin.mealType === "lunch"
                                                        ? "bg-green-500"
                                                        : tiffin.mealType === "dinner"
                                                            ? "bg-purple-500"
                                                            : "bg-orange-500"
                                                        }`}></span>
                                                    {tiffin.mealType.charAt(0).toUpperCase() + tiffin.mealType.slice(1)}
                                                </span>
                                            </div>
                                        </div>

                                        {/* Content */}
                                        <div className="p-4">
                                            <h3 className="font-bold text-gray-900 text-base mb-1 line-clamp-1">{tiffin.name}</h3>
                                            <p className="text-sm text-gray-500 line-clamp-2 leading-relaxed mb-4 min-h-[2.5rem]">
                                                {tiffin.description}
                                            </p>
                                            <div className="flex items-end justify-between">
                                                <div>
                                                    <p className="text-[10px] uppercase text-gray-400 tracking-wider font-medium">Price per meal</p>
                                                    <p className="text-xl font-bold text-gray-900">₹{tiffin.price}</p>
                                                </div>
                                                <button
                                                    onClick={() => {
                                                        addToCart({
                                                            tiffinId: tiffin._id,
                                                            name: tiffin.name,
                                                            price: tiffin.price,
                                                            quantity: 1,
                                                            providerId: provider._id,
                                                            type: tiffin.type,
                                                            image: tiffin.images?.[0] || "https://images.unsplash.com/photo-1546069901-ba9599a7e63c",
                                                        });
                                                        setIsCartOpen(true);
                                                    }}
                                                    className="flex items-center gap-1.5 px-4 py-2 bg-orange-500 hover:bg-orange-600 text-white text-sm font-semibold rounded-lg transition-colors shadow-sm"
                                                >
                                                    Add <Plus className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </div>
                                    </motion.div>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* ─── WEEKLY MENU TAB ─── */}
                {activeTab === "weekly" && (
                    <div>
                        {!weeklyMenu ? (
                            <div className="text-center py-16 bg-white rounded-2xl border border-gray-100">
                                <Calendar className="w-14 h-14 text-gray-200 mx-auto mb-4" />
                                <p className="text-gray-500 text-lg">Weekly menu not available yet</p>
                                <p className="text-gray-400 text-sm mt-1">This chef hasn&apos;t published a weekly plan</p>
                            </div>
                        ) : (
                            <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="p-6 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                                    <div>
                                        <h2 className="text-xl font-bold text-gray-900">Next Week&apos;s Plan</h2>
                                        <p className="text-sm text-gray-400 mt-0.5">Plan your meals ahead. Menu is subject to availability.</p>
                                    </div>
                                    <div className="flex items-center gap-2">
                                        <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                                            <ChevronLeft className="w-4 h-4 text-gray-500" />
                                        </button>
                                        <span className="px-4 py-1.5 border border-gray-200 rounded-full text-sm font-medium text-gray-700">
                                            {weeklyMenu.weekStartDate
                                                ? new Date(weeklyMenu.weekStartDate).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                                : "This Week"
                                            }
                                            {" – "}
                                            {weeklyMenu.weekStartDate
                                                ? new Date(new Date(weeklyMenu.weekStartDate).getTime() + 6 * 86400000).toLocaleDateString("en-US", { month: "short", day: "numeric" })
                                                : "Next Week"
                                            }
                                        </span>
                                        <button className="p-2 rounded-full border border-gray-200 hover:bg-gray-50 transition-colors">
                                            <ChevronRight className="w-4 h-4 text-gray-500" />
                                        </button>
                                    </div>
                                </div>

                                {/* Table */}
                                <div className="overflow-x-auto">
                                    <table className="w-full border-collapse">
                                        <thead>
                                            <tr className="border-t border-b border-gray-100">
                                                <th className="text-left px-6 py-3 text-xs font-semibold text-gray-400 uppercase tracking-wider w-28">Meal</th>
                                                {DAY_LABELS.map((label, i) => (
                                                    <th
                                                        key={label}
                                                        className={`text-left px-4 py-3 text-xs font-semibold uppercase tracking-wider ${i === 6 ? "text-red-500" : "text-gray-500"
                                                            }`}
                                                    >
                                                        {label}
                                                    </th>
                                                ))}
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {/* Lunch Row */}
                                            <tr className="border-b border-gray-50">
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <Sun className="w-4 h-4 text-orange-500" />
                                                        <div>
                                                            <p className="font-semibold text-orange-600 text-sm">Lunch</p>
                                                            <p className="text-[10px] text-gray-400">12:00 PM - 2:00 PM</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {DAYS.map((day, i) => {
                                                    const d = weeklyMenu.menu[day];
                                                    return (
                                                        <td key={`lunch-${day}`} className="px-4 py-5">
                                                            {d.isHoliday ? (
                                                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-400 text-xs rounded-md font-medium">Closed</span>
                                                            ) : d.lunch ? (
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">{d.lunch}</p>
                                                                    {d.lunchPrice > 0 && <p className="text-xs text-gray-400 mt-0.5">₹{d.lunchPrice}</p>}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-300">—</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>

                                            {/* Dinner Row */}
                                            <tr>
                                                <td className="px-6 py-5">
                                                    <div className="flex items-center gap-2">
                                                        <Moon className="w-4 h-4 text-indigo-500" />
                                                        <div>
                                                            <p className="font-semibold text-indigo-600 text-sm">Dinner</p>
                                                            <p className="text-[10px] text-gray-400">7:00 PM - 9:00 PM</p>
                                                        </div>
                                                    </div>
                                                </td>
                                                {DAYS.map((day) => {
                                                    const d = weeklyMenu.menu[day];
                                                    return (
                                                        <td key={`dinner-${day}`} className="px-4 py-5">
                                                            {d.isHoliday ? (
                                                                <span className="inline-block px-3 py-1 bg-gray-100 text-gray-400 text-xs rounded-md font-medium">Closed</span>
                                                            ) : d.dinner ? (
                                                                <div>
                                                                    <p className="text-sm font-medium text-gray-900">{d.dinner}</p>
                                                                    {d.dinnerPrice > 0 && <p className="text-xs text-gray-400 mt-0.5">₹{d.dinnerPrice}</p>}
                                                                </div>
                                                            ) : (
                                                                <span className="text-xs text-gray-300">—</span>
                                                            )}
                                                        </td>
                                                    );
                                                })}
                                            </tr>
                                        </tbody>
                                    </table>
                                </div>

                                {/* Subscribe CTA */}
                                <div className="p-6 border-t border-gray-100 bg-gradient-to-r from-orange-50 to-amber-50">
                                    <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-lg">Subscribe to Weekly Plan</h3>
                                            <p className="text-sm text-gray-500 mt-0.5">
                                                Get all meals delivered Mon–Sat.
                                                {weeklyPrice > 0 && (
                                                    <span className="ml-1">
                                                        Save up to <span className="font-semibold text-green-600">₹{weeklyTotal - weeklyPrice}</span>/week!
                                                    </span>
                                                )}
                                            </p>
                                        </div>
                                        <div className="flex items-center gap-4">
                                            {weeklyPrice > 0 && (
                                                <div className="text-right">
                                                    {weeklyTotal > weeklyPrice && (
                                                        <p className="text-sm text-gray-400 line-through">₹{weeklyTotal}/week</p>
                                                    )}
                                                    <p className="text-2xl font-bold text-orange-600">₹{weeklyPrice}<span className="text-xs font-normal text-gray-500">/week</span></p>
                                                </div>
                                            )}
                                            <button
                                                onClick={() => setShowSubscribeModal(true)}
                                                className="px-6 py-3 bg-orange-500 hover:bg-orange-600 text-white font-semibold rounded-xl shadow-md shadow-orange-500/30 transition-all transform active:scale-[0.97]"
                                            >
                                                Subscribe Now
                                            </button>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}
                    </div>
                )}
            </main>

            {/* ═══════ SUBSCRIBE MODAL ═══════ */}
            <AnimatePresence>
                {showSubscribeModal && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-[100] flex items-center justify-center"
                    >
                        {/* Backdrop */}
                        <div className="absolute inset-0 bg-black/50 backdrop-blur-sm" onClick={() => setShowSubscribeModal(false)} />

                        {/* Modal */}
                        <motion.div
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            className="relative bg-white rounded-2xl shadow-2xl w-full max-w-lg mx-4 max-h-[85vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="sticky top-0 bg-white border-b border-gray-100 p-6 pb-4 flex items-center justify-between rounded-t-2xl">
                                <div>
                                    <h3 className="text-xl font-bold text-gray-900">Subscribe to Weekly Plan</h3>
                                    <p className="text-sm text-gray-500 mt-0.5">{provider.name}&apos;s Kitchen</p>
                                </div>
                                <button onClick={() => setShowSubscribeModal(false)} className="p-2 rounded-full hover:bg-gray-100 transition-colors">
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            <div className="p-6 space-y-6">
                                {/* Plan Summary */}
                                <div className="bg-orange-50 rounded-xl p-4">
                                    <h4 className="font-semibold text-sm text-gray-900 mb-3">Plan Summary</h4>
                                    <div className="space-y-2 text-sm">
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Duration</span>
                                            <span className="font-medium">1 Week (Mon – Sat)</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Meals Included</span>
                                            <span className="font-medium">Lunch + Dinner daily</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-gray-500">Delivery</span>
                                            <span className="font-medium text-green-600">Free</span>
                                        </div>
                                        <div className="border-t border-orange-200 pt-2 mt-2 flex justify-between">
                                            <span className="font-semibold text-gray-900">Total</span>
                                            <span className="font-bold text-orange-600 text-lg">₹{weeklyPrice || weeklyTotal}</span>
                                        </div>
                                    </div>
                                </div>

                                {/* Delivery Address */}
                                <div>
                                    <h4 className="font-semibold text-sm text-gray-900 mb-3 flex items-center gap-2">
                                        <MapPin className="w-4 h-4 text-orange-500" /> Delivery Address
                                    </h4>
                                    {savedAddresses.length > 0 ? (
                                        <div className="space-y-2">
                                            {savedAddresses.map((addr) => {
                                                const isSelected = selectedAddressId === addr._id;
                                                return (
                                                    <div
                                                        key={addr._id}
                                                        onClick={() => setSelectedAddressId(addr._id)}
                                                        className={`p-3 rounded-xl cursor-pointer transition-all ${isSelected
                                                            ? "border-2 border-orange-500 bg-orange-50/50"
                                                            : "border border-gray-200 hover:border-gray-300"
                                                            }`}
                                                    >
                                                        <div className="flex items-start gap-2">
                                                            <span className="mt-0.5 text-gray-400">
                                                                {addr.label?.toLowerCase() === "home" ? <Home className="w-4 h-4" /> : <Briefcase className="w-4 h-4" />}
                                                            </span>
                                                            <div>
                                                                <p className="font-medium text-sm">{addr.label || "Home"}</p>
                                                                <p className="text-xs text-gray-500">{addr.street}, {addr.city} - {addr.pincode}</p>
                                                            </div>
                                                            {isSelected && <Check className="w-4 h-4 text-orange-500 ml-auto" />}
                                                        </div>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <p className="text-sm text-gray-400 text-center py-4">No saved addresses. Please add one from checkout first.</p>
                                    )}
                                </div>

                                {/* Error / Success */}
                                {subscribeError && (
                                    <div className="p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">{subscribeError}</div>
                                )}
                                {subscribeSuccess && (
                                    <div className="p-4 bg-green-50 border border-green-200 text-green-700 text-sm rounded-xl flex items-center gap-2">
                                        <Check className="w-5 h-5" /> Subscription created successfully! 🎉
                                    </div>
                                )}

                                {/* Subscribe Button */}
                                {!subscribeSuccess && (
                                    <button
                                        onClick={handleSubscribe}
                                        disabled={isSubscribing || savedAddresses.length === 0}
                                        className="w-full py-3.5 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold rounded-xl shadow-lg shadow-orange-500/30 transition-all transform active:scale-[0.98] flex items-center justify-center gap-2"
                                    >
                                        {isSubscribing ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" /> Processing...
                                            </>
                                        ) : (
                                            <>Confirm Subscription · ₹{weeklyPrice || weeklyTotal}</>
                                        )}
                                    </button>
                                )}
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
