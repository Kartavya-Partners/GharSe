"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useGetLocation } from "@/context/LocationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    User,
    LogOut,
    Loader2,
    MapPin,
    Phone,
    Mail,
    Edit2,
    Save,
    X,
    Crosshair,
    CheckCircle2,
    ShoppingBag,
    Home,
    Building2,
    Briefcase,
    Plus,
    Trash2,
    Calendar,
    IndianRupee,
    ChefHat,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SavedAddress {
    _id: string;
    label: string;
    street: string;
    city: string;
    pincode: string;
    coordinates?: { lat: number; lng: number };
    isDefault: boolean;
}

interface Order {
    _id: string;
    tiffin: { name: string };
    provider: { name: string };
    totalPrice: number;
    status: string;
    deliveryDate: string;
    createdAt: string;
}

export default function ProfilePage() {
    const { user, isLoading: authLoading, isAuthenticated, logout } = useAuth();
    const { location, isLoading: locationLoading, getLocation } = useGetLocation();
    const router = useRouter();

    const [profile, setProfile] = useState<any>(null);
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [orders, setOrders] = useState<Order[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isEditing, setIsEditing] = useState(false);
    const [editData, setEditData] = useState({ name: "", phone: "" });
    const [isSaving, setIsSaving] = useState(false);
    const [showAddAddress, setShowAddAddress] = useState(false);
    const [newAddress, setNewAddress] = useState({ label: "Home", street: "", city: "", pincode: "" });
    const [newAddressCoords, setNewAddressCoords] = useState<{ lat: number; lng: number } | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    // Fetch profile, addresses, orders
    useEffect(() => {
        const fetchData = async () => {
            try {
                setIsLoading(true);
                const [profileRes, addressRes, ordersRes] = await Promise.all([
                    axios.get("/users/profile"),
                    axios.get("/users/addresses"),
                    user?.role === "customer" ? axios.get("/orders/myorders") : Promise.resolve({ data: [] }),
                ]);
                setProfile(profileRes.data);
                setSavedAddresses(addressRes.data);
                setOrders(ordersRes.data.slice(0, 5)); // Last 5 orders
                setEditData({ name: profileRes.data.name, phone: profileRes.data.phone || "" });
            } catch (err) {
                console.error("Error fetching profile:", err);
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, user?.role]);

    // Save profile
    const handleSave = async () => {
        setIsSaving(true);
        try {
            await axios.put("/users/profile", editData);
            setProfile((prev: any) => ({ ...prev, ...editData }));
            setIsEditing(false);
        } catch (err) {
            console.error("Error saving profile:", err);
        } finally {
            setIsSaving(false);
        }
    };

    // Capture GPS
    const captureLocation = async () => {
        const loc = await getLocation();
        if (loc) setNewAddressCoords(loc);
    };

    // Add address
    const handleAddAddress = async () => {
        if (!newAddress.street || !newAddress.city || !newAddress.pincode) return;

        try {
            const response = await axios.post("/users/addresses", {
                ...newAddress,
                coordinates: newAddressCoords,
                isDefault: savedAddresses.length === 0,
            });
            setSavedAddresses(response.data);
            setShowAddAddress(false);
            setNewAddress({ label: "Home", street: "", city: "", pincode: "" });
            setNewAddressCoords(null);
        } catch (err) {
            console.error("Error adding address:", err);
        }
    };

    // Delete address
    const handleDeleteAddress = async (addressId: string) => {
        try {
            const response = await axios.delete(`/users/addresses/${addressId}`);
            setSavedAddresses(response.data);
        } catch (err) {
            console.error("Error deleting address:", err);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    const isProvider = user?.role === "provider";

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="max-w-4xl mx-auto px-4 py-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                            <Link
                                href={isProvider ? "/dashboard/provider" : "/explore"}
                                className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                            >
                                <ArrowLeft className="w-5 h-5" />
                            </Link>
                            <h1 className="text-lg font-semibold text-gray-900">My Profile</h1>
                        </div>
                        <Button variant="ghost" size="sm" onClick={logout} className="text-red-500">
                            <LogOut className="w-4 h-4 mr-2" />
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className="max-w-4xl mx-auto px-4 py-8">
                {/* Profile Card */}
                <div className="bg-white rounded-2xl shadow-sm border mb-6 overflow-hidden">
                    <div className={`h-24 ${isProvider ? "bg-gradient-to-r from-green-500 to-emerald-600" : "bg-gradient-to-r from-orange-500 to-red-500"}`} />

                    <div className="px-6 pb-6 -mt-12">
                        <div className="flex items-end justify-between mb-4">
                            <div className="w-20 h-20 bg-white rounded-full border-4 border-white shadow-lg flex items-center justify-center">
                                {isProvider ? (
                                    <ChefHat className="w-10 h-10 text-green-600" />
                                ) : (
                                    <User className="w-10 h-10 text-orange-500" />
                                )}
                            </div>
                            {!isEditing && (
                                <Button variant="outline" size="sm" onClick={() => setIsEditing(true)}>
                                    <Edit2 className="w-4 h-4 mr-1" />
                                    Edit
                                </Button>
                            )}
                        </div>

                        {isEditing ? (
                            <div className="space-y-4">
                                <div>
                                    <Label>Name</Label>
                                    <Input
                                        value={editData.name}
                                        onChange={(e) => setEditData((p) => ({ ...p, name: e.target.value }))}
                                        className="mt-1"
                                    />
                                </div>
                                <div>
                                    <Label>Phone</Label>
                                    <Input
                                        value={editData.phone}
                                        onChange={(e) => setEditData((p) => ({ ...p, phone: e.target.value }))}
                                        placeholder="Enter phone number"
                                        className="mt-1"
                                    />
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="outline" onClick={() => setIsEditing(false)} className="flex-1">
                                        <X className="w-4 h-4 mr-1" />
                                        Cancel
                                    </Button>
                                    <Button onClick={handleSave} disabled={isSaving} className="flex-1 bg-orange-500 hover:bg-orange-600">
                                        {isSaving ? <Loader2 className="w-4 h-4 animate-spin" /> : <><Save className="w-4 h-4 mr-1" />Save</>}
                                    </Button>
                                </div>
                            </div>
                        ) : (
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">{profile?.name}</h2>
                                <div className="flex items-center gap-4 mt-2 text-gray-600">
                                    <span className="flex items-center gap-1">
                                        <Mail className="w-4 h-4" />
                                        {profile?.email}
                                    </span>
                                    {profile?.phone && (
                                        <span className="flex items-center gap-1">
                                            <Phone className="w-4 h-4" />
                                            {profile.phone}
                                        </span>
                                    )}
                                </div>
                                <span className={`inline-block mt-3 px-3 py-1 rounded-full text-xs font-semibold ${isProvider ? "bg-green-100 text-green-700" : "bg-orange-100 text-orange-700"
                                    }`}>
                                    {isProvider ? "Food Provider" : "Customer"}
                                </span>
                            </div>
                        )}
                    </div>
                </div>

                {/* Saved Addresses */}
                <div className="bg-white rounded-2xl shadow-sm border p-6 mb-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <MapPin className="w-5 h-5 text-orange-500" />
                            Saved Addresses
                        </h3>
                        <Button variant="outline" size="sm" onClick={() => setShowAddAddress(true)}>
                            <Plus className="w-4 h-4 mr-1" />
                            Add
                        </Button>
                    </div>

                    {savedAddresses.length === 0 && !showAddAddress ? (
                        <p className="text-gray-500 text-center py-4">No saved addresses</p>
                    ) : (
                        <div className="space-y-3">
                            {savedAddresses.map((addr) => (
                                <div key={addr._id} className="flex items-start justify-between p-4 rounded-xl bg-gray-50 border">
                                    <div className="flex items-start gap-3">
                                        {addr.label === "Home" && <Home className="w-5 h-5 text-gray-500 mt-0.5" />}
                                        {addr.label === "Office" && <Briefcase className="w-5 h-5 text-gray-500 mt-0.5" />}
                                        {addr.label !== "Home" && addr.label !== "Office" && <Building2 className="w-5 h-5 text-gray-500 mt-0.5" />}
                                        <div>
                                            <p className="font-medium text-gray-900">
                                                {addr.label}
                                                {addr.isDefault && (
                                                    <span className="ml-2 text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">Default</span>
                                                )}
                                            </p>
                                            <p className="text-sm text-gray-600">{addr.street}, {addr.city} - {addr.pincode}</p>
                                            {addr.coordinates && (
                                                <p className="text-xs text-green-600 mt-1 flex items-center gap-1">
                                                    <CheckCircle2 className="w-3 h-3" />
                                                    GPS location saved
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                    <Button
                                        variant="ghost"
                                        size="sm"
                                        className="text-red-500 hover:text-red-700"
                                        onClick={() => handleDeleteAddress(addr._id)}
                                    >
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            ))}
                        </div>
                    )}

                    {/* Add Address Form */}
                    <AnimatePresence>
                        {showAddAddress && (
                            <motion.div
                                initial={{ opacity: 0, height: 0 }}
                                animate={{ opacity: 1, height: "auto" }}
                                exit={{ opacity: 0, height: 0 }}
                                className="mt-4 p-4 rounded-xl bg-gray-50 border space-y-4"
                            >
                                <div className="flex gap-2">
                                    {["Home", "Office", "Other"].map((label) => (
                                        <button
                                            key={label}
                                            onClick={() => setNewAddress((p) => ({ ...p, label }))}
                                            className={`px-4 py-2 rounded-lg text-sm font-medium ${newAddress.label === label ? "bg-orange-500 text-white" : "bg-white border"
                                                }`}
                                        >
                                            {label}
                                        </button>
                                    ))}
                                </div>
                                <Input
                                    placeholder="Street address"
                                    value={newAddress.street}
                                    onChange={(e) => setNewAddress((p) => ({ ...p, street: e.target.value }))}
                                />
                                <div className="grid grid-cols-2 gap-3">
                                    <Input
                                        placeholder="City"
                                        value={newAddress.city}
                                        onChange={(e) => setNewAddress((p) => ({ ...p, city: e.target.value }))}
                                    />
                                    <Input
                                        placeholder="Pincode"
                                        value={newAddress.pincode}
                                        onChange={(e) => setNewAddress((p) => ({ ...p, pincode: e.target.value }))}
                                    />
                                </div>
                                <button
                                    onClick={captureLocation}
                                    disabled={locationLoading}
                                    className={`w-full h-10 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed ${newAddressCoords ? "border-green-500 bg-green-50 text-green-700" : "border-gray-300"
                                        }`}
                                >
                                    {locationLoading ? (
                                        <Loader2 className="w-4 h-4 animate-spin" />
                                    ) : newAddressCoords ? (
                                        <><CheckCircle2 className="w-4 h-4" />GPS Captured</>
                                    ) : (
                                        <><Crosshair className="w-4 h-4" />Capture GPS Location</>
                                    )}
                                </button>
                                <div className="flex gap-2">
                                    <Button variant="outline" className="flex-1" onClick={() => setShowAddAddress(false)}>
                                        Cancel
                                    </Button>
                                    <Button className="flex-1 bg-orange-500 hover:bg-orange-600" onClick={handleAddAddress}>
                                        Save Address
                                    </Button>
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>
                </div>

                {/* Order History (Customer only) */}
                {!isProvider && (
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-orange-500" />
                                Recent Orders
                            </h3>
                            <Link href="/orders">
                                <Button variant="link" className="text-orange-600">
                                    View All →
                                </Button>
                            </Link>
                        </div>

                        {orders.length === 0 ? (
                            <p className="text-gray-500 text-center py-4">No orders yet</p>
                        ) : (
                            <div className="space-y-3">
                                {orders.map((order) => (
                                    <Link key={order._id} href="/orders">
                                        <div className="p-4 rounded-xl bg-gray-50 border hover:border-orange-300 transition-colors cursor-pointer">
                                            <div className="flex items-center justify-between mb-2">
                                                <span className="font-medium text-gray-900">{order.tiffin.name}</span>
                                                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${order.status === "delivered" ? "bg-green-100 text-green-700" :
                                                    order.status === "cancelled" ? "bg-red-100 text-red-700" :
                                                        "bg-orange-100 text-orange-700"
                                                    }`}>
                                                    {order.status}
                                                </span>
                                            </div>
                                            <div className="flex items-center gap-4 text-sm text-gray-500">
                                                <span>{order.provider.name}</span>
                                                <span className="flex items-center gap-1">
                                                    <Calendar className="w-3 h-3" />
                                                    {new Date(order.deliveryDate).toLocaleDateString("en-IN", { day: "numeric", month: "short" })}
                                                </span>
                                                <span className="flex items-center gap-1">
                                                    <IndianRupee className="w-3 h-3" />
                                                    {order.totalPrice}
                                                </span>
                                            </div>
                                        </div>
                                    </Link>
                                ))}
                            </div>
                        )}
                    </div>
                )}

                {/* Provider Kitchen Info */}
                {isProvider && profile?.address && (
                    <div className="bg-white rounded-2xl shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2 mb-4">
                            <ChefHat className="w-5 h-5 text-green-600" />
                            Kitchen Location
                        </h3>
                        <div className="p-4 rounded-xl bg-green-50 border border-green-200">
                            <p className="text-gray-900">{profile.address.street}</p>
                            <p className="text-gray-600">{profile.address.city} - {profile.address.pincode}</p>
                            {profile.address.coordinates && (
                                <p className="text-xs text-green-600 mt-2 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    GPS: {profile.address.coordinates.lat.toFixed(4)}, {profile.address.coordinates.lng.toFixed(4)}
                                </p>
                            )}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
