"use client";

import { MapContainer, TileLayer, Marker, Popup, Polyline } from "react-leaflet";
import L from "leaflet";
import { ChefHat, MapPin, Navigation } from "lucide-react";

// Chef marker
const chefIcon = L.divIcon({
    html: `
        <div style="width:32px;height:32px;background:#F97316;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
            <span style="font-size:16px;">👨‍🍳</span>
        </div>
    `,
    className: "chef-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
});

// Delivery marker
const deliveryIcon = L.divIcon({
    html: `
        <div style="width:32px;height:32px;background:#3B82F6;border:2px solid white;border-radius:50%;display:flex;align-items:center;justify-content:center;box-shadow:0 2px 8px rgba(0,0,0,0.2);">
            <span style="font-size:16px;">📍</span>
        </div>
    `,
    className: "delivery-marker",
    iconSize: [32, 32],
    iconAnchor: [16, 16],
    popupAnchor: [0, -16],
});

interface DeliveryMapProps {
    providerLocation: { lat: number; lng: number };
    deliveryLocation: { lat: number; lng: number } | null;
    providerName: string;
}

export default function DeliveryMap({ providerLocation, deliveryLocation, providerName }: DeliveryMapProps) {
    const center: [number, number] = providerLocation
        ? [providerLocation.lat, providerLocation.lng]
        : [19.076, 72.8777];

    const positions: [number, number][] = [];
    if (providerLocation) positions.push([providerLocation.lat, providerLocation.lng]);
    if (deliveryLocation) positions.push([deliveryLocation.lat, deliveryLocation.lng]);

    return (
        <div className="w-full h-[200px] rounded-xl overflow-hidden border border-gray-200">
            <MapContainer
                center={center}
                zoom={deliveryLocation ? 12 : 14}
                scrollWheelZoom={false}
                dragging={false}
                zoomControl={false}
                className="w-full h-full"
            >
                <TileLayer
                    attribution='&copy; <a href="https://carto.com">CARTO</a>'
                    url="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
                />

                {/* Provider marker */}
                <Marker position={[providerLocation.lat, providerLocation.lng]} icon={chefIcon}>
                    <Popup>
                        <div className="text-center text-sm font-medium">{providerName}&apos;s Kitchen</div>
                    </Popup>
                </Marker>

                {/* Delivery marker */}
                {deliveryLocation && (
                    <Marker position={[deliveryLocation.lat, deliveryLocation.lng]} icon={deliveryIcon}>
                        <Popup>
                            <div className="text-center text-sm font-medium">Your Delivery Location</div>
                        </Popup>
                    </Marker>
                )}

                {/* Route line */}
                {positions.length === 2 && (
                    <Polyline
                        positions={positions}
                        pathOptions={{
                            color: "#F97316",
                            weight: 3,
                            dashArray: "8 6",
                            opacity: 0.8,
                        }}
                    />
                )}
            </MapContainer>
        </div>
    );
}
