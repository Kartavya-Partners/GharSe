"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { Button } from "@/components/ui/button";
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

    // Don't render if not provider
    if (!isAuthenticated || user?.role !== "provider") {
        return null;
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* ========== NAVBAR ========== */}
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="max-w-7xl mx-auto px-4 lg:px-8">
                    <div className="flex items-center justify-between h-16">
                        {/* Logo */}
                        <Link href="/" className="flex items-center gap-3">
                            <div className="bg-gradient-to-br from-green-500 to-emerald-600 p-2 rounded-xl">
                                <ChefHat className="w-5 h-5 text-white" />
                            </div>
                            <span className="text-xl font-bold gradient-text-green">
                                GharSe Provider
                            </span>
                        </Link>

                        {/* User Menu */}
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
            <main className="max-w-7xl mx-auto px-4 lg:px-8 py-8">
                {/* Header */}
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900 mb-2">
                            Your Menu
                        </h1>
                        <p className="text-gray-600">
                            Manage your tiffin offerings and daily specials
                        </p>
                    </div>
                    <div className="flex gap-3">
                        <Link href="/dashboard/provider/orders">
                            <Button
                                variant="outline"
                                className="border-orange-500 text-orange-600 hover:bg-orange-50 rounded-xl"
                            >
                                <ShoppingBag className="w-5 h-5 mr-2" />
                                Orders
                            </Button>
                        </Link>
                        <Link href="/dashboard/provider/weekly-menu">
                            <Button
                                variant="outline"
                                className="border-green-500 text-green-600 hover:bg-green-50 rounded-xl"
                            >
                                <Calendar className="w-5 h-5 mr-2" />
                                Weekly Menu
                            </Button>
                        </Link>
                        <Button
                            onClick={openNewTiffinModal}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl shadow-lg"
                        >
                            <Plus className="w-5 h-5 mr-2" />
                            Add New Item
                        </Button>
                    </div>
                </div>

                {/* Loading State */}
                {isLoading && (
                    <div className="flex items-center justify-center py-20">
                        <Loader2 className="w-8 h-8 animate-spin text-green-500" />
                    </div>
                )}

                {/* Error State */}
                {error && !isModalOpen && (
                    <div className="text-center py-4 mb-4">
                        <p className="text-red-500">{error}</p>
                    </div>
                )}

                {/* Empty State */}
                {!isLoading && tiffins.length === 0 && (
                    <div className="text-center py-20">
                        <div className="w-20 h-20 mx-auto mb-6 bg-green-100 rounded-full flex items-center justify-center">
                            <UtensilsCrossed className="w-10 h-10 text-green-500" />
                        </div>
                        <h3 className="text-xl font-semibold text-gray-900 mb-2">
                            No menu items yet
                        </h3>
                        <p className="text-gray-600 mb-6">
                            Start by adding your first tiffin to attract customers
                        </p>
                        <Button
                            onClick={openNewTiffinModal}
                            className="bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Add Your First Item
                        </Button>
                    </div>
                )}

                {/* Tiffin Grid */}
                {!isLoading && tiffins.length > 0 && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                        {tiffins.map((tiffin) => {
                            const MealIcon = getMealIcon(tiffin.mealType);
                            return (
                                <motion.div
                                    key={tiffin._id}
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden"
                                >
                                    {/* Image Header */}
                                    <div className="relative h-48 bg-gray-100 group">
                                        {tiffin.images && tiffin.images.length > 0 ? (
                                            <img
                                                src={tiffin.images[0]}
                                                alt={tiffin.name}
                                                className="w-full h-full object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center bg-green-50">
                                                <MealIcon className="w-16 h-16 text-green-200" />
                                            </div>
                                        )}

                                        {/* Actions Overlay */}
                                        <div className="absolute top-2 right-2 flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                            <button
                                                onClick={() => openEditModal(tiffin)}
                                                className="p-2 bg-white/90 text-gray-700 hover:text-green-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors"
                                            >
                                                <Edit2 className="w-4 h-4" />
                                            </button>
                                            <button
                                                onClick={() => handleDelete(tiffin._id)}
                                                className="p-2 bg-white/90 text-gray-700 hover:text-red-600 rounded-lg shadow-sm backdrop-blur-sm transition-colors"
                                            >
                                                <Trash2 className="w-4 h-4" />
                                            </button>
                                        </div>

                                        {/* Type Badge */}
                                        <div className="absolute bottom-2 left-2">
                                            <span className={`inline-flex items-center px-2 py-1 rounded-md text-xs font-medium shadow-sm border ${getTypeBadgeColor(tiffin.type)} bg-white/90 backdrop-blur-sm`}>
                                                {tiffin.type.charAt(0).toUpperCase() + tiffin.type.slice(1)}
                                            </span>
                                        </div>
                                    </div>

                                    {/* Content Header (Title) */}
                                    <div className="px-4 pt-4">
                                        <h3 className="font-bold text-gray-900 text-lg mb-1 truncate">
                                            {tiffin.name}
                                        </h3>
                                    </div>

                                    {/* Body */}
                                    <div className="p-4">
                                        <p className="text-sm text-gray-600 mb-4 line-clamp-2">
                                            {tiffin.description}
                                        </p>
                                        <div className="flex items-center justify-between">
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <div className="flex items-center gap-1">
                                                    <Clock className="w-4 h-4" />
                                                    <span>Cutoff: {tiffin.cutoffTime}</span>
                                                </div>
                                            </div>
                                            <div className="text-xl font-bold text-gray-900">
                                                ₹{tiffin.price}
                                            </div>
                                        </div>
                                    </div>
                                </motion.div>
                            );
                        })}
                    </div>
                )}
            </main>

            {/* ========== ADD/EDIT MODAL ========== */}
            <AnimatePresence>
                {isModalOpen && (
                    <motion.div
                        key="modal-overlay"
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50"
                        onClick={() => setIsModalOpen(false)}
                    >
                        <motion.div
                            key="modal-content"
                            initial={{ opacity: 0, scale: 0.95 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.95 }}
                            onClick={(e) => e.stopPropagation()}
                            className="bg-white rounded-2xl shadow-xl w-full max-w-lg max-h-[90vh] overflow-y-auto"
                        >
                            {/* Modal Header */}
                            <div className="flex items-center justify-between p-6 border-b">
                                <h2 className="text-xl font-bold text-gray-900">
                                    {editingTiffin ? "Edit Menu Item" : "Add New Menu Item"}
                                </h2>
                                <button
                                    onClick={() => setIsModalOpen(false)}
                                    className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
                                >
                                    <X className="w-5 h-5 text-gray-500" />
                                </button>
                            </div>

                            {/* Modal Form */}
                            <form onSubmit={handleSubmit} className="p-6 space-y-5">
                                {/* Error */}
                                {error && (
                                    <div className="p-3 bg-red-50 border border-red-200 rounded-lg text-sm text-red-700">
                                        {error}
                                    </div>
                                )}

                                {/* Name */}
                                <div className="space-y-2">
                                    <Label htmlFor="name" className="text-gray-700 font-medium">
                                        Item Name
                                    </Label>
                                    <div className="relative">
                                        <UtensilsCrossed className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="name"
                                            name="name"
                                            placeholder="e.g., Dal Chawal Thali"
                                            required
                                            value={formData.name}
                                            onChange={handleChange}
                                            className="h-12 pl-12 bg-white border-gray-200 rounded-xl"
                                        />
                                    </div>
                                </div>

                                {/* Description */}
                                <div className="space-y-2">
                                    <Label htmlFor="description" className="text-gray-700 font-medium">
                                        Description
                                    </Label>
                                    <div className="relative">
                                        <FileText className="absolute left-4 top-4 w-5 h-5 text-gray-400" />
                                        <textarea
                                            id="description"
                                            name="description"
                                            placeholder="Describe your dish, ingredients, portion size..."
                                            required
                                            value={formData.description}
                                            onChange={handleChange}
                                            rows={3}
                                            className="w-full pl-12 pr-4 py-3 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-green-400 focus:border-green-400 resize-none"
                                        />
                                    </div>
                                </div>

                                {/* Price */}
                                <div className="space-y-2">
                                    <Label htmlFor="price" className="text-gray-700 font-medium">
                                        Price (₹)
                                    </Label>
                                    <div className="relative">
                                        <IndianRupee className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="price"
                                            name="price"
                                            type="number"
                                            placeholder="80"
                                            required
                                            min="1"
                                            value={formData.price}
                                            onChange={handleChange}
                                            className="h-12 pl-12 bg-white border-gray-200 rounded-xl"
                                        />
                                    </div>
                                </div>

                                {/* Type & Meal Type Row */}
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium">Food Type</Label>
                                        <div className="flex gap-2">
                                            {[
                                                { value: "veg", icon: Leaf, color: "green" },
                                                { value: "non-veg", icon: Drumstick, color: "red" },
                                                { value: "vegan", icon: Salad, color: "emerald" },
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
                                                    className={`flex-1 p-2 rounded-lg border-2 transition-all ${formData.type === type.value
                                                        ? `border-${type.color}-500 bg-${type.color}-50`
                                                        : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                >
                                                    <type.icon
                                                        className={`w-5 h-5 mx-auto ${formData.type === type.value
                                                            ? `text-${type.color}-600`
                                                            : "text-gray-400"
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>

                                    <div className="space-y-2">
                                        <Label className="text-gray-700 font-medium">Meal Time</Label>
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
                                                    className={`flex-1 p-2 rounded-lg border-2 transition-all ${formData.mealType === meal.value
                                                        ? "border-green-500 bg-green-50"
                                                        : "border-gray-200 hover:border-gray-300"
                                                        }`}
                                                >
                                                    <meal.icon
                                                        className={`w-5 h-5 mx-auto ${formData.mealType === meal.value
                                                            ? "text-green-600"
                                                            : "text-gray-400"
                                                            }`}
                                                    />
                                                </button>
                                            ))}
                                        </div>
                                    </div>
                                </div>

                                {/* Cutoff Time */}
                                <div className="space-y-2">
                                    <Label htmlFor="cutoffTime" className="text-gray-700 font-medium">
                                        Order Cutoff Time
                                    </Label>
                                    <div className="relative">
                                        <Clock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                        <Input
                                            id="cutoffTime"
                                            name="cutoffTime"
                                            type="time"
                                            required
                                            value={formData.cutoffTime}
                                            onChange={handleChange}
                                            className="h-12 pl-12 bg-white border-gray-200 rounded-xl"
                                        />
                                    </div>
                                    <p className="text-xs text-gray-500">
                                        Orders must be placed before this time
                                    </p>
                                </div>

                                {/* Image Upload */}
                                <div className="space-y-2">
                                    <Label className="text-gray-700 font-medium">
                                        Food Image (Optional)
                                    </Label>

                                    {/* Image Preview Grid */}
                                    {formData.images.length > 0 && (
                                        <div className="grid grid-cols-3 gap-2 mb-2">
                                            {formData.images.map((img, index) => (
                                                <div key={index} className="relative group">
                                                    <img
                                                        src={img}
                                                        alt={`Food ${index + 1}`}
                                                        className="w-full h-20 object-cover rounded-lg border"
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

                                    {/* Upload Button */}
                                    <label className="flex items-center justify-center gap-2 h-12 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-green-400 hover:bg-green-50 transition-all">
                                        {isUploadingImage ? (
                                            <>
                                                <Loader2 className="w-5 h-5 animate-spin text-green-600" />
                                                <span className="text-sm text-gray-600">Uploading...</span>
                                            </>
                                        ) : (
                                            <>
                                                <Upload className="w-5 h-5 text-gray-400" />
                                                <span className="text-sm text-gray-600">
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
                                    <p className="text-xs text-gray-500">
                                        Max 5MB. Supported: JPG, PNG, WebP
                                    </p>
                                </div>

                                {/* Submit Button */}
                                <div className="flex gap-3 pt-4">
                                    <Button
                                        type="button"
                                        variant="outline"
                                        onClick={() => setIsModalOpen(false)}
                                        className="flex-1 h-12 rounded-xl"
                                    >
                                        Cancel
                                    </Button>
                                    <Button
                                        type="submit"
                                        disabled={isSaving}
                                        className="flex-1 h-12 bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700 text-white rounded-xl"
                                    >
                                        {isSaving ? (
                                            <>
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                                Saving...
                                            </>
                                        ) : (
                                            <>
                                                <Save className="w-4 h-4 mr-2" />
                                                {editingTiffin ? "Update Item" : "Add Item"}
                                            </>
                                        )}
                                    </Button>
                                </div>
                            </form>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
