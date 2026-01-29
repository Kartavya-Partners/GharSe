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
            <div className="min-h-screen flex items-center justify-center bg-[var(--color-warm-white)]">
                <Loader2 className="w-8 h-8 animate-spin text-orange-500" />
            </div>
        );
    }

    return (
        <div className="min-h-screen flex">
            {/* ========== LEFT PANEL - Decorative ========== */}
            <div
                className={`hidden lg:flex lg:w-1/2 relative overflow-hidden ${isProvider
                    ? "bg-gradient-to-br from-green-500 via-emerald-500 to-teal-600"
                    : "bg-gradient-to-br from-orange-500 via-red-500 to-rose-500"
                    }`}
            >
                {/* Decorative Blobs */}
                <div className="absolute top-0 left-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute bottom-0 right-0 w-96 h-96 bg-white/10 rounded-full blur-3xl" />
                <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-72 h-72 bg-white/5 rounded-full blur-2xl" />

                {/* Content */}
                <div className="relative z-10 flex flex-col justify-between p-12 w-full">
                    {/* Logo */}
                    <Link href="/" className="flex items-center text-white group">
                        <Image
                            src="/logo.png"
                            alt="GharSe"
                            width={80}
                            height={80}
                            className="h-16 w-auto"
                        />
                    </Link>

                    {/* Center Illustration */}
                    <div className="flex-1 flex items-center justify-center py-12">
                        <motion.div
                            initial={{ opacity: 0, scale: 0.9 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ duration: 0.5 }}
                            className="relative"
                        >
                            <div className="absolute inset-0 bg-white/10 rounded-3xl blur-xl" />
                            <div className="relative bg-white/10 backdrop-blur-sm rounded-3xl p-4 border border-white/20">
                                <Image
                                    src={isProvider ? "/auth-provider.png" : "/auth-customer.png"}
                                    alt={isProvider ? "Provider" : "Customer"}
                                    width={400}
                                    height={400}
                                    className="rounded-2xl"
                                />
                            </div>
                        </motion.div>
                    </div>

                    {/* Bottom Text */}
                    <div className="text-white">
                        <h2 className="text-3xl font-bold mb-3">
                            {isProvider
                                ? "Turn your kitchen into a business"
                                : "Craving homemade food?"}
                        </h2>
                        <p className="text-white/80 text-lg">
                            {isProvider
                                ? "Join thousands of home chefs earning from their passion for cooking."
                                : "Discover trusted home chefs in your neighborhood serving fresh, hygienic meals daily."}
                        </p>
                    </div>
                </div>
            </div>

            {/* ========== RIGHT PANEL - Form ========== */}
            <div className="flex-1 flex flex-col bg-[var(--color-warm-white)]">
                {/* Mobile Header */}
                <div className="lg:hidden flex items-center justify-between p-4 border-b bg-white/80 backdrop-blur sticky top-0 z-10">
                    <Link href="/" className="flex items-center">
                        <Image
                            src="/logo.png"
                            alt="GharSe"
                            width={72}
                            height={72}
                            className="h-12 w-auto"
                        />
                    </Link>
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
                            className="hidden lg:inline-flex items-center gap-2 text-gray-500 hover:text-gray-700 transition-colors mb-8 group"
                        >
                            <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                            <span>Back to home</span>
                        </Link>

                        {/* Header */}
                        <div className="text-center lg:text-left mb-8">
                            <div
                                className={`inline-flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium mb-4 ${isProvider
                                    ? "bg-green-100 text-green-700"
                                    : "bg-orange-100 text-orange-700"
                                    }`}
                            >
                                {isProvider ? (
                                    <ChefHat className="w-4 h-4" />
                                ) : (
                                    <ShoppingBag className="w-4 h-4" />
                                )}
                                <span>{isProvider ? "Provider" : "Customer"} Account</span>
                            </div>

                            <h1 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-2">
                                {isLogin ? "Welcome back!" : "Create account"}
                            </h1>
                            <p className="text-gray-600">
                                {isLogin
                                    ? "Sign in to continue to your account"
                                    : isProvider
                                        ? "Start your journey as a home chef"
                                        : "Quick signup - takes less than a minute"}
                            </p>
                        </div>

                        {/* Role Switcher */}
                        <div className="flex p-1.5 bg-gray-100 rounded-xl mb-8">
                            <button
                                type="button"
                                onClick={() => setRole("customer")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${role === "customer"
                                    ? "bg-white text-gray-900 shadow-md"
                                    : "text-gray-500 hover:text-gray-700"
                                    }`}
                            >
                                <ShoppingBag className="w-4 h-4" />
                                Customer
                            </button>
                            <button
                                type="button"
                                onClick={() => setRole("provider")}
                                className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-lg text-sm font-semibold transition-all ${role === "provider"
                                    ? "bg-white text-gray-900 shadow-md"
                                    : "text-gray-500 hover:text-gray-700"
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
                                        className="p-4 bg-red-50 border border-red-200 rounded-xl flex items-start gap-3"
                                    >
                                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
                                        <span className="text-sm text-red-700">{error}</span>
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
                                        <Label htmlFor="name" className="text-gray-700 font-medium">
                                            Full Name
                                        </Label>
                                        <div className="relative">
                                            <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                            <Input
                                                id="name"
                                                name="name"
                                                placeholder="Enter your full name"
                                                required={!isLogin}
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="h-12 pl-12 bg-white border-gray-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl"
                                            />
                                        </div>
                                    </motion.div>
                                )}
                            </AnimatePresence>

                            {/* Email Field */}
                            <div className="space-y-2">
                                <Label htmlFor="email" className="text-gray-700 font-medium">
                                    Email Address
                                </Label>
                                <div className="relative">
                                    <Mail className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="email"
                                        name="email"
                                        type="email"
                                        placeholder="you@example.com"
                                        required
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="h-12 pl-12 bg-white border-gray-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl"
                                    />
                                </div>
                            </div>

                            {/* Password Field */}
                            <div className="space-y-2">
                                <div className="flex items-center justify-between">
                                    <Label
                                        htmlFor="password"
                                        className="text-gray-700 font-medium"
                                    >
                                        Password
                                    </Label>
                                    {isLogin && (
                                        <button
                                            type="button"
                                            className={`text-sm font-medium ${isProvider
                                                ? "text-green-600 hover:text-green-700"
                                                : "text-orange-600 hover:text-orange-700"
                                                }`}
                                        >
                                            Forgot password?
                                        </button>
                                    )}
                                </div>
                                <div className="relative">
                                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                    <Input
                                        id="password"
                                        name="password"
                                        type={showPassword ? "text" : "password"}
                                        placeholder="••••••••"
                                        required
                                        value={formData.password}
                                        onChange={handleChange}
                                        className="h-12 pl-12 pr-12 bg-white border-gray-200 focus:border-orange-400 focus:ring-orange-400 rounded-xl"
                                    />
                                    <button
                                        type="button"
                                        onClick={() => setShowPassword(!showPassword)}
                                        className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                                    >
                                        {showPassword ? (
                                            <EyeOff className="w-5 h-5" />
                                        ) : (
                                            <Eye className="w-5 h-5" />
                                        )}
                                    </button>
                                </div>
                                {!isLogin && (
                                    <p className="text-xs text-gray-500">
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
                                        <div className="flex items-center gap-2 text-gray-700">
                                            <MapPin className="w-4 h-4 text-green-600" />
                                            <span className="font-semibold text-sm">
                                                Kitchen Location
                                            </span>
                                        </div>

                                        <div className="space-y-2">
                                            <Label
                                                htmlFor="street"
                                                className="text-gray-700 font-medium"
                                            >
                                                Street Address
                                            </Label>
                                            <div className="relative">
                                                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                <Input
                                                    id="street"
                                                    name="street"
                                                    placeholder="House no., Street name"
                                                    required={!isLogin && isProvider}
                                                    value={formData.street}
                                                    onChange={handleChange}
                                                    className="h-12 pl-12 bg-white border-gray-200 rounded-xl"
                                                />
                                            </div>
                                        </div>

                                        <div className="grid grid-cols-2 gap-4">
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="city"
                                                    className="text-gray-700 font-medium"
                                                >
                                                    City
                                                </Label>
                                                <div className="relative">
                                                    <Building2 className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        id="city"
                                                        name="city"
                                                        placeholder="Mumbai"
                                                        required={!isLogin && isProvider}
                                                        value={formData.city}
                                                        onChange={handleChange}
                                                        className="h-12 pl-12 bg-white border-gray-200 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                            <div className="space-y-2">
                                                <Label
                                                    htmlFor="pincode"
                                                    className="text-gray-700 font-medium"
                                                >
                                                    Pincode
                                                </Label>
                                                <div className="relative">
                                                    <Hash className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-gray-400" />
                                                    <Input
                                                        id="pincode"
                                                        name="pincode"
                                                        placeholder="400001"
                                                        required={!isLogin && isProvider}
                                                        value={formData.pincode}
                                                        onChange={handleChange}
                                                        className="h-12 pl-12 bg-white border-gray-200 rounded-xl"
                                                    />
                                                </div>
                                            </div>
                                        </div>

                                        {/* GPS Location Capture */}
                                        <div className="space-y-3 pt-2">
                                            <Label className="text-gray-700 font-medium flex items-center gap-2">
                                                <Crosshair className="w-4 h-4 text-green-600" />
                                                GPS Location
                                            </Label>
                                            <button
                                                type="button"
                                                onClick={getLocation}
                                                disabled={isGettingLocation}
                                                className={`w-full h-12 flex items-center justify-center gap-2 rounded-xl border-2 border-dashed transition-all ${coordinates
                                                    ? "border-green-500 bg-green-50 text-green-700"
                                                    : "border-gray-300 hover:border-green-400 hover:bg-green-50 text-gray-600"
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
                                                <p className="text-xs text-red-500 flex items-center gap-1">
                                                    <AlertCircle className="w-3 h-3" />
                                                    {locationError}
                                                </p>
                                            )}
                                            <p className="text-xs text-gray-500">
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
                                className={`w-full h-13 text-base font-semibold rounded-xl shadow-lg transition-all hover:-translate-y-0.5 ${isProvider
                                    ? "bg-gradient-to-r from-green-500 to-emerald-600 hover:from-green-600 hover:to-emerald-700"
                                    : "bg-gradient-to-r from-orange-500 to-red-500 hover:from-orange-600 hover:to-red-600"
                                    } disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:translate-y-0`}
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
                                            <div className="w-full border-t border-gray-200" />
                                        </div>
                                        <div className="relative flex justify-center text-sm">
                                            <span className="px-4 bg-[var(--color-warm-white)] text-gray-500">
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
                                                theme="outline"
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
                            <p className="text-gray-600">
                                {isLogin ? "Don't have an account?" : "Already have an account?"}{" "}
                                <button
                                    type="button"
                                    onClick={toggleMode}
                                    className={`font-semibold ${isProvider
                                        ? "text-green-600 hover:text-green-700"
                                        : "text-orange-600 hover:text-orange-700"
                                        }`}
                                >
                                    {isLogin ? "Sign up" : "Sign in"}
                                </button>
                            </p>
                        </div>

                        {/* Trust Badge */}
                        <div className="mt-8 text-center">
                            <p className="text-xs text-gray-400 flex items-center justify-center gap-1">
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
                <div className="min-h-screen flex items-center justify-center bg-[var(--color-warm-white)]">
                    <div className="flex items-center gap-3">
                        <Loader2 className="w-6 h-6 animate-spin text-orange-500" />
                        <span className="text-gray-600">Loading...</span>
                    </div>
                </div>
            }
        >
            <LoginForm />
        </Suspense>
    );
}
