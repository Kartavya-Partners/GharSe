"use client";

import { Suspense, useState, useEffect } from "react";
import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import axios from "axios";
import { GoogleLogin, CredentialResponse } from "@react-oauth/google";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/context/AuthContext";
import {
    ChefHat,
    ShoppingBag,
    Loader2,
    AlertCircle,
    ArrowLeft,
    Eye,
    EyeOff,
    Mail,
    Lock,
    User,
    MapPin,
    Building2,
    Hash,
    Sparkles,
    UtensilsCrossed,
    Crosshair,
    CheckCircle2,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";

function LoginForm() {
    const searchParams = useSearchParams();
    const { login, register, isAuthenticated, isLoading: authLoading } = useAuth();

    const initialRole =
        searchParams.get("role") === "provider" ? "provider" : "customer";

    const [role, setRole] = useState<"customer" | "provider">(initialRole);
    const [isLogin, setIsLogin] = useState(true);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState("");
    const [showPassword, setShowPassword] = useState(false);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        password: "",
        street: "",
        city: "",
        pincode: "",
    });

    // GPS Location state
    const [coordinates, setCoordinates] = useState<{ lat: number; lng: number } | null>(null);
    const [isGettingLocation, setIsGettingLocation] = useState(false);
    const [locationError, setLocationError] = useState("");
    const [isGoogleLoading, setIsGoogleLoading] = useState(false);

    // Handle Google OAuth login
    const handleGoogleLogin = async (credentialResponse: CredentialResponse) => {
        if (!credentialResponse.credential) {
            setError("Google login failed. Please try again.");
            return;
        }

        setIsGoogleLoading(true);
        setError("");

        try {
            const response = await axios.post("/auth/google", {
                credential: credentialResponse.credential,
            });

            const userData = response.data;

            // Store both token and user data (same as regular login)
            localStorage.setItem("token", userData.token);
            localStorage.setItem("user", JSON.stringify(userData));

            // Set axios header for subsequent requests
            axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;

            // Redirect to explore page
            window.location.href = "/explore";
        } catch (err: unknown) {
            console.error("Google login error:", err);
            if (axios.isAxiosError(err) && err.response?.data?.message) {
                setError(err.response.data.message);
            } else {
                setError("Failed to login with Google. Please try again.");
            }
        } finally {
            setIsGoogleLoading(false);
        }
    };

    // Get current location using GPS
    const getLocation = () => {
        if (!navigator.geolocation) {
            setLocationError("Geolocation is not supported by your browser");
            return;
        }

        setIsGettingLocation(true);
        setLocationError("");

        navigator.geolocation.getCurrentPosition(
            (position) => {
                setCoordinates({
                    lat: position.coords.latitude,
                    lng: position.coords.longitude,
                });
                setIsGettingLocation(false);
            },
            (err) => {
                console.error("Geolocation error:", err);
                let errorMessage = "Unable to get your location";
                switch (err.code) {
                    case err.PERMISSION_DENIED:
                        errorMessage = "Location permission denied. Please enable location access.";
                        break;
                    case err.POSITION_UNAVAILABLE:
                        errorMessage = "Location information unavailable";
                        break;
                    case err.TIMEOUT:
                        errorMessage = "Location request timed out";
                        break;
                }
                setLocationError(errorMessage);
                setIsGettingLocation(false);
            },
            {
                enableHighAccuracy: true,
                timeout: 10000,
                maximumAge: 0,
            }
        );
    };

    useEffect(() => {
        const roleParam = searchParams.get("role");
        if (roleParam === "provider") setRole("provider");
        else if (roleParam === "customer") setRole("customer");
    }, [searchParams]);

    const toggleMode = () => {
        setIsLogin(!isLogin);
        setError("");
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsLoading(true);
        setError("");

        try {
            if (isLogin) {
                await login(formData.email, formData.password);
            } else {
                // Registration
                const registerData: {
                    name: string;
                    email: string;
                    password: string;
                    role: "customer" | "provider";
                    address?: {
                        street: string;
                        city: string;
                        state: string;
                        pincode: string;
                        coordinates: { lat: number; lng: number };
                    };
                } = {
                    name: formData.name,
                    email: formData.email,
                    password: formData.password,
                    role: role,
                };

                // Only add address for providers
                if (role === "provider") {
                    registerData.address = {
                        street: formData.street,
                        city: formData.city,
                        state: "State",
                        pincode: formData.pincode,
                        coordinates: coordinates || { lat: 0, lng: 0 },
                    };
                }

                await register(registerData);
            }
        } catch (err: unknown) {
            console.error(err);
            const axiosErr = err as { response?: { data?: { message?: string } } };
            setError(
                axiosErr.response?.data?.message ||
                "Something went wrong. Please try again."
            );
        } finally {
            setIsLoading(false);
        }
    };

    const isProvider = role === "provider";

    // Show loading while checking auth
    if (authLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-[#0f1a15]">
                <Loader2 className="w-8 h-8 animate-spin text-teal-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex bg-[#0f1a15]">
            {/* ========== LEFT PANEL - Dark Decorative ========== */}
            <div className="hidden lg:flex lg:w-1/2 relative overflow-hidden bg-[#0d1a14]">
                {/* Background gradient blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-teal-600/10 rounded-full blur-3xl" />
                <div className="absolute top-1/3 right-1/4 w-72 h-72 bg-emerald-500/5 rounded-full blur-2xl" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-teal-600 p-1.5 rounded-lg">
                            <ChefHat className="w-5 h-5 text-white" />
                        </div>
                        <span className="text-xl font-bold text-white">GharSe</span>
                    </Link>

                    {/* Center Content */}
                    <div className="flex-1 flex flex-col items-center justify-center py-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative w-full max-w-md"
                        >
                            {/* Badge */}
                            <div className="inline-flex items-center gap-2 px-4 py-2 bg-teal-500/10 border border-teal-500/20 rounded-full text-sm text-teal-400 font-medium mb-6">
                                {isProvider ? (
                                    <>
                                        <ChefHat className="w-4 h-4" />
                                        Chef Partner Program
                                    </>
                                ) : (
                                    <>
                                        <ShoppingBag className="w-4 h-4" />
                                        Homemade Meals Delivered
                                    </>
                                )}
                            </div>

                            <h2 className="text-4xl font-extrabold text-white mb-4 tracking-tight leading-tight">
                                {isProvider
                                    ? "Turn your kitchen into a thriving business."
                                    : "Craving fresh, homemade food?"}
                            </h2>
                            <p className="text-gray-400 text-lg leading-relaxed mb-8">
                                {isProvider
                                    ? "Join over 5,000 home chefs already earning from their passion for cooking."
                                    : "Discover trusted home chefs in your neighborhood serving hygienic meals daily."}
                            </p>

                            {/* Trust Avatars */}
                            <div className="flex items-center gap-3">
                                <div className="flex -space-x-2">
                                    {[
                                        "bg-gradient-to-br from-amber-300 to-orange-400",
                                        "bg-gradient-to-br from-teal-300 to-emerald-400",
                                        "bg-gradient-to-br from-violet-300 to-purple-400",
                                        "bg-gradient-to-br from-rose-300 to-pink-400",
                                    ].map((bg, i) => (
                                        <div key={i} className={`w-9 h-9 rounded-full ${bg} border-2 border-[#0d1a14] flex items-center justify-center text-white text-xs font-bold`}>
                                            {["S", "A", "R", "P"][i]}
                                        </div>
                                    ))}
                                </div>
                                <span className="text-sm text-gray-500">Trusted by top home chefs</span>
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom / App links */}
                    <div className="text-gray-600 text-sm">
                        Â© 2025 GharSe. All rights reserved.
                    </div>
                </div>
            </div>

            {/* ========== RIGHT PANEL - Dark Form ========== */}
            <div className="flex-1 flex flex-col">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b border-white/5 bg-[#0d1a14]">
                    <Link href="/" className="flex items-center gap-2">
                        <div className="bg-teal-600 p-1.5 rounded-lg">
                            <ChefHat className="w-4 h-4 text-white" />
                        </div>
                        <span className="text-lg font-bold text-white">GharSe</span>
                    </Link>
                    <Link href="/" className="text-sm text-teal-400 hover:text-teal-300">Need help?</Link>
                </div>

                {/* Form Container */}
                <div className="flex-1 flex items-center justify-center p-6 lg:p-12">
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ duration: 0.4 }}
                        className="w-full max-w-md"
                    >
                        {/* Back Link - Desktop */}
                        <Link
                            href="/"
                            className="hidden lg:inline-flex items-center gap-2 text-gray-500 hover:text-gray-300 transition-colors mb-8 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Back to home</span>
                        </Link>

                        {/* Header */}
                        <div className="text-center lg:text-left mb-8">
                            <div
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${isProvider
                                    ? "bg-teal-500/10 text-teal-400 border border-teal-500/20"
                                    : "bg-amber-500/10 text-amber-400 border border-amber-500/20"
                                    }`}
                            >
                                {isProvider ? (
                                    <ChefHat className="w-4 h-4" />
                                ) : (
                                    <ShoppingBag className="w-4 h-4" />
                                )}
                                <span>{isProvider ? "Provider" : "Customer"} Account</span>
                            </div>

                            <h1 className="text-3xl lg:text-4xl font-bold text-white mb-2">
                                {isLogin ? "Welcome back!" : isProvider ? "Become a GharSe Chef" : "Create account"}
                            </h1>
                            <p className="text-gray-500">
                                {isLogin
                                    ? "Sign in to continue to your dashboard"
                                    : isProvider
                                        ? "Start your journey as a home chef"
                                        : "Quick signup â€” takes less than a minute"}
                            </p>
                        </div>

                        {/* Role Switcher */}
                        <div className="flex p-1.5 bg-[#1a2b23] rounded-xl mb-8 border border-white/5">
                            <button
                                type="button"
                                onClick={() => setRole("customer")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${role === "customer"
                                    ? "bg-teal-600 text-white shadow-lg"
                                    : "text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Customer
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("provider")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${role === "provider"
                                    ? "bg-teal-600 text-white shadow-lg"
                                    : "text-gray-500 hover:text-gray-300"
                                    }`}
                            >
                                <ChefHat className="w-4 h-4" />
                                Provider
                            </button>
                        </div>

                        {/* Form */}
                        <form onSubmit={handleSubmit} className="space-y-5">
                            {/* Error Alert */}
                            <AnimatePresence>
                                {error && (
                                    <motion.div
                                        key="error-alert"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="p-4 bg-red-500/10 border border-red-500/20 rounded-xl flex items-start gap-3"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-red-300">{error}</span>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Name Field - Registration Only */}
                            <AnimatePresence>
                                {!isLogin && (
                                    <motion.div
                                        key="name-field"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-2"
                                    >
                                        <Label htmlFor="name" className="text-gray-300 font-medium">
                                            Full Name
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="Enter your full name"
                                                required={!isLogin}
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="h-12 pl-12 bg-[#1a2b23] border-white/10 text-white placeholder:text-gray-600 focus:border-teal-500/50 focus:ring-teal-500/30 rounded-xl"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-300 font-medium">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="h-12 pl-12 bg-[#1a2b23] border-white/10 text-white placeholder:text-gray-600 focus:border-teal-500/50 focus:ring-teal-500/30 rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-gray-300 font-medium"
                                    >
                                        Password
                                    </Label>
                                    {isLogin && (
                                        <button
                                            type="button"
                                            className="text-sm font-medium text-teal-400 hover:text-teal-300"
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="Enter your password"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="h-12 pl-12 pr-12 bg-[#1a2b23] border-white/10 text-white placeholder:text-gray-600 focus:border-teal-500/50 focus:ring-teal-500/30 rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-500 hover:text-gray-300"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {!isLogin && (
                                    <p className="text-xs text-gray-600">
                                        Must be at least 6 characters
                                    </p>
                                )}
                            </div>

                            {/* Address Fields - Provider Registration Only */}
                            <AnimatePresence>
                                {!isLogin && isProvider && (
                                    <motion.div
                                        key="address-fields"
                                        initial={{ opacity: 0, height: 0 }}
                                        animate={{ opacity: 1, height: "auto" }}
                                        exit={{ opacity: 0, height: 0 }}
                                        className="space-y-5 pt-2"
                                    >
                                        <div className="flex items-center gap-2 text-gray-300">
                                            <MapPin className="w-4 h-4 text-teal-400" />
                                            <span className="font-semibold text-sm">
                                                Kitchen Location
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="street"
                                                className="text-gray-300 font-medium"
                                            >
                                                Street Address
                                            </Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                                <Input
                                                    id="street"
                                                    name="street"
                                                    placeholder="House no., Street name"
                                                    required={!isLogin && isProvider}
                                                    value={formData.street}
                                                    onChange={handleChange}
                                                    className="h-12 pl-12 bg-[#1a2b23] border-white/10 text-white placeholder:text-gray-600 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="city"
                                                    className="text-gray-300 font-medium"
                                                >
                                                    City
                                                </Label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        placeholder="Mumbai"
                                                        required={!isLogin && isProvider}
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        className="h-12 pl-12 bg-[#1a2b23] border-white/10 text-white placeholder:text-gray-600 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="pincode"
                                                    className="text-gray-300 font-medium"
                                                >
                                                    Pincode
                                                </Label>
                                                <div className="relative">
                                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-500" />
                                                    <Input
                                                        id="pincode"
                                                        name="pincode"
                                                        placeholder="400001"
                                                        required={!isLogin && isProvider}
                                                        value={formData.pincode}
                                                        onChange={handleChange}
                                                        className="h-12 pl-12 bg-[#1a2b23] border-white/10 text-white placeholder:text-gray-600 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* GPS Location Capture */}
                                        <div className="space-y-3 pt-2">
                                            <Label className="text-gray-300 font-medium flex items-center gap-2">
                                                <Crosshair className="w-4 h-4 text-teal-400" />
                                                GPS Location
                                            </Label>
                                            <button
                                                type="button"
                                                onClick={getLocation}
                                                disabled={isGettingLocation}
                                                className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all ${coordinates
                                                    ? "border-teal-500/50 bg-teal-500/5 text-teal-400"
                                                    : "border-white/10 hover:border-teal-500/30 hover:bg-teal-500/5 text-gray-500"
                                                    }`}
                                            >
                                                {isGettingLocation ? (
                                                    <>
                                                        <Loader2 className="w-5 h-5 animate-spin" />
                                                        Getting location...
                                                    </>
                                                ) : coordinates ? (
                                                    <>
                                                        <CheckCircle2 className="w-5 h-5" />
                                                        Location captured ({coordinates.lat.toFixed(4)}, {coordinates.lng.toFixed(4)})
                                                    </>
                                                ) : (
                                                    <>
                                                        <Crosshair className="w-5 h-5" />
                                                        Click to capture your kitchen location
                                                    </>
                                                )}
                                            </button>
                                            {locationError && (
                                                <p className="text-xs text-red-400 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {locationError}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-600">
                                                This helps customers find you based on their location
                                            </p>
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Submit Button */}
                            <Button
                                type="submit"
                                disabled={isLoading}
                                className="w-full h-13 text-base font-semibold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 bg-teal-600 hover:bg-teal-700 text-white disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0"
                            >
                                {isLoading ? (
                                    <>
                                        <Loader2 className="mr-2 h-5 w-5 animate-spin" />
                                        Please wait...
                                    </>
                                ) : isLogin ? (
                                    "Sign In"
                                ) : (
                                    <>
                                        <Sparkles className="mr-2 h-5 w-5" />
                                        Create Account
                                    </>
                                )}
                            </Button>

                            {/* Google Login - Customers only */}
                            {!isProvider && (
                                <div className="mt-4">
                                    <div className="relative">
                                        <div className="absolute inset-0 flex items-center">
                                            <div className="w-full border-t border-white/10" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-[#0f1a15] text-gray-500">
                                                or continue with
                                            </span>
                                        </div>
                                    </div>
                                    <div className="mt-4 flex justify-center">
                                        {isGoogleLoading ? (
                                            <div className="flex items-center gap-2 text-gray-500">
                                                <Loader2 className="w-5 h-5 animate-spin" />
                                                <span>Signing in with Google...</span>
                                            </div>
                                        ) : (
                                            <GoogleLogin
                                                onSuccess={handleGoogleLogin}
                                                onError={() => setError("Google login failed")}
                                                theme="filled_black"
                                                size="large"
                                                text="continue_with"
                                                shape="rectangular"
                                                width="100%"
                                            />
                                        )}
                                    </div>
                                </div>
                            )}
                        </form>

                        {/* Toggle Mode */}
                        <div className="mt-8 text-center">
                            <p className="text-gray-500">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                                <button
                                    type="button"
                                    onClick={toggleMode}
                                    className="font-semibold text-teal-400 hover:text-teal-300"
                                >
                                    {isLogin ? "Sign up" : "Sign in"}
                                </button>
                            </p>
                        </div>

                        {/* Trust Badge */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-600 flex items-center justify-center gap-1">
                                <Lock className="w-3 h-3" />
                                Your data is encrypted and secure
                            </p>
                        </div>
                    </motion.div>
                </div>
            </div>
        </div>
    );
}

export default function LoginPage() {
    return (
        <Suspense
            fallback={
                <div className="min-h-screen flex items-center justify-center bg-[#0f1a15]">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-teal-500" />
                        <span className="text-gray-400">Loading...</span>
                    </div>
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}

