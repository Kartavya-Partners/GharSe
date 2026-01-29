"use client";

import { useState, useEffect, Suspense } from "react";
import Link from "next/link";
import { useRouter, useSearchParams } from "next/navigation";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useGetLocation } from "@/context/LocationContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
    ArrowLeft,
    ShoppingBag,
    Loader2,
    MapPin,
    Plus,
    CheckCircle2,
    Crosshair,
    IndianRupee,
    Calendar,
    AlertCircle,
    Home,
    Building2,
    Briefcase,
    Minus,
    Plus as PlusIcon,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

interface SavedAddress {
    _id: string;
    label: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: { lat: number; lng: number };
    isDefault: boolean;
}

interface Tiffin {
    _id: string;
    name: string;
    price: number;
    type: string;
    provider: {
        _id: string;
        name: string;
    };
}

function CheckoutContent() {
    const searchParams = useSearchParams();
    const router = useRouter();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const { location, isLoading: locationLoading, getLocation } = useGetLocation();

    const tiffinId = searchParams.get("tiffinId") || searchParams.get("tiffin");
    const initialQty = parseInt(searchParams.get("quantity") || searchParams.get("qty") || "1");

    const [orderQuantity, setOrderQuantity] = useState(initialQty);
    const [deliveryInstructions, setDeliveryInstructions] = useState("");

    const [tiffin, setTiffin] = useState<Tiffin | null>(null);
    const [savedAddresses, setSavedAddresses] = useState<SavedAddress[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [isLoading, setIsLoading] = useState(true);
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [error, setError] = useState("");
    const [showNewAddress, setShowNewAddress] = useState(false);
    const [deliveryDate, setDeliveryDate] = useState(() => {
        const tomorrow = new Date();
        tomorrow.setDate(tomorrow.getDate() + 1);
        return tomorrow.toISOString().split("T")[0];
    });

    const [newAddress, setNewAddress] = useState({
        label: "Home",
        street: "",
        city: "",
        pincode: "",
    });
    const [newAddressCoords, setNewAddressCoords] = useState<{ lat: number; lng: number } | null>(null);

    // Redirect if not authenticated
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login?role=customer");
        }
    }, [authLoading, isAuthenticated, router]);

    // Fetch tiffin and addresses
    useEffect(() => {
        const fetchData = async () => {
            if (!tiffinId) {
                router.push("/explore");
                return;
            }

            try {
                setIsLoading(true);
                const [tiffinRes, addressRes] = await Promise.all([
                    axios.get(`/tiffins/${tiffinId}`),
                    axios.get("/users/addresses"),
                ]);

                setTiffin(tiffinRes.data);
                setSavedAddresses(addressRes.data);

                // Select default address
                const defaultAddr = addressRes.data.find((a: SavedAddress) => a.isDefault);
                if (defaultAddr) setSelectedAddressId(defaultAddr._id);
                else if (addressRes.data.length > 0) setSelectedAddressId(addressRes.data[0]._id);
                else setShowNewAddress(true);
            } catch (err) {
                console.error("Error fetching data:", err);
                setError("Failed to load checkout data");
            } finally {
                setIsLoading(false);
            }
        };

        if (isAuthenticated) {
            fetchData();
        }
    }, [isAuthenticated, tiffinId, router]);

    // Capture location for new address
    const captureLocation = async () => {
        const loc = await getLocation();
        if (loc) {
            setNewAddressCoords(loc);
        }
    };

    // Save new address
    const saveNewAddress = async () => {
        if (!newAddress.street || !newAddress.city || !newAddress.pincode) {
            setError("Please fill all address fields");
            return;
        }

        try {
            const response = await axios.post("/users/addresses", {
                ...newAddress,
                coordinates: newAddressCoords,
                isDefault: savedAddresses.length === 0,
            });

            setSavedAddresses(response.data);
            const latestAddr = response.data[response.data.length - 1];
            setSelectedAddressId(latestAddr._id);
            setShowNewAddress(false);
            setNewAddress({ label: "Home", street: "", city: "", pincode: "" });
            setNewAddressCoords(null);
        } catch (err) {
            console.error("Error saving address:", err);
            setError("Failed to save address");
        }
    };

    // Place order
    const placeOrder = async () => {
        const selectedAddress = savedAddresses.find((a) => a._id === selectedAddressId);
        if (!selectedAddress) {
            setError("Please select a delivery address");
            return;
        }

        setIsPlacingOrder(true);
        setError("");

        try {
            await axios.post("/orders", {
                tiffinId: tiffin?._id,
                quantity: orderQuantity,
                deliveryDate,
                deliveryAddress: {
                    street: selectedAddress.street,
                    city: selectedAddress.city,
                    state: selectedAddress.state,
                    pincode: selectedAddress.pincode,
                    coordinates: selectedAddress.coordinates,
                },
                deliveryInstructions,
            });

            router.push("/orders?success=true");
        } catch (err: any) {
            console.error("Error placing order:", err);
            setError(err.response?.data?.message || "Failed to place order");
            setIsPlacingOrder(false);
        }
    };

    if (authLoading || isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (!tiffin) return null;

    const totalPrice = tiffin.price * orderQuantity;

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white border-b shadow-sm">
                <div className="max-w-3xl mx-auto px-4 py-4">
                    <div className="flex items-center gap-4">
                        <Link
                            href="/explore"
                            className="flex items-center gap-2 text-gray-600 hover:text-gray-900"
                        >
                            <ArrowLeft className="w-5 h-5" />
                        </Link>
                        <h1 className="text-lg font-semibold text-gray-900">Checkout</h1>
                    </div>
                </div>
            </header>

            <main className="max-w-3xl mx-auto px-4 py-8">
                {error && (
                    <div className="mb-6 p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                        <span className="text-sm text-red-700">{error}</span>
                    </div>
                )}

                <div className="grid md:grid-cols-3 gap-6">
                    {/* Left Column - Address */}
                    <div className="md:col-span-2 space-y-6">
                        {/* Delivery Address */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <MapPin className="w-5 h-5 text-orange-500" />
                                Delivery Address
                            </h2>

                            {/* Saved Addresses */}
                            <div className="space-y-3 mb-4">
                                {savedAddresses.map((addr) => (
                                    <button
                                        key={addr._id}
                                        onClick={() => {
                                            setSelectedAddressId(addr._id);
                                            setShowNewAddress(false);
                                        }}
                                        className={`w-full p-4 rounded-xl border-2 text-left transition-all ${selectedAddressId === addr._id
                                            ? "border-orange-500 bg-orange-50"
                                            : "border-gray-200 hover:border-gray-300"
                                            }`}
                                    >
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <div className="flex items-center gap-2 mb-1">
                                                    {addr.label === "Home" && <Home className="w-4 h-4 text-gray-500" />}
                                                    {addr.label === "Office" && <Briefcase className="w-4 h-4 text-gray-500" />}
                                                    {addr.label !== "Home" && addr.label !== "Office" && (
                                                        <Building2 className="w-4 h-4 text-gray-500" />
                                                    )}
                                                    <span className="font-medium text-gray-900">{addr.label}</span>
                                                    {addr.isDefault && (
                                                        <span className="text-xs bg-orange-100 text-orange-600 px-2 py-0.5 rounded-full">
                                                            Default
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-600">
                                                    {addr.street}, {addr.city} - {addr.pincode}
                                                </p>
                                            </div>
                                            {selectedAddressId === addr._id && (
                                                <CheckCircle2 className="w-5 h-5 text-orange-500" />
                                            )}
                                        </div>
                                    </button>
                                ))}
                            </div>

                            {/* Add New Address Button */}
                            {!showNewAddress && (
                                <button
                                    onClick={() => setShowNewAddress(true)}
                                    className="w-full p-4 rounded-xl border-2 border-dashed border-gray-300 text-gray-600 hover:border-orange-400 hover:text-orange-600 hover:bg-orange-50 transition-all flex items-center justify-center gap-2"
                                >
                                    <Plus className="w-5 h-5" />
                                    Add New Address
                                </button>
                            )}

                            {/* New Address Form */}
                            <AnimatePresence>
                                {showNewAddress && (
                                    <motion.div
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-4 mt-4 p-4 bg-gray-50 rounded-xl"
                                    >
                                        <div className="flex gap-2">
                                            {["Home", "Office", "Other"].map((label) => (
                                                <button
                                                    key={label}
                                                    onClick={() => setNewAddress((prev) => ({ ...prev, label }))}
                                                    className={`px-4 py-2 rounded-lg text-sm font-medium transition-all ${newAddress.label === label
                                                        ? "bg-orange-500 text-white"
                                                        : "bg-white border text-gray-600"
                                                        }`}
                                                >
                                                    {label}
                                                </button>
                                            ))}
                                        </div>

                                        <Input
                                            placeholder="Street address"
                                            value={newAddress.street}
                                            onChange={(e) => setNewAddress((prev) => ({ ...prev, street: e.target.value }))}
                                            className="bg-white"
                                        />

                                        <div className="grid grid-cols-2 gap-3">
                                            <Input
                                                placeholder="City"
                                                value={newAddress.city}
                                                onChange={(e) => setNewAddress((prev) => ({ ...prev, city: e.target.value }))}
                                                className="bg-white"
                                            />
                                            <Input
                                                placeholder="Pincode"
                                                value={newAddress.pincode}
                                                onChange={(e) => setNewAddress((prev) => ({ ...prev, pincode: e.target.value }))}
                                                className="bg-white"
                                            />
                                        </div>

                                        {/* GPS Capture */}
                                        <button
                                            type="button"
                                            onClick={captureLocation}
                                            disabled={locationLoading}
                                            className={`w-full h-10 flex items-center justify-center gap-2 rounded-lg border-2 border-dashed transition-all ${newAddressCoords
                                                ? "border-green-500 bg-green-50 text-green-700"
                                                : "border-gray-300 hover:border-orange-400 text-gray-600"
                                                }`}
                                        >
                                            {locationLoading ? (
                                                <Loader2 className="w-4 h-4 animate-spin" />
                                            ) : newAddressCoords ? (
                                                <>
                                                    <CheckCircle2 className="w-4 h-4" />
                                                    GPS captured
                                                </>
                                            ) : (
                                                <>
                                                    <Crosshair className="w-4 h-4" />
                                                    Capture GPS location
                                                </>
                                            )}
                                        </button>

                                        <div className="flex gap-2">
                                            <Button
                                                variant="outline"
                                                className="flex-1"
                                                onClick={() => setShowNewAddress(false)}
                                            >
                                                Cancel
                                            </Button>
                                            <Button
                                                className="flex-1 bg-orange-500 hover:bg-orange-600"
                                                onClick={saveNewAddress}
                                            >
                                                Save Address
                                            </Button>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>
                        </div>

                        {/* Delivery Date */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <Calendar className="w-5 h-5 text-orange-500" />
                                Delivery Date
                            </h2>
                            <Input
                                type="date"
                                value={deliveryDate}
                                min={new Date().toISOString().split("T")[0]}
                                onChange={(e) => setDeliveryDate(e.target.value)}
                                className="bg-gray-50"
                            />
                        </div>

                        {/* Quantity Selector */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-orange-500" />
                                Quantity
                            </h2>
                            <div className="flex items-center gap-4">
                                <button
                                    onClick={() => setOrderQuantity(Math.max(1, orderQuantity - 1))}
                                    disabled={orderQuantity <= 1}
                                    className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-orange-400 hover:bg-orange-50 disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                                >
                                    <Minus className="w-5 h-5" />
                                </button>
                                <span className="text-2xl font-bold w-12 text-center">{orderQuantity}</span>
                                <button
                                    onClick={() => setOrderQuantity(orderQuantity + 1)}
                                    className="w-10 h-10 rounded-full border-2 border-gray-200 flex items-center justify-center hover:border-orange-400 hover:bg-orange-50 transition-all"
                                >
                                    <PlusIcon className="w-5 h-5" />
                                </button>
                                <span className="text-sm text-gray-500 ml-2">
                                    ₹{tiffin.price} × {orderQuantity} = ₹{tiffin.price * orderQuantity}
                                </span>
                            </div>
                        </div>

                        {/* Delivery Instructions */}
                        <div className="bg-white rounded-2xl p-6 shadow-sm border">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4">
                                Delivery Instructions (Optional)
                            </h2>
                            <textarea
                                placeholder="Any special instructions for the provider? E.g., Less spicy, no onion, ring doorbell twice..."
                                value={deliveryInstructions}
                                onChange={(e) => setDeliveryInstructions(e.target.value)}
                                className="w-full h-24 p-3 bg-gray-50 border rounded-xl resize-none focus:ring-2 focus:ring-orange-400 focus:border-transparent"
                                maxLength={250}
                            />
                            <p className="text-xs text-gray-400 mt-1 text-right">
                                {deliveryInstructions.length}/250
                            </p>
                        </div>
                    </div>

                    {/* Right Column - Order Summary */}
                    <div className="md:col-span-1">
                        <div className="bg-white rounded-2xl p-6 shadow-sm border sticky top-24">
                            <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center gap-2">
                                <ShoppingBag className="w-5 h-5 text-orange-500" />
                                Order Summary
                            </h2>

                            <div className="space-y-3 mb-6">
                                <div className="flex justify-between">
                                    <span className="text-gray-600">{tiffin.name}</span>
                                    <span className="font-medium">×{orderQuantity}</span>
                                </div>
                                <div className="flex justify-between text-sm text-gray-500">
                                    <span>From {tiffin.provider?.name}</span>
                                </div>
                                <div className="border-t pt-3 flex justify-between">
                                    <span className="font-medium">Total</span>
                                    <span className="text-xl font-bold text-gray-900 flex items-center">
                                        <IndianRupee className="w-5 h-5" />
                                        {totalPrice}
                                    </span>
                                </div>
                            </div>

                            <Button
                                className="w-full h-12 bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600 text-white rounded-xl font-semibold"
                                onClick={placeOrder}
                                disabled={isPlacingOrder || !selectedAddressId}
                            >
                                {isPlacingOrder ? (
                                    <>
                                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                                        Placing Order...
                                    </>
                                ) : (
                                    "Place Order"
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </main>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            }
        >
            <CheckoutContent />
        </Suspense>
    );
}
