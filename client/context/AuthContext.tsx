"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";
import axios from "axios";
import { useRouter } from "next/navigation";

// Types
interface User {
    _id: string;
    name: string;
    email: string;
    role: "customer" | "provider";
    token: string;
}

interface AuthContextType {
    user: User | null;
    isLoading: boolean;
    login: (email: string, password: string) => Promise<void>;
    register: (data: RegisterData) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
}

interface RegisterData {
    name: string;
    email: string;
    password: string;
    role: "customer" | "provider";
    address?: {
        street: string;
        city: string;
        state: string;
        pincode: string;
        coordinates?: { lat: number; lng: number };
    };
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// API base URL
const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:8000/api";

// Configure axios defaults
axios.defaults.baseURL = API_URL;

export function AuthProvider({ children }: { children: ReactNode }) {
    const [user, setUser] = useState<User | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const router = useRouter();

    // Load user from localStorage on mount
    useEffect(() => {
        const loadUser = () => {
            try {
                const storedUser = localStorage.getItem("user");
                const storedToken = localStorage.getItem("token");

                if (storedUser && storedToken) {
                    const parsedUser = JSON.parse(storedUser);
                    setUser({ ...parsedUser, token: storedToken });

                    // Set axios default header
                    axios.defaults.headers.common["Authorization"] = `Bearer ${storedToken}`;
                }
            } catch (error) {
                console.error("Error loading user from storage:", error);
                localStorage.removeItem("user");
                localStorage.removeItem("token");
            } finally {
                setIsLoading(false);
            }
        };

        loadUser();
    }, []);

    // Login function
    const login = async (email: string, password: string) => {
        const response = await axios.post("/auth/login", { email, password });
        const userData = response.data;

        // Store in localStorage
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Set axios header
        axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;

        // Update state
        setUser(userData);

        // Redirect based on role
        if (userData.role === "provider") {
            router.push("/dashboard/provider/orders");
        } else {
            router.push("/explore");
        }
    };

    // Register function
    const register = async (data: RegisterData) => {
        const response = await axios.post("/auth/register", data);
        const userData = response.data;

        // Store in localStorage
        localStorage.setItem("token", userData.token);
        localStorage.setItem("user", JSON.stringify(userData));

        // Set axios header
        axios.defaults.headers.common["Authorization"] = `Bearer ${userData.token}`;

        // Update state
        setUser(userData);

        // Redirect based on role
        if (userData.role === "provider") {
            router.push("/dashboard/provider/orders");
        } else {
            router.push("/explore");
        }
    };

    // Logout function
    const logout = () => {
        localStorage.removeItem("token");
        localStorage.removeItem("user");
        delete axios.defaults.headers.common["Authorization"];
        setUser(null);
        router.push("/");
    };

    const value: AuthContextType = {
        user,
        isLoading,
        login,
        register,
        logout,
        isAuthenticated: !!user,
    };

    return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook to use auth context
export function useAuth() {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error("useAuth must be used within an AuthProvider");
    }
    return context;
}
