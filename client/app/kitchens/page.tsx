"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import dynamic from "next/dynamic";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import CartSidebar from "@/components/CartSidebar";
import NotificationDropdown from "@/components/NotificationDropdown";
import {
    UtensilsCrossed,
    Search,
    Star,
    MapPin,
    LogOut,
    User,
    Loader2,
    Navigation,
    ShoppingBag,
    Leaf,
    Drumstick,
    ArrowRight,
    Map as MapIcon,
    List,
    Bell,
    Moon,
    Grid,
    Flame,
    ArrowLeft,
    ChefHat,
} from "lucide-react";
import { motion } from "framer-motion";
import TiffinDetailsModal from "@/components/TiffinDetailsModal";
import Footer from "@/components/Footer";

// Dynamic import for map component (SSR-safe)
const KitchenMap = dynamic(() => import("@/components/KitchenMap"), {
    ssr: false,
    loading: () => (
        <div className="w-full h-[500px] rounded-2xl bg-gray-100 dark:bg-card-dark animate-pulse flex items-center justify-center">
            <Loader2 className="w-8 h-8 animate-spin text-gray-400" />
        </div>
    ),
});

interface Provider {
    _id: string;
    name: string;
    address?: {
        city?: string;
        coordinates?: { lat: number, lng: number };
    };
    tiffinCount: number;
    avgPrice: number;
    minPrice: number;
    maxPrice: number;
    types: string[];
    mealTypes: string[];
    distance?: number | null;
}

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
    provider: any; // Used in TiffinDetailsModal
    distance?: number;
}



export default function KitchensPage() {
    const { user, isLoading: authLoading, logout, isAuthenticated } = useAuth();
    const { location, setLocation, isLoading: locationLoading, requestLocation } = useLocation();
    const { cartCount } = useCart();
    const router = useRouter();

    const [providers, setProviders] = useState<Provider[]>([]);
    const [specials, setSpecials] = useState<Tiffin[]>([]);

    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Filters
    const [searchQuery, setSearchQuery] = useState("");
    const [viewMode, setViewMode] = useState<"grid" | "map">("grid");
    const [dietFilter, setDietFilter] = useState<string[]>([]);
    const [cuisineFilter, setCuisineFilter] = useState<string>("");
    const [sortBy, setSortBy] = useState<string>("Rating: High to Low");
    const [isCartOpen, setIsCartOpen] = useState(false);

    // Location setup
    useEffect(() => {
        if (!isAuthenticated || authLoading) return;
        if (location) return;

        const checkLocation = async () => {
            const userAny = user as any;
            if (userAny?.address?.coordinates?.lat && userAny?.address?.coordinates?.lng) {
                setLocation({
                    lat: userAny.address.coordinates.lat,
                    lng: userAny.address.coordinates.lng
                });
            } else {
                setTimeout(() => requestLocation(), 1000);
            }
        };
        checkLocation();
    }, [isAuthenticated, authLoading, location, user, setLocation, requestLocation]);

    // Fetch providers and specials
    useEffect(() => {
        const fetchProviders = async () => {
            try {
                setIsLoading(true);
                const params = new URLSearchParams();

                // Default to Narhe, Pune if location not available yet
                const lat = location ? location.lat.toString() : "18.4410";
                const lng = location ? location.lng.toString() : "73.8184";

                params.set("lat", lat);
                params.set("lng", lng);
                params.set("radius", "15"); // 15 km radius

                const q = params.toString();
                const [providersRes, tiffinsRes] = await Promise.all([
                    axios.get(`/providers?${q}`),
                    axios.get(`/tiffins/nearby?${q}`)
                ]);

                const fetchedProviders: Provider[] = providersRes.data;
                const fetchedTiffins: Tiffin[] = tiffinsRes.data;

                setProviders(fetchedProviders);

                // Specials: Top rated or highly active menus (taking first 6 for now)
                setSpecials(fetchedTiffins.slice(0, 6));



            } catch (err: any) {
                setError(err.response?.data?.message || "Failed to load kitchens");
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) fetchProviders();
    }, [isAuthenticated, location]);

    // Toggle styling
    const toggleDarkMode = () => document.documentElement.classList.toggle('dark');

    // Filtering & Sorting Logic
    let filteredProviders = providers.filter((p) => {
        const matchesSearch = p.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            p.address?.city?.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesDiet = dietFilter.length === 0 || dietFilter.some(diet => {
            if (diet === "Pure Veg") return p.types.includes("veg") && !p.types.includes("non-veg");
            if (diet === "Non-Veg") return p.types.includes("non-veg");
            if (diet === "Jain") return p.types.includes("jain") || p.types.includes("veg"); // Approx
            return true;
        });

        // Add cuisine matching here when backend supports it

        return matchesSearch && matchesDiet;
    });

    if (sortBy === "Distance: Near to Far") {
        filteredProviders.sort((a, b) => (a.distance || 999) - (b.distance || 999));
    } else if (sortBy === "Price: Low to High") {
        filteredProviders.sort((a, b) => a.minPrice - b.minPrice);
    } // Rating high to low is roughly default or needs actual rating field

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-cream">
                <Loader2 className="w-8 h-8 animate-spin text-primary-500" />
            </div>
        );
    }

    if (!isAuthenticated) return null;

    return (
        <div className="min-h-screen bg-warm-white text-gray-900 font-sans transition-colors duration-500 antialiased selection:bg-primary-200 selection:text-primary-900 overflow-x-hidden">

            {/* ========== NAVBAR ========== */}
            <Navbar />

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 relative">

                {/* Background Blobs for Aesthetic */}
                <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-primary-100/50 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob pointer-events-none -z-10"></div>
                <div className="absolute top-40 right-10 w-[400px] h-[400px] bg-secondary-100/40 rounded-full mix-blend-multiply filter blur-[80px] opacity-70 animate-blob animation-delay-2000 pointer-events-none -z-10"></div>

                {/* ========== HERO ========== */}
                <div className="mb-14 relative z-10">
                    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.6 }}>
                        <h1 className="font-display text-5xl md:text-7xl font-extrabold text-gray-900 mb-4 leading-[1.1] tracking-tight">
                            <span className="gradient-text-orange inline-block">Discover</span> <br className="hidden md:block" />Local Home Chefs.
                        </h1>
                        <p className="text-xl text-gray-600 max-w-2xl font-medium leading-relaxed">
                            Find the best home kitchens delivering in your area.
                        </p>
                    </motion.div>
                </div>

                {/* ========== TODAY'S SPECIALS CAROUSEL ========== */}
                <section className="mb-16 relative z-10">
                    <div className="flex items-center justify-between mb-8">
                        <h2 className="text-2xl font-bold flex items-center gap-3 text-gray-900">
                            <div className="w-10 h-10 rounded-full bg-orange-100 flex items-center justify-center">
                                <Flame className="w-5 h-5 text-primary-500 animate-[pulse_2s_ease-in-out_infinite]" />
                            </div>
                            <span className="font-display tracking-tight text-3xl">Today&apos;s Specials</span>
                        </h2>
                        <div className="flex gap-3">
                            <button className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:border-primary-400 hover:text-primary-500 hover:shadow-md transition-all">
                                <ArrowLeft className="w-5 h-5" />
                            </button>
                            <button className="w-10 h-10 rounded-full bg-white border border-gray-200 shadow-sm flex items-center justify-center hover:border-primary-400 hover:text-primary-500 hover:shadow-md transition-all">
                                <ArrowRight className="w-5 h-5" />
                            </button>
                        </div>
                    </div>

                    <div className="flex gap-6 overflow-x-auto pb-8 pt-2 scrollbar-hide snap-x px-2 -mx-2">
                        {specials.map((item, idx) => (
                            <motion.div
                                initial={{ opacity: 0, x: 20 }}
                                animate={{ opacity: 1, x: 0 }}
                                transition={{ delay: idx * 0.1, duration: 0.5 }}
                                key={item._id}
                                onClick={() => router.push(`/kitchens/${item.provider?._id}`)}
                                className="min-w-[320px] h-56 rounded-[2rem] relative overflow-hidden group cursor-pointer shadow-lg shadow-gray-200/50 snap-center shrink-0 border border-white/40"
                            >
                                <img src={item.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'} alt={item.name} className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/40 to-transparent p-6 flex flex-col justify-end">
                                    <span className={`bg-orange-500 text-white shadow-sm text-xs font-bold px-3 py-1.5 rounded-lg w-max mb-3 tracking-wide uppercase`}>
                                        {item.type === 'veg' ? 'Pure Veg' : item.type === 'vegan' ? 'Vegan' : 'Non-Veg'}
                                    </span>
                                    <h3 className="text-white font-display font-bold text-2xl leading-tight mb-1.5 group-hover:text-primary-200 transition-colors">{item.name}</h3>
                                    <p className="text-gray-300 text-sm font-medium flex items-center gap-2">
                                        <ChefHat className="w-4 h-4" /> By {item.provider?.name || "Kitchen"}
                                    </p>
                                </div>
                            </motion.div>
                        ))}
                        {specials.length === 0 && !isLoading && (
                            <p className="text-gray-500 italic px-4 py-8">Loading fresh menus...</p>
                        )}
                    </div>
                </section>



                <div className="flex flex-col lg:flex-row gap-8">

                    {/* ========== SIDEBAR FILTERS ========== */}
                    <aside className="w-full lg:w-[320px] flex-shrink-0 z-10">
                        <div className="sticky top-28 space-y-6">

                            {/* Search */}
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                                    <Search className="w-5 h-5 text-gray-400 group-focus-within:text-primary-500 transition-colors" />
                                </div>
                                <input
                                    type="text"
                                    placeholder="Search dishes or chefs..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    className="w-full pl-12 pr-4 py-4 rounded-2xl glass-card border border-white focus:outline-none focus:ring-4 focus:ring-primary-100 focus:border-primary-400 shadow-sm placeholder-gray-400 text-base font-medium text-gray-900 transition-all"
                                />
                            </div>

                            {/* Dietary Preference */}
                            <div className="glass-card rounded-[2rem] p-7 border border-white shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="font-display font-bold text-xl mb-5 text-gray-900 flex items-center justify-between">
                                    Dietary Options
                                    {dietFilter.length > 0 && (
                                        <button onClick={() => setDietFilter([])} className="text-xs text-primary-600 font-bold bg-primary-50 px-3 py-1.5 rounded-full hover:bg-primary-100 transition-colors">Clear</button>
                                    )}
                                </h3>
                                <div className="space-y-4">
                                    {["Pure Veg", "Non-Veg", "Jain", "Eggetarian"].map((diet) => (
                                        <label key={diet} className="flex items-center justify-between cursor-pointer group p-2 hover:bg-white rounded-xl transition-colors -mx-2">
                                            <span className="text-base font-medium text-gray-700 group-hover:text-gray-900">{diet}</span>
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="checkbox"
                                                    className="peer sr-only"
                                                    checked={dietFilter.includes(diet)}
                                                    onChange={() => {
                                                        setDietFilter(prev => prev.includes(diet) ? prev.filter(d => d !== diet) : [...prev, diet]);
                                                    }}
                                                />
                                                <div className="w-6 h-6 rounded border-2 border-gray-200 bg-white peer-checked:bg-primary-500 peer-checked:border-primary-500 transition-all shadow-sm"></div>
                                                <svg className="absolute w-4 h-4 text-white pointer-events-none opacity-0 peer-checked:opacity-100 transition-opacity" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                                                    <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                                                </svg>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Cuisine */}
                            <div className="glass-card rounded-[2rem] p-7 border border-white shadow-sm hover:shadow-md transition-shadow">
                                <h3 className="font-display font-bold text-xl mb-5 text-gray-900">Cuisine Focus</h3>
                                <div className="flex flex-wrap gap-2.5">
                                    {["North Indian", "South Indian", "Maharashtrian", "Bengali", "Healthy", "Desserts"].map((cuisine) => (
                                        <button
                                            key={cuisine}
                                            onClick={() => setCuisineFilter(cuisine === cuisineFilter ? "" : cuisine)}
                                            className={`px-4 py-2 rounded-xl text-sm font-semibold transition-all border shadow-sm ${cuisine === cuisineFilter
                                                ? "bg-primary-500 text-white border-primary-500 shadow-glow-orange scale-105"
                                                : "bg-white text-gray-600 border-gray-100 hover:border-primary-200 hover:text-primary-600 hover:bg-primary-50"
                                                }`}
                                        >
                                            {cuisine}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* CTA Banner */}
                            <div className="hidden lg:flex relative rounded-[2rem] overflow-hidden aspect-[4/5] shadow-lg border border-white/50 group transform hover:-translate-y-1 transition-all duration-300">
                                <img src="https://images.unsplash.com/photo-1556910103-1c02745aae4d?w=500&auto=format&fit=crop&q=60" alt="Cooking" className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110" />
                                <div className="absolute inset-0 bg-gradient-to-t from-primary-900/90 via-primary-600/70 to-primary-900/30 flex flex-col items-center justify-end text-center p-8">
                                    <div className="w-14 h-14 bg-white/20 backdrop-blur-md rounded-2xl flex items-center justify-center mb-4 text-white shadow-inner">
                                        <ChefHat className="w-7 h-7" />
                                    </div>
                                    <h3 className="text-white font-display font-bold text-3xl mb-2">Join as a Chef</h3>
                                    <p className="text-white/90 text-sm mb-6 font-medium leading-relaxed">Share your culinary gift with the neighborhood. Turn passion into profit.</p>
                                    <button className="w-full bg-white text-primary-600 py-3.5 rounded-xl font-bold text-sm shadow-lg hover:shadow-xl hover:bg-gray-50 transition-all border border-white/40">Start Selling Now</button>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* ========== MAIN CONTENT AREA ========== */}
                    <div className="flex-1">

                        {/* Section Header */}
                        <div className="flex flex-col sm:flex-row sm:items-center justify-between mb-8 gap-4 bg-white/40 backdrop-blur-md p-4 rounded-2xl border border-white shadow-sm z-10 relative">
                            <div className="flex items-center gap-4">
                                <h2 className="text-2xl font-display font-bold text-gray-900">Recommended Chefs</h2>

                                {/* View Toggle */}
                                <div className="flex bg-gray-100/80 backdrop-blur-sm rounded-xl p-1.5 shadow-inner border border-gray-200/50">
                                    <button
                                        onClick={() => setViewMode("grid")}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === "grid" ? "bg-white text-primary-600 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        <Grid className="w-4 h-4" /> Grid
                                    </button>
                                    <button
                                        onClick={() => setViewMode("map")}
                                        className={`px-4 py-2 rounded-lg text-sm font-bold transition-all flex items-center gap-2 ${viewMode === "map" ? "bg-white text-primary-600 shadow-sm border border-gray-200/50" : "text-gray-500 hover:text-gray-700"
                                            }`}
                                    >
                                        <MapIcon className="w-4 h-4" /> Map
                                    </button>
                                </div>
                            </div>

                            {/* Sorting */}
                            <div className="flex items-center gap-3 text-sm font-medium text-gray-600 bg-white px-4 py-2 rounded-xl shadow-sm border border-gray-100 cursor-pointer hover:border-primary-300 transition-colors">
                                <Search className="w-4 h-4 text-primary-400" />
                                <span className="text-gray-400">Sort:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="bg-transparent border-none text-gray-900 font-bold focus:ring-0 cursor-pointer py-0 outline-none w-[160px]"
                                >
                                    <option>Rating: High to Low</option>
                                    <option>Distance: Near to Far</option>
                                    <option>Price: Low to High</option>
                                </select>
                            </div>
                        </div>

                        {isLoading && (
                            <div className="flex items-center justify-center py-20">
                                <Loader2 className="w-8 h-8 animate-spin text-primary" />
                            </div>
                        )}

                        {!isLoading && filteredProviders.length === 0 && (
                            <div className="text-center py-20">
                                <div className="w-16 h-16 mx-auto mb-4 bg-orange-100 dark:bg-card-dark rounded-full flex items-center justify-center">
                                    <UtensilsCrossed className="w-8 h-8 text-primary" />
                                </div>
                                <h3 className="text-xl font-bold mb-2">No chefs found</h3>
                                <p className="text-text-muted-light dark:text-text-muted-dark">Try adjusting your filters or search criteria.</p>
                            </div>
                        )}

                        {/* ========== MAP VIEW ========== */}
                        {!isLoading && viewMode === "map" && filteredProviders.length > 0 && (
                            <div className="w-full h-[600px] rounded-2xl overflow-hidden border border-gray-200 shadow-soft">
                                <KitchenMap
                                    kitchens={filteredProviders}
                                    userLocation={location}
                                    radiusKm={15}
                                />
                            </div>
                        )}

                        {/* ========== GRID VIEW ========== */}
                        {!isLoading && viewMode === "grid" && filteredProviders.length > 0 && (
                            <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6 relative z-10">
                                {filteredProviders.map((provider, idx) => (
                                    <motion.article
                                        initial={{ opacity: 0, y: 30 }}
                                        animate={{ opacity: 1, y: 0 }}
                                        transition={{ delay: idx * 0.08, type: "spring", stiffness: 100 }}
                                        key={provider._id}
                                        className="bg-white rounded-[2rem] overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-primary-500/10 transition-all duration-500 border border-gray-100 group flex flex-col transform hover:-translate-y-2"
                                    >
                                        <Link href={`/kitchens/${provider._id}`} className="flex flex-col h-full">
                                            <div className="relative h-56 overflow-hidden">
                                                <img
                                                    src="https://images.unsplash.com/photo-1547592180-85f173990554?auto=format&fit=crop&q=80"
                                                    alt="Kitchen"
                                                    className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-110"
                                                />
                                                <div className="absolute inset-0 bg-gradient-to-t from-gray-900/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                                                <div className="absolute top-4 left-4 flex gap-2">
                                                    {provider.types.includes("veg") && (
                                                        <span className="bg-white/95 backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm text-secondary-700 flex items-center gap-1.5">
                                                            <Leaf className="w-3.5 h-3.5" /> Pure Veg
                                                        </span>
                                                    )}
                                                    {provider.types.includes("non-veg") && (
                                                        <span className="bg-white/95 backdrop-blur-md text-xs font-bold px-3 py-1.5 rounded-lg shadow-sm text-red-600 flex items-center gap-1.5">
                                                            <Drumstick className="w-3.5 h-3.5" /> Non-Veg
                                                        </span>
                                                    )}
                                                </div>
                                                <div className="absolute top-4 right-4 w-10 h-10 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center text-white hover:bg-white hover:text-red-500 transition-colors shadow-sm cursor-pointer border border-white/40">
                                                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4.318 6.318a4.5 4.5 0 000 6.364L12 20.364l7.682-7.682a4.5 4.5 0 00-6.364-6.364L12 7.636l-1.318-1.318a4.5 4.5 0 00-6.364 0z"></path></svg>
                                                </div>
                                                <div className="absolute -bottom-7 right-6 w-20 h-20 rounded-full border-[6px] border-white overflow-hidden shadow-lg z-10 bg-white group-hover:scale-110 transition-transform duration-500">
                                                    <div className="w-full h-full flex items-center justify-center bg-gradient-orange text-white">
                                                        <User className="w-8 h-8" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div className="p-7 pt-9 flex-1 flex flex-col bg-white">
                                                <h3 className="font-display font-extrabold text-2xl text-gray-900 group-hover:text-primary-600 transition-colors mb-2 truncate">
                                                    {provider.name}
                                                </h3>
                                                <p className="text-base text-gray-500 mb-4 line-clamp-2 leading-relaxed">
                                                    Authentic home cooked meals offering {provider.types.join(", ")}.
                                                </p>
                                                <div className="flex items-center gap-5 text-sm text-gray-500 mb-6 font-semibold bg-gray-50 py-2.5 px-4 rounded-xl">
                                                    <div className="flex items-center gap-1.5 text-yellow-500 bg-yellow-50 px-2 py-1 rounded-lg">
                                                        <Star className="w-4 h-4 fill-current" />
                                                        <span className="text-gray-900">4.8</span> <span className="text-gray-400 font-medium">(120)</span>
                                                    </div>
                                                    {provider.distance !== null && provider.distance !== undefined && (
                                                        <div className="flex items-center gap-1.5 text-gray-600">
                                                            <MapPin className="w-4 h-4 text-primary-400" />
                                                            {provider.distance.toFixed(1)} km
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="mt-auto pt-5 border-t border-gray-100 flex items-center justify-between">
                                                    <div>
                                                        <p className="text-xs font-bold text-gray-400 uppercase tracking-wider mb-1">Starting from</p>
                                                        <p className="font-extrabold text-2xl text-gray-900 flex items-baseline gap-1">
                                                            ₹{provider.minPrice}<span className="text-sm font-semibold text-gray-400">/meal</span>
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-2 bg-secondary-50 px-3 py-2 rounded-xl border border-secondary-100">
                                                        <span className="relative flex h-2.5 w-2.5">
                                                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-secondary-400 opacity-75"></span>
                                                            <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-secondary-500"></span>
                                                        </span>
                                                        <span className="text-xs font-bold text-secondary-700 uppercase tracking-wider">Cooking</span>
                                                    </div>
                                                </div>
                                            </div>
                                        </Link>
                                    </motion.article>
                                ))}
                            </div>
                        )}

                        {!isLoading && filteredProviders.length > 0 && viewMode === "grid" && (
                            <div className="mt-16 text-center pb-8">
                                <button className="border-2 border-primary-200 text-primary-600 hover:bg-primary-50 px-10 py-4 rounded-xl font-bold transition-all inline-flex items-center gap-2 hover:scale-105">
                                    Show More Chefs <ArrowRight className="w-5 h-5" />
                                </button>
                            </div>
                        )}

                    </div>
                </div>
            </main>

            <Footer />
        </div >
    );
}
