"use client";

import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from "react";

interface LocationData {
    lat: number;
    lng: number;
}

interface LocationContextType {
    location: LocationData | null;
    isLoading: boolean;
    error: string | null;
    requestLocation: () => Promise<LocationData | null>;
    clearLocation: () => void;
    setLocation: (location: LocationData) => void;
}

const LocationContext = createContext<LocationContextType | undefined>(undefined);

export function LocationProvider({ children }: { children: ReactNode }) {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    // Load saved location from localStorage
    useEffect(() => {
        const savedLocation = localStorage.getItem("customerLocation");
        if (savedLocation) {
            try {
                setLocation(JSON.parse(savedLocation));
            } catch (e) {
                console.error("Error parsing saved location:", e);
            }
        }
    }, []);

    // Request current location using Geolocation API
    const requestLocation = async (): Promise<LocationData | null> => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported by your browser");
            return null;
        }

        setIsLoading(true);
        setError(null);

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const locationData = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setLocation(locationData);
                    setIsLoading(false);

                    // Save for future sessions
                    localStorage.setItem("customerLocation", JSON.stringify(locationData));

                    resolve(locationData);
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

                    setError(errorMessage);
                    setIsLoading(false);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 60000, // 1 minute cache
                }
            );
        });
    };

    const clearLocation = () => {
        setLocation(null);
        localStorage.removeItem("customerLocation");
    };

    return (
        <LocationContext.Provider
            value={{
                location,
                isLoading,
                error,
                requestLocation,
                clearLocation,
                setLocation,
            }}
        >
            {children}
        </LocationContext.Provider>
    );
}

export function useLocation() {
    const context = useContext(LocationContext);
    if (context === undefined) {
        throw new Error("useLocation must be used within a LocationProvider");
    }
    return context;
}

// Utility hook for getting location on demand
export function useGetLocation() {
    const [location, setLocation] = useState<LocationData | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const getLocation = async (): Promise<LocationData | null> => {
        if (!navigator.geolocation) {
            setError("Geolocation is not supported");
            return null;
        }

        setIsLoading(true);
        setError(null);

        return new Promise((resolve) => {
            navigator.geolocation.getCurrentPosition(
                (position) => {
                    const loc = {
                        lat: position.coords.latitude,
                        lng: position.coords.longitude,
                    };
                    setLocation(loc);
                    setIsLoading(false);
                    resolve(loc);
                },
                (err) => {
                    setError(err.message);
                    setIsLoading(false);
                    resolve(null);
                },
                {
                    enableHighAccuracy: true,
                    timeout: 10000,
                    maximumAge: 0,
                }
            );
        });
    };

    return { location, isLoading, error, getLocation };
}
