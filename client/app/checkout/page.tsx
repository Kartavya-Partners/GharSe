"use client";

import { Suspense, useState, useEffect } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import Link from "next/link";
import axios from "axios";
import { useAuth } from "@/context/AuthContext";
import { useLocation } from "@/context/LocationContext";
import { useCart } from "@/context/CartContext";
import { ArrowLeft, HelpCircle, Loader2, MapPin, Search, Home, Briefcase, CheckCircle, CreditCard, Tag, ChevronRight, Lock, Check, Star, Plus, Minus, IndianRupee } from "lucide-react";
import { motion } from "framer-motion";

interface Tiffin {
    _id: string;
    name: string;
    description: string;
    price: number;
    type: "veg" | "non-veg" | "vegan";
    mealType: string;
    images: string[];
    provider: {
        _id: string;
        name: string;
        rating?: number;
        reviewCount?: number;
    };
}

interface Address {
    _id: string;
    label?: string;
    street: string;
    city: string;
    state: string;
    pincode: string;
    coordinates?: {
        lat: number;
        lng: number;
    };
}

function CheckoutContent() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const { user, isLoading: authLoading, isAuthenticated } = useAuth();
    const { location, requestLocation } = useLocation();
    const { items: cartItems, cartTotal, updateQuantity, clearCart } = useCart();

    const [error, setError] = useState("");
    const [savedAddresses, setSavedAddresses] = useState<Address[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");
    const [isPlacingOrder, setIsPlacingOrder] = useState(false);
    const [searchQuery, setSearchQuery] = useState("");
    const [isDetectingLocation, setIsDetectingLocation] = useState(false);

    // Add new address form
    const [showAddForm, setShowAddForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        label: "Home",
        street: "",
        city: "",
        state: "",
        pincode: "",
    });
    const [isSavingAddress, setIsSavingAddress] = useState(false);

    // Auth redirect
    useEffect(() => {
        if (!authLoading && !isAuthenticated) {
            router.push("/login");
        }
    }, [authLoading, isAuthenticated, router]);

    // Reverse geocode helper
    const reverseGeocode = async (lat: number, lng: number): Promise<{ street: string; city: string; state: string; pincode: string }> => {
        try {
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&addressdetails=1`);
            const data = await res.json();
            const addr = data.address || {};
            return {
                street: [addr.road, addr.neighbourhood, addr.suburb].filter(Boolean).join(", ") || data.display_name?.split(",").slice(0, 2).join(",") || "Current Location",
                city: addr.city || addr.town || addr.village || addr.county || "Unknown City",
                state: addr.state || "Unknown State",
                pincode: addr.postcode || "000000",
            };
        } catch {
            return { street: "Current Location", city: "Unknown City", state: "Unknown State", pincode: "000000" };
        }
    };

    // Fetch saved addresses OR auto-detect from GPS
    useEffect(() => {
        if (!isAuthenticated) return;

        const loadAddresses = async () => {
            try {
                const response = await axios.get("/users/profile");
                const userData = response.data;

                let addresses: Address[] = [];

                if (userData.addresses && userData.addresses.length > 0) {
                    addresses = userData.addresses;
                } else if (userData.address && userData.address.street) {
                    addresses = [{
                        _id: "main-address",
                        label: "Home",
                        ...userData.address,
                    }];
                }

                if (addresses.length > 0) {
                    setSavedAddresses(addresses);
                    const defaultAddr = addresses.find((a: any) => a.isDefault);
                    setSelectedAddressId(defaultAddr ? defaultAddr._id : addresses[0]._id);
                } else {
                    // No saved addresses — detect from GPS
                    setIsDetectingLocation(true);
                    if (!location) {
                        requestLocation();
                    }
                }
            } catch (err) {
                console.error("Error fetching profile:", err);
                setIsDetectingLocation(true);
                if (!location) requestLocation();
            }
        };

        loadAddresses();
    }, [isAuthenticated]);

    // When location becomes available and we need to detect, reverse-geocode it
    useEffect(() => {
        if (!isDetectingLocation || !location) return;

        const autoDetect = async () => {
            try {
                const geo = await reverseGeocode(location.lat, location.lng);
                const gpsAddress: Address = {
                    _id: "gps-detected",
                    label: "Current Location",
                    street: geo.street,
                    city: geo.city,
                    state: geo.state,
                    pincode: geo.pincode,
                    coordinates: { lat: location.lat, lng: location.lng },
                };
                setSavedAddresses([gpsAddress]);
                setSelectedAddressId("gps-detected");

                // Auto-save this address to user profile
                try {
                    const saveRes = await axios.post("/users/addresses", {
                        label: "Home",
                        street: geo.street,
                        city: geo.city,
                        state: geo.state,
                        pincode: geo.pincode,
                        coordinates: { lat: location.lat, lng: location.lng },
                    });
                    if (saveRes.data?._id) {
                        setSavedAddresses([{ ...gpsAddress, _id: saveRes.data._id, label: "Home" }]);
                        setSelectedAddressId(saveRes.data._id);
                    }
                } catch {
                    // If save fails, still allow checkout with GPS address
                }
            } catch {
                setError("Could not detect your location. Please add an address manually.");
                setShowAddForm(true);
            } finally {
                setIsDetectingLocation(false);
            }
        };

        autoDetect();
    }, [isDetectingLocation, location]);

    // Save new address
    const handleSaveNewAddress = async () => {
        if (!newAddress.street || !newAddress.city || !newAddress.state || !newAddress.pincode) {
            setError("Please fill in all address fields.");
            return;
        }
        setIsSavingAddress(true);
        setError("");
        try {
            const res = await axios.post("/users/addresses", {
                ...newAddress,
                coordinates: location ? { lat: location.lat, lng: location.lng } : undefined,
            });
            const saved: Address = res.data;
            setSavedAddresses((prev) => [...prev, saved]);
            setSelectedAddressId(saved._id);
            setShowAddForm(false);
            setNewAddress({ label: "Home", street: "", city: "", state: "", pincode: "" });
        } catch (err: any) {
            setError(err.response?.data?.message || "Failed to save address");
        } finally {
            setIsSavingAddress(false);
        }
    };

    const placeOrder = async () => {
        const selectedAddress = savedAddresses.find((a) => a._id === selectedAddressId);
        if (!selectedAddress) {
            setError("Please select a delivery address");
            return;
        }

        if (cartItems.length === 0) {
            setError("Your cart is empty.");
            return;
        }

        setIsPlacingOrder(true);
        setError("");

        try {
            await Promise.all(
                cartItems.map((item) =>
                    axios.post("/orders", {
                        tiffinId: item.tiffinId,
                        quantity: item.quantity,
                        deliveryDate: new Date(Date.now() + 86400000).toISOString().split("T")[0], // Tomorrow
                        deliveryAddress: {
                            street: selectedAddress.street,
                            city: selectedAddress.city,
                            state: selectedAddress.state,
                            pincode: selectedAddress.pincode,
                            coordinates: selectedAddress.coordinates,
                        },
                        deliveryInstructions: "",
                    })
                )
            );

            clearCart();
            router.push("/orders?success=true");
        } catch (err: any) {
            console.error("Error placing order:", err);
            setError(err.response?.data?.message || err.message || "Failed to place order");
            setIsPlacingOrder(false);
        }
    };

    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7] dark:bg-gray-900">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    if (cartItems.length === 0 && !isPlacingOrder) {
        return (
            <div className="min-h-screen flex flex-col items-center justify-center bg-[#FDFBF7] dark:bg-gray-900">
                <h2 className="text-xl font-bold text-gray-900 dark:text-white mb-2">Your cart is empty</h2>
                <Link href="/explore" className="px-6 py-2.5 bg-orange-500 text-white font-semibold rounded-xl hover:bg-orange-600 transition-colors mt-4">
                    Browse Meals
                </Link>
            </div>
        );
    }

    // Pricing calculation — no taxes or extra charges
    const itemTotal = cartTotal;
    const finalTotal = itemTotal;

    return (
        <div className="bg-[#FDFBF7] dark:bg-gray-900 text-gray-900 dark:text-gray-100 min-h-screen transition-colors duration-300 font-sans">
            {/* Header */}
            <header className="sticky top-0 z-50 bg-white/80 dark:bg-gray-800/80 backdrop-blur-md border-b border-gray-200 dark:border-gray-700">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-4">
                            <button onClick={() => router.back()} className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <ArrowLeft className="w-5 h-5 text-gray-900 dark:text-gray-100" />
                            </button>
                            <span className="text-xl font-bold tracking-tight text-orange-500">GharSe</span>
                        </div>
                        <div className="flex items-center gap-4">
                            <div className="text-sm text-gray-500 dark:text-gray-400 hidden sm:block">Step 2 of 3</div>
                            <button className="p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors">
                                <HelpCircle className="w-5 h-5" />
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 lg:py-12">
                {/* Progress Steps */}
                <div className="mb-12 max-w-3xl mx-auto">
                    <div className="flex justify-between items-center relative">
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-full h-1 bg-gray-200 dark:bg-gray-700 rounded-full -z-10"></div>
                        <div className="absolute left-0 top-1/2 transform -translate-y-1/2 w-1/2 h-1 bg-orange-500 rounded-full -z-10 transition-all duration-500"></div>

                        {/* Step 1: Address */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-orange-500 flex items-center justify-center text-white font-semibold shadow-lg shadow-orange-500/30">
                                <Check className="w-5 h-5" />
                            </div>
                            <span className="text-xs font-medium text-orange-500">Address</span>
                        </div>

                        {/* Step 2: Payment */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-orange-500 ring-4 ring-orange-500/20 flex items-center justify-center text-white font-semibold shadow-lg shadow-orange-500/30">
                                2
                            </div>
                            <span className="text-xs font-bold text-gray-900 dark:text-gray-100">Payment</span>
                        </div>

                        {/* Step 3: Order Placed */}
                        <div className="flex flex-col items-center gap-2">
                            <div className="w-10 h-10 rounded-full bg-white dark:bg-gray-800 border-2 border-gray-300 dark:border-gray-600 flex items-center justify-center text-gray-400 font-semibold">
                                3
                            </div>
                            <span className="text-xs font-medium text-gray-500 dark:text-gray-400">Order Placed</span>
                        </div>
                    </div>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
                    {/* Left Column (Address & Payment) */}
                    <div className="lg:col-span-7 space-y-8">
                        {/* Delivery Address Section */}
                        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-lg font-bold flex items-center gap-2">
                                    <MapPin className="text-orange-500 w-5 h-5" />
                                    Delivery Address
                                </h2>
                                <button className="text-sm text-orange-500 font-medium hover:text-orange-600 transition-colors">Change</button>
                            </div>

                            {/* Native Map Header Mockup */}
                            <div className="relative w-full h-48 bg-gray-100 dark:bg-gray-700 rounded-xl overflow-hidden mb-6 group cursor-pointer border border-gray-200 dark:border-gray-600">
                                <div className="absolute inset-0 bg-cover bg-center opacity-70 group-hover:opacity-90 transition-opacity" style={{ backgroundImage: "url('https://maps.googleapis.com/maps/api/staticmap?center=18.4529,73.8263&zoom=14&size=600x300&maptype=roadmap&style=feature:all|element:labels|visibility:off&style=feature:landscape|color:0xf3f4f6')", backgroundColor: "#e5e7eb" }}>
                                    <div className="w-full h-full bg-gradient-to-br from-blue-50/50 to-gray-200/50 dark:from-gray-800 dark:to-black"></div>
                                </div>
                                <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2">
                                    <MapPin className="w-10 h-10 text-orange-500 drop-shadow-md animate-bounce" fill="currentColor" />
                                    <div className="w-4 h-1 bg-black/20 rounded-full mx-auto blur-[1px]"></div>
                                </div>
                                <div className="absolute top-4 left-4 right-4">
                                    <div className="relative">
                                        <span className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                                            <Search className="text-gray-400 w-5 h-5" />
                                        </span>
                                        <input
                                            type="text"
                                            value={searchQuery}
                                            onChange={(e) => setSearchQuery(e.target.value)}
                                            className="block w-full pl-10 pr-3 py-2 border-none rounded-lg leading-5 bg-white/90 dark:bg-gray-900/90 text-gray-900 dark:text-gray-100 placeholder-gray-500 focus:outline-none focus:ring-2 focus:ring-orange-500 shadow-sm text-sm"
                                            placeholder="Search for a new location..."
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Saved Addresses List */}
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                {savedAddresses.length > 0 ? (
                                    savedAddresses.map((addr) => {
                                        const isSelected = selectedAddressId === addr._id;
                                        const isHome = addr.label?.toLowerCase() === 'home';

                                        return (
                                            <div
                                                key={addr._id}
                                                onClick={() => setSelectedAddressId(addr._id)}
                                                className={`relative p-4 rounded-xl cursor-pointer transition-all ${isSelected
                                                    ? "border-2 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10"
                                                    : "border border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800 hover:border-gray-300 dark:hover:border-gray-600"
                                                    }`}
                                            >
                                                {isSelected && (
                                                    <div className="absolute top-3 right-3 text-orange-500">
                                                        <CheckCircle className="w-5 h-5" fill="currentColor" />
                                                    </div>
                                                )}
                                                <div className="flex items-start gap-3">
                                                    <span className="mt-1 text-gray-500">
                                                        {isHome ? <Home className="w-5 h-5" /> : <Briefcase className="w-5 h-5" />}
                                                    </span>
                                                    <div>
                                                        <h3 className="font-semibold text-sm mb-1">{addr.label || 'Home'}</h3>
                                                        <p className="text-xs text-gray-500 dark:text-gray-400 leading-relaxed">
                                                            {addr.street},<br />
                                                            {addr.city}, {addr.state} - {addr.pincode}
                                                        </p>
                                                    </div>
                                                </div>
                                            </div>
                                        );
                                    })
                                ) : (
                                    <div className="col-span-full text-center py-6 text-sm text-gray-500">
                                        {isDetectingLocation ? (
                                            <div className="flex flex-col items-center gap-3">
                                                <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                                                <p>Detecting your location...</p>
                                            </div>
                                        ) : (
                                            <p>No addresses found. Add one below.</p>
                                        )}
                                    </div>
                                )}
                            </div>

                            {/* Add New Address Button & Form */}
                            <div className="mt-6">
                                {!showAddForm ? (
                                    <button
                                        onClick={() => setShowAddForm(true)}
                                        className="w-full py-3 border-2 border-dashed border-gray-300 dark:border-gray-600 rounded-xl text-sm font-medium text-gray-500 hover:border-orange-400 hover:text-orange-500 transition-colors flex items-center justify-center gap-2"
                                    >
                                        <Plus className="w-4 h-4" /> Add New Address
                                    </button>
                                ) : (
                                    <div className="bg-gray-50 dark:bg-gray-700/50 rounded-xl p-5 border border-gray-200 dark:border-gray-600 space-y-4">
                                        <h3 className="font-semibold text-sm flex items-center gap-2">
                                            <MapPin className="w-4 h-4 text-orange-500" /> New Address
                                        </h3>
                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="col-span-2">
                                                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">Label</label>
                                                <select
                                                    value={newAddress.label}
                                                    onChange={(e) => setNewAddress({ ...newAddress, label: e.target.value })}
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                                >
                                                    <option value="Home">Home</option>
                                                    <option value="Work">Work</option>
                                                    <option value="Other">Other</option>
                                                </select>
                                            </div>
                                            <div className="col-span-2">
                                                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">Street / Area</label>
                                                <input
                                                    type="text"
                                                    value={newAddress.street}
                                                    onChange={(e) => setNewAddress({ ...newAddress, street: e.target.value })}
                                                    placeholder="e.g. 123 Main Road, Sector 5"
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">City</label>
                                                <input
                                                    type="text"
                                                    value={newAddress.city}
                                                    onChange={(e) => setNewAddress({ ...newAddress, city: e.target.value })}
                                                    placeholder="e.g. Pune"
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">State</label>
                                                <input
                                                    type="text"
                                                    value={newAddress.state}
                                                    onChange={(e) => setNewAddress({ ...newAddress, state: e.target.value })}
                                                    placeholder="e.g. Maharashtra"
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                                />
                                            </div>
                                            <div>
                                                <label className="text-xs text-gray-500 dark:text-gray-400 font-medium mb-1 block">Pincode</label>
                                                <input
                                                    type="text"
                                                    value={newAddress.pincode}
                                                    onChange={(e) => setNewAddress({ ...newAddress, pincode: e.target.value })}
                                                    placeholder="e.g. 411041"
                                                    className="w-full px-3 py-2 rounded-lg border border-gray-200 dark:border-gray-600 bg-white dark:bg-gray-800 text-sm focus:ring-2 focus:ring-orange-500 focus:outline-none"
                                                />
                                            </div>
                                        </div>
                                        <div className="flex gap-3 pt-2">
                                            <button
                                                onClick={handleSaveNewAddress}
                                                disabled={isSavingAddress}
                                                className="flex-1 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-2.5 rounded-xl text-sm transition-colors flex items-center justify-center gap-2"
                                            >
                                                {isSavingAddress ? <Loader2 className="w-4 h-4 animate-spin" /> : <Check className="w-4 h-4" />}
                                                Save Address
                                            </button>
                                            <button
                                                onClick={() => setShowAddForm(false)}
                                                className="px-4 py-2.5 border border-gray-200 dark:border-gray-600 rounded-xl text-sm text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
                                            >
                                                Cancel
                                            </button>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </section>

                        {/* Payment Method Section */}
                        <section className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                            <h2 className="text-lg font-bold flex items-center gap-2 mb-6">
                                <CreditCard className="text-orange-500 w-5 h-5" />
                                Payment Method
                            </h2>
                            <div className="space-y-3">
                                <label className="flex items-center justify-between p-4 border-2 border-orange-500 bg-orange-50/50 dark:bg-orange-900/10 rounded-xl cursor-pointer transition-colors">
                                    <div className="flex items-center gap-3">
                                        <input
                                            type="radio"
                                            name="payment"
                                            checked={true}
                                            readOnly
                                            className="w-5 h-5 text-orange-500 border-gray-300 focus:ring-orange-500"
                                        />
                                        <div className="flex flex-col">
                                            <span className="font-medium text-sm">Cash on Delivery</span>
                                            <span className="text-xs text-gray-500 dark:text-gray-400">Pay in cash when your order arrives</span>
                                        </div>
                                    </div>
                                    <CreditCard className="text-orange-500 w-6 h-6" />
                                </label>
                            </div>
                        </section>
                    </div>

                    {/* Right Column (Order Summary) */}
                    <div className="lg:col-span-5">
                        <div className="sticky top-24">
                            <div className="bg-white dark:bg-gray-800 rounded-2xl shadow-sm p-6 border border-gray-200 dark:border-gray-700">
                                <h2 className="text-lg font-bold mb-6">Order Summary</h2>

                                {/* Provider Header */}
                                <div className="flex items-center gap-4 mb-6 pb-6 border-b border-dashed border-gray-200 dark:border-gray-700">
                                    <div className="w-12 h-12 rounded-full bg-orange-100 dark:bg-orange-900 flex items-center justify-center text-orange-500 font-bold text-lg">
                                        GS
                                    </div>
                                    <div>
                                        <h3 className="font-semibold text-sm">Your GharSe Order</h3>
                                        <div className="flex items-center gap-1 text-xs text-gray-500 dark:text-gray-400">
                                            {cartItems.length} items from {new Set(cartItems.map((i) => i.providerId)).size} Chef(s)
                                        </div>
                                    </div>
                                </div>

                                {/* Order Items */}
                                <div className="space-y-4 mb-6 max-h-64 overflow-y-auto pr-2 scrollbar-hide">
                                    {cartItems.map((item) => (
                                        <div key={item.tiffinId} className="flex justify-between items-start">
                                            <div className="flex gap-3">
                                                <div className={`w-5 h-5 mt-0.5 flex items-center justify-center border rounded-sm ${item.type === 'veg' ? 'border-green-600' : item.type === 'non-veg' ? 'border-red-600' : 'border-green-600'}`}>
                                                    <div className={`w-2.5 h-2.5 rounded-full ${item.type === 'veg' ? 'bg-green-600' : item.type === 'non-veg' ? 'bg-red-600' : 'bg-green-600'}`}></div>
                                                </div>
                                                <div>
                                                    <h4 className="text-sm font-medium">{item.name}</h4>
                                                    <p className="text-xs text-orange-500 font-semibold mt-1">₹{item.price}</p>
                                                </div>
                                            </div>
                                            <div className="flex flex-col items-end gap-1">
                                                <span className="text-sm font-bold">₹{item.price * item.quantity}</span>
                                                <div className="flex items-center border border-gray-200 dark:border-gray-700 rounded-md">
                                                    <button
                                                        onClick={() => updateQuantity(item.tiffinId, item.quantity - 1)}
                                                        className="px-2 py-0.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors"
                                                    >
                                                        <Minus className="w-3 h-3" />
                                                    </button>
                                                    <span className="text-xs px-1 font-medium min-w-[1.5rem] text-center">{item.quantity}</span>
                                                    <button
                                                        onClick={() => updateQuantity(item.tiffinId, item.quantity + 1)}
                                                        className="px-2 py-0.5 text-orange-500 hover:bg-orange-50 dark:hover:bg-gray-800 transition-colors"
                                                    >
                                                        <Plus className="w-3 h-3" />
                                                    </button>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>

                                {/* Itemized Breakdown */}
                                <div className="space-y-3 pt-6 border-t border-dashed border-gray-200 dark:border-gray-700 text-sm">
                                    <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                        <span>Item Total</span>
                                        <span>₹{itemTotal}</span>
                                    </div>
                                    <div className="flex justify-between text-gray-500 dark:text-gray-400">
                                        <span>Delivery Fee</span>
                                        <span className="text-green-600 dark:text-green-400 font-semibold">FREE</span>
                                    </div>
                                </div>

                                {/* Total and Action */}
                                <div className="flex justify-between items-center mt-6 pt-6 border-t border-gray-200 dark:border-gray-700">
                                    <div>
                                        <span className="text-xs text-gray-500 dark:text-gray-400 uppercase font-semibold tracking-wider">To Pay</span>
                                        <h3 className="text-2xl font-bold text-orange-500 flex items-center">
                                            <IndianRupee className="w-5 h-5" />
                                            {finalTotal}
                                        </h3>
                                    </div>
                                </div>

                                {error && (
                                    <div className="mt-4 p-3 bg-red-50 border border-red-200 text-red-600 text-sm rounded-xl">
                                        {error}
                                    </div>
                                )}

                                <button
                                    onClick={placeOrder}
                                    disabled={isPlacingOrder || !selectedAddressId}
                                    className="w-full mt-6 bg-orange-500 hover:bg-orange-600 disabled:bg-orange-300 text-white font-semibold py-4 rounded-xl shadow-lg shadow-orange-500/40 transition-all transform active:scale-[0.98] flex justify-between items-center px-6 group relative overflow-hidden"
                                >
                                    <div className="absolute inset-0 bg-gradient-to-t from-black/10 to-transparent pointer-events-none"></div>
                                    <div className="absolute top-0 left-0 w-full h-1/2 bg-gradient-to-b from-white/10 to-transparent pointer-events-none"></div>

                                    <span className="relative z-10 flex items-center gap-2">
                                        {isPlacingOrder && <Loader2 className="w-4 h-4 animate-spin" />}
                                        {isPlacingOrder ? 'Processing...' : 'Place Order'}
                                    </span>
                                    <span className="relative z-10 flex items-center gap-1 group-hover:translate-x-1 transition-transform">
                                        ₹{finalTotal}
                                        <ChevronRight className="w-5 h-5" />
                                    </span>
                                </button>

                                <div className="mt-4 flex items-center justify-center gap-2 text-xs text-gray-500 dark:text-gray-400">
                                    <Lock className="w-4 h-4" />
                                    Secure & Safe Payment
                                </div>
                            </div>

                            {/* Coupon Code mock */}
                            <div className="mt-6 bg-white dark:bg-gray-800 rounded-xl p-4 border border-dashed border-gray-300 dark:border-gray-600 flex items-center justify-between cursor-pointer hover:border-orange-500 transition-colors group">
                                <div className="flex items-center gap-3">
                                    <Tag className="w-5 h-5 text-orange-500 group-hover:scale-110 transition-transform" />
                                    <span className="text-sm font-medium">Apply Coupon</span>
                                </div>
                                <ChevronRight className="w-5 h-5 text-gray-400 group-hover:text-orange-500" />
                            </div>
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
                <div className="min-h-screen flex items-center justify-center bg-[#FDFBF7]">
                    <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
                </div>
            }
        >
            <CheckoutContent />
        </Suspense>
    );
}
