"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import Navbar from "@/components/Navbar";
import {
    ChefHat,
    Star,
    Plus,
    Loader2,
    SlidersHorizontal
} from "lucide-react";

interface Tiffin {
    _id: string;
    name: string;
    description: string;
    price: number;
    type: "veg" | "non-veg" | "vegan";
    mealType: "breakfast" | "lunch" | "dinner" | "snacks";
    images: string[];
    isAvailable: boolean;
    rating?: number;
    provider: { _id: string; name: string };
}

export default function MenuPage() {
    const { isAuthenticated, isLoading: authLoading } = useAuth();
    const { location, requestLocation } = useLocation();
    const { addToCart } = useCart();
    const router = useRouter();

    const [tiffins, setTiffins] = useState<Tiffin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");

    // Filters
    const [dietFilter, setDietFilter] = useState<string>("");
    const [mealFilter, setMealFilter] = useState<string>("");
    const [priceRange, setPriceRange] = useState<number>(500);
    const [ratingFilter, setRatingFilter] = useState<number>(0);
    const [sortBy, setSortBy] = useState<string>("default");

    // Auth redirect
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login?role=customer");
        }
    }, [authLoading, isAuthenticated, router]);

    useEffect(() => {
        if (!isAuthenticated || authLoading) return;
        if (!location) {
            requestLocation();
            return;
        }

        const fetchTiffins = async () => {
            try {
                setIsLoading(true);
                const params = new URLSearchParams();

                params.set("lat", location.lat.toString());
                params.set("lng", location.lng.toString());
                params.set("radius", "15");

                // Dietary
                if (dietFilter === "Pure Veg") params.set("type", "veg");
                if (dietFilter === "Non-Veg") params.set("type", "non-veg");
                if (dietFilter === "Jain") params.set("type", "jain");
                if (dietFilter === "Eggetarian") params.set("type", "eggetarian");

                // Meal Type
                if (mealFilter) params.set("mealType", mealFilter.toLowerCase());

                // Price
                params.set("maxPrice", priceRange.toString());

                // Sort
                if (sortBy === "price_asc") params.set("sort", "price_asc");
                if (sortBy === "price_desc") params.set("sort", "price_desc");
                if (sortBy === "popularity") params.set("sort", "rating");

                const response = await axios.get(`/tiffins/nearby?${params.toString()}`);
                let fetched = response.data;

                if (ratingFilter > 0) {
                    fetched = fetched.filter((t: Tiffin) => (t.rating || 0) >= ratingFilter);
                }

                setTiffins(fetched);
            } catch (err: any) {
                setError("Failed to load menus");
            } finally {
                setIsLoading(false);
            }
        };

        fetchTiffins();
    }, [isAuthenticated, authLoading, location, requestLocation, dietFilter, mealFilter, priceRange, sortBy, ratingFilter]);

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!isAuthenticated) {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#FDFBF7] text-gray-900 font-sans antialiased">
            <Navbar />

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Header */}
                <div className="mb-8">
                    <div className="text-sm text-gray-500 mb-2 flex items-center gap-2">
                        <Link href="/" className="hover:text-orange-500 transition-colors">Home</Link>
                        <span>›</span>
                        <span className="font-semibold text-gray-900">All Menus</span>
                    </div>
                    <h1 className="text-3xl md:text-5xl font-extrabold text-gray-900 tracking-tight mb-3">
                        Discover Home-Cooked Meals
                    </h1>
                    <p className="text-lg text-gray-500">
                        Authentic tiffins from top local home chefs.
                    </p>
                </div>

                <div className="flex flex-col lg:flex-row gap-8">
                    {/* Sidebar Filters */}
                    <aside className="w-full lg:w-[280px] flex-shrink-0">
                        <div className="bg-white rounded-[2rem] p-6 shadow-sm border border-gray-100 sticky top-24">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="font-bold text-lg flex items-center gap-2">
                                    <SlidersHorizontal className="w-5 h-5 text-gray-500" /> Filters
                                </h2>
                                {(dietFilter || mealFilter || priceRange < 500 || ratingFilter > 0) && (
                                    <button onClick={() => {
                                        setDietFilter("");
                                        setMealFilter("");
                                        setPriceRange(500);
                                        setRatingFilter(0);
                                    }} className="text-sm text-orange-500 font-semibold hover:underline">
                                        Reset
                                    </button>
                                )}
                            </div>

                            {/* Dietary */}
                            <div className="mb-8">
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Dietary</h3>
                                <div className="space-y-3">
                                    {["Pure Veg", "Non-Veg", "Jain", "Eggetarian"].map((diet) => (
                                        <label key={diet} className="flex items-center gap-3 cursor-pointer group">
                                            <div className="relative flex items-center justify-center">
                                                <input
                                                    type="radio"
                                                    name="dietary"
                                                    checked={dietFilter === diet}
                                                    onChange={() => setDietFilter(diet)}
                                                    className="peer sr-only"
                                                />
                                                <div className="w-5 h-5 rounded-full border border-gray-300 bg-white peer-checked:border-[6px] peer-checked:border-orange-500 transition-all"></div>
                                            </div>
                                            <span className="text-sm font-medium text-gray-600 group-hover:text-gray-900">{diet}</span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Meal Type */}
                            <div className="mb-8 border-t border-gray-100 pt-6">
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Meal Type</h3>
                                <div className="flex flex-wrap gap-2">
                                    {["Breakfast", "Lunch", "Dinner", "Snacks"].map((meal) => (
                                        <button
                                            key={meal}
                                            onClick={() => setMealFilter(mealFilter === meal ? "" : meal)}
                                            className={`px-4 py-1.5 rounded-full text-sm font-medium transition-all ${mealFilter === meal ? 'bg-orange-500 text-white shadow-md' : 'bg-white border border-gray-200 text-gray-600 hover:border-orange-500 hover:text-orange-500'}`}
                                        >
                                            {meal}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            {/* Price Range */}
                            <div className="mb-8 border-t border-gray-100 pt-6">
                                <div className="flex items-center justify-between mb-3 text-sm font-semibold">
                                    <h3 className="text-gray-900">Price Range</h3>
                                    <span className="text-gray-500">₹50 - ₹{priceRange}</span>
                                </div>
                                <input
                                    type="range"
                                    min="50"
                                    max="500"
                                    step="10"
                                    value={priceRange}
                                    onChange={(e) => setPriceRange(Number(e.target.value))}
                                    className="w-full h-1.5 bg-gray-200 rounded-lg appearance-none cursor-pointer accent-orange-500"
                                />
                            </div>

                            {/* Chef Rating */}
                            <div className="border-t border-gray-100 pt-6">
                                <h3 className="font-semibold text-gray-900 mb-3 text-sm">Chef Rating</h3>
                                <div className="space-y-3">
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="rating"
                                                checked={ratingFilter === 4}
                                                onChange={() => setRatingFilter(4)}
                                                className="peer sr-only"
                                            />
                                            <div className="w-5 h-5 rounded-full border border-gray-300 bg-white peer-checked:border-[6px] peer-checked:border-orange-500 transition-all"></div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} className={`w-4 h-4 ${star <= 4 ? "text-orange-500 fill-orange-500" : "text-gray-300"}`} />
                                            ))}
                                            <span className="text-sm font-medium text-gray-600 ml-1">& Up</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center gap-3 cursor-pointer group">
                                        <div className="relative flex items-center justify-center">
                                            <input
                                                type="radio"
                                                name="rating"
                                                checked={ratingFilter === 5}
                                                onChange={() => setRatingFilter(5)}
                                                className="peer sr-only"
                                            />
                                            <div className="w-5 h-5 rounded-full border border-gray-300 bg-white peer-checked:border-[6px] peer-checked:border-orange-500 transition-all"></div>
                                        </div>
                                        <div className="flex items-center gap-1">
                                            {[1, 2, 3, 4, 5].map(star => (
                                                <Star key={star} className={`w-4 h-4 ${star <= 5 ? "text-orange-500 fill-orange-500" : "text-gray-300"}`} />
                                            ))}
                                            <span className="text-sm font-medium text-gray-600 ml-1">& Up</span>
                                        </div>
                                    </label>
                                </div>
                            </div>
                        </div>
                    </aside>

                    {/* Main Grid List */}
                    <div className="flex-1">
                        <div className="flex items-center justify-between mb-6">
                            <p className="text-gray-500 text-sm">
                                Showing <span className="font-bold text-gray-900">{tiffins.length}</span> home-cooked meals
                            </p>
                            <div className="flex items-center gap-2">
                                <span className="text-sm text-gray-500">Sort by:</span>
                                <select
                                    value={sortBy}
                                    onChange={(e) => setSortBy(e.target.value)}
                                    className="text-sm font-bold text-gray-900 bg-white border border-gray-200 rounded-full px-4 py-2 outline-none focus:border-orange-500 hover:border-gray-300 appearance-none shadow-sm cursor-pointer pr-8 bg-[url('data:image/svg+xml;charset=US-ASCII,%3Csvg%20xmlns%3D%22http%3A%2F%2Fwww.w3.org%2F2000%2Fsvg%22%20width%3D%22292.4%22%20height%3D%22292.4%22%3E%3Cpath%20fill%3D%22%234b5563%22%20d%3D%22M287%2069.4a17.6%2017.6%200%200%200-13-5.4H18.4c-5%200-9.3%201.8-12.9%205.4A17.6%2017.6%200%200%200%200%2082.2c0%205%201.8%209.3%205.4%2012.9l128%20127.9c3.6%203.6%207.8%205.4%2012.8%205.4s9.2-1.8%2012.8-5.4L287%2095c3.5-3.5%205.4-7.8%205.4-12.8%200-5-1.9-9.2-5.5-12.8z%22%2F%3E%3C%2Fsvg%3E')] bg-[length:10px_10px] bg-[position:right_1rem_center] bg-no-repeat"
                                >
                                    <option value="popularity">Popularity</option>
                                    <option value="price_asc">Price: Low to High</option>
                                    <option value="price_desc">Price: High to Low</option>
                                </select>
                            </div>
                        </div>

                        {isLoading && tiffins.length === 0 ? (
                            <div className="flex justify-center py-20">
                                <Loader2 className="w-10 h-10 animate-spin text-orange-500" />
                            </div>
                        ) : tiffins.length > 0 ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                                {tiffins.map((tiffin) => (
                                    <div key={tiffin._id} className="bg-white rounded-[1.5rem] overflow-hidden border border-gray-100 shadow-sm hover:shadow-lg transition-all flex flex-col group">
                                        <div className="relative h-48 overflow-hidden">
                                            <div className="absolute top-3 left-3 z-10">
                                                <span className={`px-2.5 py-1 rounded shadow-sm text-[10px] font-bold tracking-wide uppercase ${tiffin.type === 'veg' ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                                                    {tiffin.type === 'veg' ? 'VEG' : 'NON-VEG'}
                                                </span>
                                            </div>
                                            <div className="absolute top-3 right-3 z-10 bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full flex items-center gap-1 shadow-sm">
                                                <Star className="w-3.5 h-3.5 text-orange-500 fill-orange-500" />
                                                <span className="text-xs font-bold text-gray-900">{tiffin.rating?.toFixed(1) || "4.5"}</span>
                                            </div>
                                            <img
                                                src={tiffin.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'}
                                                alt={tiffin.name}
                                                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                                            />
                                        </div>
                                        <div className="p-5 flex flex-col flex-grow">
                                            <h3 className="font-bold text-lg text-gray-900 mb-1.5 leading-tight group-hover:text-orange-600 transition-colors">
                                                {tiffin.name}
                                            </h3>
                                            <Link href={`/kitchens/${tiffin.provider?._id}`} className="text-sm text-gray-500 flex items-center gap-1.5 mb-3 hover:text-orange-500 transition-colors">
                                                <ChefHat className="w-4 h-4" /> by {tiffin.provider?.name || "Home Chef"}
                                            </Link>
                                            <p className="text-sm text-gray-400 line-clamp-2 leading-relaxed mb-4 flex-grow">
                                                {tiffin.description}
                                            </p>
                                            <div className="flex items-center justify-between mt-auto">
                                                <div>
                                                    <span className="text-xs text-gray-400 line-through mr-1 font-medium">₹{Math.round(tiffin.price * 1.2)}</span>
                                                    <span className="text-xl font-extrabold text-gray-900">₹{tiffin.price}</span>
                                                </div>
                                                <button
                                                    onClick={() => addToCart({
                                                        tiffinId: tiffin._id,
                                                        name: tiffin.name,
                                                        price: tiffin.price,
                                                        quantity: 1,
                                                        providerId: tiffin.provider._id,
                                                        type: tiffin.type,
                                                        image: tiffin.images?.[0] || 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c'
                                                    })}
                                                    className="bg-orange-500 hover:bg-orange-600 text-white font-bold text-sm px-4 py-2 rounded-full flex items-center gap-1 shadow-md shadow-orange-500/30 transition-all hover:scale-105 active:scale-95"
                                                >
                                                    <Plus className="w-4 h-4" /> Add
                                                </button>
                                            </div>
                                        </div>
                                    </div>
                                ))}
                            </div>
                        ) : (
                            <div className="text-center py-20">
                                <ChefHat className="w-16 h-16 text-gray-200 mx-auto mb-4" />
                                <h3 className="text-xl font-bold text-gray-900 mb-2">No meals found</h3>
                                <p className="text-gray-500">Try adjusting your filters or search radius to see more home-cooked meals.</p>
                                <button onClick={() => { setDietFilter(""); setMealFilter(""); setPriceRange(500); setRatingFilter(0); }} className="mt-6 text-orange-500 font-bold hover:underline">
                                    Clear all filters
                                </button>
                            </div>
                        )}

                        {tiffins.length > 0 && (
                            <div className="flex justify-center mt-12 mb-8">
                                <button className="px-8 py-3 bg-white border border-gray-200 text-gray-800 font-bold rounded-full shadow-sm hover:border-gray-300 hover:shadow-md transition-all">
                                    Load More Menus
                                </button>
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
