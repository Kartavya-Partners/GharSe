"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
import ProfileDropdown from "@/components/provider/ProfileDropdown";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    UtensilsCrossed,
    Plus,
    Edit2,
    Trash2,
    Clock,
    Leaf,
    Drumstick,
    Salad,
    Sun,
    Coffee,
    Moon,
    LogOut,
    User,
    Loader2,
    ChefHat,
    X,
    Save,
    IndianRupee,
    FileText,
    Image as ImageIcon,
    Calendar,
    ShoppingBag,
    Upload,
    X as XIcon,
    Bell,
    HelpCircle,
    Search,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

// Types
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
}

interface TiffinFormData {
    name: string;
    description: string;
    price: string;
    type: "veg" | "non-veg" | "vegan";
    mealType: "breakfast" | "lunch" | "dinner";
    cutoffTime: string;
    images: string[];
}

const initialFormData: TiffinFormData = {
    name: "",
    description: "",
    price: "",
    type: "veg",
    mealType: "lunch",
    cutoffTime: "10:00",
    images: [],
};

export default function ProviderDashboard() {
    const { user, isLoading: authLoading, logout, isAuthenticated } = useAuth();
    const router = useRouter();

    const [tiffins, setTiffins] = useState<Tiffin[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState("");
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [editingTiffin, setEditingTiffin] = useState<Tiffin | null>(null);
    const [formData, setFormData] = useState<TiffinFormData>(initialFormData);
    const [isSaving, setIsSaving] = useState(false);
    const [isUploadingImage, setIsUploadingImage] = useState(false);

    // Redirect if not authenticated or not a provider
    useEffect(() => {
        if (!authLoading) {
            if (!isAuthenticated) {
                router.push("/login?role=provider");
            } else if (user?.role !== "provider") {
                router.push("/explore");
            }
        }
    }, [authLoading, isAuthenticated, user, router]);

    // Fetch provider's tiffins
    useEffect(() => {
        const fetchTiffins = async () => {
            try {
                setIsLoading(true);
                const response = await axios.get("/tiffins/provider/me");
                setTiffins(response.data);
                setError("");
            } catch (err) {
                console.error("Error fetching tiffins:", err);
                setError("Failed to load your menu. Please try again.");
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated && user?.role === "provider") {
            fetchTiffins();
        }
    }, [isAuthenticated, user]);

    // Handle form input change
    const handleChange = (
        e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
    ) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    // Handle image upload
    const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;

        // Validate file type
        if (!file.type.startsWith('image/')) {
            setError('Please select an image file');
            return;
        }

        // Validate file size (max 5MB)
        if (file.size > 5 * 1024 * 1024) {
            setError('Image must be less than 5MB');
            return;
        }

        setIsUploadingImage(true);
        setError('');

        try {
            // Convert to base64
            const reader = new FileReader();
            reader.onload = async () => {
                try {
                    const base64 = reader.result as string;
                    const response = await axios.post('/upload/image', { image: base64 });

                    // Add uploaded image URL to form data
                    setFormData((prev) => ({
                        ...prev,
                        images: [...prev.images, response.data.url],
                    }));
                } catch (err: unknown) {
                    console.error('Upload error:', err);
                    const axiosErr = err as { response?: { data?: { message?: string } } };
                    setError(axiosErr.response?.data?.message || 'Failed to upload image');
                } finally {
                    setIsUploadingImage(false);
                }
            };
            reader.onerror = () => {
                setError('Failed to read image file');
                setIsUploadingImage(false);
            };
            reader.readAsDataURL(file);
        } catch (err) {
            console.error('Image processing error:', err);
            setError('Failed to process image');
            setIsUploadingImage(false);
        }
    };

    // Remove image from form data
    const removeImage = (indexToRemove: number) => {
        setFormData((prev) => ({
            ...prev,
            images: prev.images.filter((_, index) => index !== indexToRemove),
        }));
    };

    // Open modal for new tiffin
    const openNewTiffinModal = () => {
        setEditingTiffin(null);
        setFormData(initialFormData);
        setIsModalOpen(true);
    };

    // Open modal for editing
    const openEditModal = (tiffin: Tiffin) => {
        setEditingTiffin(tiffin);
        setFormData({
            name: tiffin.name,
            description: tiffin.description,
            price: tiffin.price.toString(),
            type: tiffin.type,
            mealType: tiffin.mealType,
            cutoffTime: tiffin.cutoffTime,
            images: tiffin.images,
        });
        setIsModalOpen(true);
    };

    // Handle form submit
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSaving(true);
        setError("");

        try {
            const payload = {
                name: formData.name,
                description: formData.description,
                price: parseFloat(formData.price),
                type: formData.type,
                mealType: formData.mealType,
                cutoffTime: formData.cutoffTime,
                images: formData.images,
            };

            if (editingTiffin) {
                // Update existing tiffin
                const response = await axios.put(`/tiffins/${editingTiffin._id}`, payload);
                setTiffins((prev) =>
                    prev.map((t) => (t._id === editingTiffin._id ? response.data : t))
                );
            } else {
                // Create new tiffin
                const response = await axios.post("/tiffins", payload);
                setTiffins((prev) => [...prev, response.data]);
            }

            setIsModalOpen(false);
            setFormData(initialFormData);
            setEditingTiffin(null);
        } catch (err: unknown) {
            console.error("Error saving tiffin:", err);
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(axiosErr.response?.data?.message || "Failed to save. Please try again.");
        } finally {
            setIsSaving(false);
        }
    };

    // Handle delete
    const handleDelete = async (tiffinId: string) => {
        if (!confirm("Are you sure you want to delete this menu item?")) return;

        try {
            await axios.delete(`/tiffins/${tiffinId}`);
            setTiffins((prev) => prev.filter((t) => t._id !== tiffinId));
        } catch (err) {
            console.error("Error deleting tiffin:", err);
            setError("Failed to delete. Please try again.");
        }
    };

    // Get type badge color
    const getTypeBadgeColor = (type: string) => {
        switch (type) {
            case "veg":
                return "bg-green-100 text-green-700";
            case "non-veg":
                return "bg-red-100 text-red-700";
            case "vegan":
                return "bg-emerald-100 text-emerald-700";
            default:
                return "bg-gray-100 text-gray-700";
        }
    };

    // Get meal icon
    const getMealIcon = (mealType: string) => {
        switch (mealType) {
            case "breakfast":
                return Coffee;
            case "lunch":
                return Sun;
            case "dinner":
                return Moon;
            default:
                return UtensilsCrossed;
        }
    };

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-green-500" />
            </div>
        );
    }
    // Filter state
    const [searchQuery, setSearchQuery] = useState("");
    const [activeFilter, setActiveFilter] = useState("all");

    // Filtered tiffins
    const filteredTiffins = tiffins.filter((t) => {
        const matchesSearch = t.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
            t.description.toLowerCase().includes(searchQuery.toLowerCase());
        const matchesFilter = activeFilter === "all" || t.mealType === activeFilter;
        return matchesSearch && matchesFilter;
    });

    // Toggle availability
    const toggleAvailability = async (tiffin: Tiffin) => {
        try {
            const response = await axios.put(`/tiffins/${tiffin._id}`, {
                ...tiffin,
                isAvailable: !tiffin.isAvailable,
            });
            setTiffins((prev) =>
                prev.map((t) => (t._id === tiffin._id ? response.data : t))
            );
        } catch (err) {
            console.error("Error toggling availability:", err);
        }
    };

    // Don't render if not provider
    if (!isAuthenticated || user?.role !== "provider") {
        return null;
    }

    return (
        <div className="min-h-screen bg-[#0f1a15]">
            {/* ========== TOP NAVBAR ========== */}
            <header className="sticky top-0 z-50 bg-[#0d1a14] border-b border-white/5">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        <Link href="/" className="flex items-center gap-2">
                            <div className="bg-teal-600 p-1.5 rounded-lg">
                                <ChefHat className="w-4 h-4 text-white" />
                            </div>
                            <span className="text-lg font-bold text-white">GharSe</span>
                        </Link>

                        <div className="flex items-center gap-3">
                            <ProfileDropdown />
                        </div>
                    </div>
                </div>
            </header>

            {/* ========== MAIN CONTENT ========== */}
            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-6">
                {/* Breadcrumb */}
                <div className="flex items-center gap-2 text-sm text-gray-500 mb-4">
                    <Link href="/dashboard/provider/orders" className="hover:text-gray-300 transition-colors">Home</Link>
                    <span>/</span>
                    <span className="text-gray-300 font-medium">Menu Management</span>
                </div>

                {/* Title + Add Button */}
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-3xl font-extrabold text-white tracking-tight mb-1">
                            Menu Management
                        </h1>
                        <p className="text-gray-500 text-sm">
                            Manage your daily offerings and inventory status.
                        </p>
                    </div>
                    <Button
                        onClick={openNewTiffinModal}
                        className="bg-white text-gray-900 hover:bg-gray-100 font-semibold rounded-xl px-6 h-11"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Item
                    </Button>
                </div>

                {/* Search + Filter Tabs */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center gap-4 mb-8">
                    <div className="relative flex-1 max-w-xl">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-500" />
                        <input
                            type="text"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            placeholder="Search meal items (e.g., Rajma Chawal)"
                            className="w-full h-11 pl-11 pr-4 bg-[#1a2b23] border border-white/10 rounded-xl text-white placeholder:text-gray-500 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 transition-all"
                        />
                    </div>
                    <div className="flex gap-2">
                        {[
                            { value: "all", label: "All Items" },
                            { value: "breakfast", label: "Breakfast" },
                            { value: "lunch", label: "Lunch" },
                            { value: "dinner", label: "Dinner" },
                        ].map((filter) => (
                            <button
                                key={filter.value}
                                onClick={() => setActiveFilter(filter.value)}
                                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${activeFilter === filter.value
                                    ? "bg-teal-600 text-white"
                                    : "bg-[#1a2b23] text-gray-400 hover:text-white hover:bg-[#243b30] border border-white/5"
                                    }`}
                            >
                                {filter.label}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
                    </div>
                )}

                {/* Error State */}
                {error && !isModalOpen && (
                    <div className="text-center py-4 mb-4">
                        <p className="text-red-400">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && tiffins.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 bg-teal-500/10 rounded-full flex items-center justify-center">
                            <UtensilsCrossed className="w-10 h-10 text-teal-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-white mb-2">
                            No menu items yet
                        </h3>
                        <p className="text-gray-500 mb-6">
                            Start by adding your first tiffin to attract customers
                        </p>
                        <Button
                            onClick={openNewTiffinModal}
                            className="bg-teal-600 hover:bg-teal-700 text-white rounded-xl"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Item
                        </Button>
                    </div>
                )}

                {/* Tiffin Grid */}
                {!isLoading && filteredTiffins.length > 0 && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
                        {filteredTiffins.map((tiffin) => {
                            const MealIcon = getMealIcon(tiffin.mealType);
                            return (
                                <motion.div
                                    key={tiffin._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-[#1a2b23] rounded-2xl overflow-hidden border border-white/5 group hover:border-teal-500/20 transition-all"
                                >
                                    {/* Image */}
                                    <div className="relative h-44">
                                        {tiffin.images && tiffin.images.length > 0 ? (
                                            <img
                                                src={tiffin.images[0]}
                                                alt={tiffin.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-[#0f1a15]">
                                                <MealIcon className="w-16 h-16 text-teal-800" />
                                            </div>
                                        )}

                                        {/* Meal Type Tag */}
                                        <div className="absolute top-3 right-3">
                                            <span className={`px-3 py-1 rounded-full text-xs font-semibold ${tiffin.mealType === "breakfast"
                                                ? "bg-amber-500 text-white"
                                                : tiffin.mealType === "lunch"
                                                    ? "bg-teal-500 text-white"
                                                    : "bg-indigo-500 text-white"
                                                }`}>
                                                {tiffin.mealType.charAt(0).toUpperCase() + tiffin.mealType.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Body */}
                                    <div className="p-4">
                                        {/* VEG/NON-VEG badges + Price */}
                                        <div className="flex items-center justify-between mb-2">
                                            <div className="flex gap-1.5">
                                                <span className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wide ${tiffin.type === "veg"
                                                    ? "bg-green-500/20 text-green-400 border border-green-500/30"
                                                    : tiffin.type === "non-veg"
                                                        ? "bg-red-500/20 text-red-400 border border-red-500/30"
                                                        : "bg-emerald-500/20 text-emerald-400 border border-emerald-500/30"
                                                    }`}>
                                                    {tiffin.type}
                                                </span>
                                            </div>
                                            <span className="text-teal-400 font-bold text-lg flex items-center gap-0.5"><IndianRupee className="w-4 h-4" />{tiffin.price}</span>
                                        </div>

                                        {/* Name + Description */}
                                        <h3 className="font-bold text-white text-base mb-1 truncate">
                                            {tiffin.name}
                                        </h3>
                                        <p className="text-sm text-gray-500 line-clamp-2 mb-4 leading-relaxed">
                                            {tiffin.description}
                                        </p>

                                        {/* Availability Toggle + Edit */}
                                        <div className="flex items-center justify-between pt-3 border-t border-white/5">
                                            <button
                                                onClick={() => toggleAvailability(tiffin)}
                                                className={`flex items-center gap-2 text-sm font-medium transition-all ${tiffin.isAvailable ? "text-teal-400" : "text-gray-500"
                                                    }`}
                                            >
                                                <div className={`relative w-10 h-5 rounded-full transition-all ${tiffin.isAvailable ? "bg-teal-500" : "bg-gray-600"
                                                    }`}>
                                                    <div className={`absolute top-0.5 w-4 h-4 rounded-full bg-white transition-all ${tiffin.isAvailable ? "left-5" : "left-0.5"
                                                        }`} />
                                                </div>
                                                <span>{tiffin.isAvailable ? "Available" : "Unavailable"}</span>
                                            </button>

                                            <button
                                                onClick={() => openEditModal(tiffin)}
                                                className="p-2 text-gray-500 hover:text-teal-400 hover:bg-white/5 rounded-lg transition-all"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}

                        {/* Add New Item Card */}
                        <button
                            onClick={openNewTiffinModal}
                            className="bg-transparent rounded-2xl border-2 border-dashed border-white/10 hover:border-teal-500/30 hover:bg-teal-500/5 transition-all flex flex-col items-center justify-center min-h-[320px] group"
                        >
                            <div className="w-14 h-14 rounded-full bg-white/5 group-hover:bg-teal-500/10 flex items-center justify-center mb-4 transition-all">
                                <Plus className="w-6 h-6 text-gray-500 group-hover:text-teal-400 transition-colors" />
                            </div>
                            <p className="text-white font-semibold mb-1">Add New Item</p>
                            <p className="text-gray-500 text-sm text-center">
                                Create a new offering<br />for your menu
                            </p>
                        </button>
                    </div>
                )}
            </main>

            {/* ========== ADD/EDIT MODAL (Dark Theme) ========== */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        key="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            key="modal-content"
                            initial={{ opacity: 0, scale: 0.95, y: 20 }}
                            animate={{ opacity: 1, scale: 1, y: 0 }}
                            exit={{ opacity: 0, scale: 0.95, y: 20 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-[#1a2b23] rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto border border-white/10"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b border-white/5">
                                <h2 className="text-xl font-bold text-white">
                                    {editingTiffin ? "Edit Menu Item" : "Add New Menu Item"}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-white/5 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-400" />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Error */}
                                {error && (
                                    <div className="p-3 bg-red-500/10 border border-red-500/20 rounded-lg text-sm text-red-400">
                                        {error}
                                    </div>
                                )}

                                {/* Name */}
                                <div className="space-y-2">
                                    <label className="text-gray-300 text-sm font-medium">Item Name</label>
                                    <input
                                        name="name"
                                        placeholder="e.g., Dal Chawal Thali"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 bg-[#0f1a15] border border-white/10 rounded-xl text-white placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50"
                                    />
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <label className="text-gray-300 text-sm font-medium">Description</label>
                                    <textarea
                                        name="description"
                                        placeholder="Describe your dish, ingredients, portion size..."
                                        required
                                        value={formData.description}
                                        onChange={handleChange}
                                        rows={3}
                                        className="w-full px-4 py-3 bg-[#0f1a15] border border-white/10 rounded-xl text-white placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50 resize-none"
                                    />
                                </div>

                                {/* Price */}
                                <div className="space-y-2">
                                    <label className="text-gray-300 text-sm font-medium flex items-center gap-1">Price <IndianRupee className="w-3.5 h-3.5" /></label>
                                    <input
                                        name="price"
                                        type="number"
                                        placeholder="80"
                                        required
                                        min="1"
                                        value={formData.price}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 bg-[#0f1a15] border border-white/10 rounded-xl text-white placeholder:text-gray-600 text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50"
                                    />
                                </div>

                                {/* Type & Meal Type */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <label className="text-gray-300 text-sm font-medium">Food Type</label>
                                        <div className="flex gap-2">
                                            {[
                                                { value: "veg", label: "Veg", color: "green" },
                                                { value: "non-veg", label: "Non-Veg", color: "red" },
                                                { value: "vegan", label: "Vegan", color: "emerald" },
                                            ].map((type) => (
                                                <button
                                                    key={type.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            type: type.value as "veg" | "non-veg" | "vegan",
                                                        }))
                                                    }
                                                    className={`flex-1 py-2 rounded-lg border text-xs font-semibold transition-all ${formData.type === type.value
                                                        ? type.color === "green"
                                                            ? "border-green-500 bg-green-500/10 text-green-400"
                                                            : type.color === "red"
                                                                ? "border-red-500 bg-red-500/10 text-red-400"
                                                                : "border-emerald-500 bg-emerald-500/10 text-emerald-400"
                                                        : "border-white/10 text-gray-500 hover:border-white/20"
                                                        }`}
                                                >
                                                    {type.label}
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <label className="text-gray-300 text-sm font-medium">Meal Time</label>
                                        <div className="flex gap-2">
                                            {[
                                                { value: "breakfast", icon: Coffee },
                                                { value: "lunch", icon: Sun },
                                                { value: "dinner", icon: Moon },
                                            ].map((meal) => (
                                                <button
                                                    key={meal.value}
                                                    type="button"
                                                    onClick={() =>
                                                        setFormData((prev) => ({
                                                            ...prev,
                                                            mealType: meal.value as "breakfast" | "lunch" | "dinner",
                                                        }))
                                                    }
                                                    className={`flex-1 py-2 rounded-lg border transition-all flex items-center justify-center ${formData.mealType === meal.value
                                                        ? "border-teal-500 bg-teal-500/10 text-teal-400"
                                                        : "border-white/10 text-gray-500 hover:border-white/20"
                                                        }`}
                                                >
                                                    <meal.icon className="w-4 h-4" />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Cutoff Time */}
                                <div className="space-y-2">
                                    <label className="text-gray-300 text-sm font-medium">Order Cutoff Time</label>
                                    <input
                                        name="cutoffTime"
                                        type="time"
                                        required
                                        value={formData.cutoffTime}
                                        onChange={handleChange}
                                        className="w-full h-11 px-4 bg-[#0f1a15] border border-white/10 rounded-xl text-white text-sm focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-500/50"
                                    />
                                    <p className="text-xs text-gray-600">
                                        Orders must be placed before this time
                                    </p>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <label className="text-gray-300 text-sm font-medium">Food Image</label>

                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                            {formData.images.map((img, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={img}
                                                        alt={`Food ${index + 1}`}
                                                        className="w-full h-20 object-cover rounded-lg border border-white/10"
                                                    />
                                                    <button
                                                        type="button"
                                                        onClick={() => removeImage(index)}
                                                        className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 text-white rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                                                    >
                                                        <XIcon className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    )}

                                    <label className="flex items-center justify-center gap-2 h-12 border-2 border-dashed border-white/10 rounded-xl cursor-pointer hover:border-teal-500/30 hover:bg-teal-500/5 transition-all">
                                        {isUploadingImage ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin text-teal-500" />
                                                <span className="text-sm text-gray-400">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5 text-gray-500" />
                                                <span className="text-sm text-gray-400">
                                                    {formData.images.length > 0 ? 'Add another image' : 'Upload food image'}
                                                </span>
                                            </>
                                        )}
                                        <input
                                            type="file"
                                            accept="image/*"
                                            onChange={handleImageUpload}
                                            disabled={isUploadingImage}
                                            className="hidden"
                                        />
                                    </label>
                                    <p className="text-xs text-gray-600">Max 5MB. JPG, PNG, WebP</p>
                                </div>

                                {/* Submit Buttons */}
                                <div className="flex gap-3 pt-4">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-11 rounded-xl border border-white/10 text-gray-400 hover:bg-white/5 font-medium transition-all"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 h-11 rounded-xl bg-teal-600 hover:bg-teal-700 text-white font-semibold transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4" />
                                                {editingTiffin ? "Update Item" : "Add Item"}
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}

