"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { ChefHat, Navigation, MapPin } from "lucide-react";

// Fix for default marker icons in Next.js
const userIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-blue.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

const kitchenIcon = new L.Icon({
    iconUrl: "https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-orange.png",
    shadowUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
});

interface Kitchen {
    _id: string;
    name: string;
    address?: {
        street?: string;
        city?: string;
        coordinates?: {
            lat: number;
            lng: number;
        };
    };
    tiffinCount: number;
    avgPrice: number;
    distance?: number | null;
}

interface KitchenMapProps {
    kitchens: Kitchen[];
    userLocation: { lat: number; lng: number } | null;
}

// Component to recenter map when user location changes
function MapCenterController({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, 13);
    }, [center, map]);

    return null;
}

export default function KitchenMap({ kitchens, userLocation }: KitchenMapProps) {
    // Default center (Mumbai) if no user location
    const defaultCenter: [number, number] = [19.076, 72.8777];
    const center: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : defaultCenter;

    return (
        <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
                    url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
                />

                <MapCenterController center={center} />

                {/* User location marker */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userIcon}>
                        <Popup>
                            <div className="text-center p-1">
                                <div className="flex items-center justify-center gap-1 text-blue-600 font-semibold mb-1">
                                    <Navigation className="w-4 h-4" />
                                    Your Location
                                </div>
                            </div>
                        </Popup>
                    </Marker>
                )}

                {/* Kitchen markers */}
                {kitchens.map((kitchen) => {
                    const coords = kitchen.address?.coordinates;
                    if (!coords?.lat || !coords?.lng) return null;

                    return (
                        <Marker
                            key={kitchen._id}
                            position={[coords.lat, coords.lng]}
                            icon={kitchenIcon}
                        >
                            <Popup>
                                <div className="min-w-[180px] p-1">
                                    <div className="flex items-center gap-2 mb-2">
                                        <div className="w-8 h-8 bg-orange-100 rounded-full flex items-center justify-center">
                                            <ChefHat className="w-4 h-4 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-semibold text-gray-900 text-sm">
                                                {kitchen.name}
                                            </h3>
                                            {kitchen.distance !== null && kitchen.distance !== undefined && (
                                                <span className="text-xs text-orange-600 font-medium">
                                                    {kitchen.distance} km away
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    <div className="text-xs text-gray-600 mb-2">
                                        {kitchen.address?.city && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3" />
                                                {kitchen.address.city}
                                            </div>
                                        )}
                                        <div className="mt-1">
                                            {kitchen.tiffinCount} items • Avg ₹{kitchen.avgPrice}
                                        </div>
                                    </div>

                                    <Link
                                        href={`/kitchens/${kitchen._id}`}
                                        className="block w-full text-center py-1.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-xs font-medium rounded-lg hover:from-orange-600 hover:to-red-600 transition-all"
                                    >
                                        View Kitchen
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>
        </div>
    );
}
