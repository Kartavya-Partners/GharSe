"use client";

import { useEffect } from "react";
import { MapContainer, TileLayer, Marker, Popup, Circle, useMap } from "react-leaflet";
import L from "leaflet";
import Link from "next/link";
import { ChefHat, Navigation, MapPin, Star, Clock, UtensilsCrossed, IndianRupee } from "lucide-react";

// Custom SVG marker icons
const createSvgIcon = (color: string, size: number = 36) => {
    const svgHtml = `
        <svg width="${size}" height="${size + 12}" viewBox="0 0 36 48" xmlns="http://www.w3.org/2000/svg">
            <path d="M18 0C8.06 0 0 8.06 0 18c0 13.5 18 30 18 30s18-16.5 18-30C36 8.06 27.94 0 18 0z" fill="${color}" stroke="white" stroke-width="2"/>
            <circle cx="18" cy="18" r="10" fill="white" opacity="0.9"/>
            <text x="18" y="23" text-anchor="middle" font-family="Arial" font-weight="bold" font-size="14" fill="${color}">🍳</text>
        </svg>
    `;
    return L.divIcon({
        html: svgHtml,
        className: "custom-marker",
        iconSize: [size, size + 12],
        iconAnchor: [size / 2, size + 12],
        popupAnchor: [0, -(size + 6)],
    });
};

// User location pulsing dot
const userPulseIcon = L.divIcon({
    html: `
        <div style="position:relative;width:20px;height:20px;">
            <div style="width:20px;height:20px;background:#3B82F6;border:3px solid white;border-radius:50%;box-shadow:0 0 0 0 rgba(59,130,246,0.4);animation:pulse-ring 2s ease-out infinite;position:absolute;"></div>
            <div style="width:10px;height:10px;background:#3B82F6;border-radius:50%;position:absolute;top:5px;left:5px;"></div>
        </div>
        <style>
            @keyframes pulse-ring {
                0% { box-shadow: 0 0 0 0 rgba(59,130,246,0.5); }
                100% { box-shadow: 0 0 0 20px rgba(59,130,246,0); }
            }
        </style>
    `,
    className: "user-pulse-icon",
    iconSize: [20, 20],
    iconAnchor: [10, 10],
    popupAnchor: [0, -10],
});

// Kitchen marker
const kitchenMarkerIcon = createSvgIcon("#F97316", 32);
const kitchenHighlightIcon = createSvgIcon("#EF4444", 38);

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
    radiusKm?: number;
}

// Component to recenter map when user location changes
function MapCenterController({ center }: { center: [number, number] }) {
    const map = useMap();

    useEffect(() => {
        map.setView(center, 13);
    }, [center, map]);

    return null;
}

export default function KitchenMap({ kitchens, userLocation, radiusKm = 12 }: KitchenMapProps) {
    // Default center (Mumbai) if no user location
    const defaultCenter: [number, number] = [19.076, 72.8777];
    const center: [number, number] = userLocation
        ? [userLocation.lat, userLocation.lng]
        : defaultCenter;

    return (
        <div className="w-full h-[500px] rounded-2xl overflow-hidden border border-gray-200 shadow-lg relative">
            <MapContainer
                center={center}
                zoom={13}
                scrollWheelZoom={true}
                className="w-full h-full"
                zoomControl={false}
            >
                {/* CartoDB Voyager — clean Google Maps-like tile layer */}
                <TileLayer
                    attribution='&copy; <a href="https://carto.com/attributions">CARTO</a> &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                <MapCenterController center={center} />

                {/* Radius circle */}
                {userLocation && (
                    <Circle
                        center={[userLocation.lat, userLocation.lng]}
                        radius={radiusKm * 1000}
                        pathOptions={{
                            color: "#F97316",
                            fillColor: "#F97316",
                            fillOpacity: 0.06,
                            weight: 2,
                            dashArray: "8 4",
                        }}
                    />
                )}

                {/* User location marker */}
                {userLocation && (
                    <Marker position={[userLocation.lat, userLocation.lng]} icon={userPulseIcon}>
                        <Popup>
                            <div className="text-center p-2">
                                <div className="flex items-center justify-center gap-1 text-blue-600 font-semibold mb-1">
                                    <Navigation className="w-4 h-4" />
                                    Your Location
                                </div>
                                <p className="text-xs text-gray-500">
                                    Showing chefs within {radiusKm} km
                                </p>
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
                            icon={kitchenMarkerIcon}
                        >
                            <Popup>
                                <div className="min-w-[220px] p-2">
                                    {/* Header */}
                                    <div className="flex items-center gap-3 mb-3">
                                        <div className="w-10 h-10 bg-orange-100 rounded-xl flex items-center justify-center flex-shrink-0">
                                            <ChefHat className="w-5 h-5 text-orange-600" />
                                        </div>
                                        <div>
                                            <h3 className="font-bold text-gray-900 text-sm">
                                                {kitchen.name}
                                            </h3>
                                            {kitchen.distance !== null && kitchen.distance !== undefined && (
                                                <span className="text-xs text-orange-600 font-medium flex items-center gap-1">
                                                    <Navigation className="w-3 h-3" />
                                                    {kitchen.distance} km away
                                                </span>
                                            )}
                                        </div>
                                    </div>

                                    {/* Stats */}
                                    <div className="flex items-center gap-3 mb-3 text-xs text-gray-600">
                                        {kitchen.address?.city && (
                                            <div className="flex items-center gap-1">
                                                <MapPin className="w-3 h-3 text-gray-400" />
                                                {kitchen.address.city}
                                            </div>
                                        )}
                                        <span>•</span>
                                        <div className="flex items-center gap-1">
                                            <UtensilsCrossed className="w-3 h-3" />
                                            {kitchen.tiffinCount} meals
                                        </div>
                                    </div>

                                    {/* Price */}
                                    <div className="flex items-center justify-between mb-3 py-2 px-3 bg-gray-50 rounded-lg">
                                        <span className="text-xs text-gray-500">Average price</span>
                                        <span className="font-bold text-gray-900 flex items-center">
                                            <IndianRupee className="w-3.5 h-3.5" />
                                            {kitchen.avgPrice}
                                        </span>
                                    </div>

                                    {/* CTA */}
                                    <Link
                                        href={`/kitchens/${kitchen._id}`}
                                        className="block w-full text-center py-2.5 bg-gradient-to-r from-orange-500 to-red-500 text-white text-sm font-semibold rounded-xl hover:from-orange-600 hover:to-red-600 transition-all shadow-md shadow-orange-500/20"
                                    >
                                        View Kitchen & Order
                                    </Link>
                                </div>
                            </Popup>
                        </Marker>
                    );
                })}
            </MapContainer>

            {/* Radius badge overlay */}
            {userLocation && (
                <div className="absolute bottom-4 left-4 bg-white/90 backdrop-blur-sm px-3 py-1.5 rounded-full shadow-md text-xs font-medium text-gray-700 flex items-center gap-1.5 z-[1000]">
                    <div className="w-2 h-2 bg-orange-500 rounded-full animate-pulse" />
                    {radiusKm} km radius • {kitchens.length} chefs found
                </div>
            )}
        </div>
    );
}
