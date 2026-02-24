"use client";

import { useEffect, useRef } from "react";
import L from "leaflet";
import "leaflet/dist/leaflet.css";

export interface OrderTrackingMapProps {
    providerCoords: [number, number];
    customerCoords: [number, number];
}

export default function OrderTrackingMap({ providerCoords, customerCoords }: OrderTrackingMapProps) {
    const mapRef = useRef<HTMLDivElement>(null);
    const mapInstance = useRef<L.Map | null>(null);

    useEffect(() => {
        if (typeof window === "undefined" || !mapRef.current) return;

        // Cleanup previous map instance if it exists
        if (mapInstance.current) {
            mapInstance.current.off();
            mapInstance.current.remove();
            mapInstance.current = null;
        }

        // Calculate center between provider and customer
        const centerLat = (providerCoords[0] + customerCoords[0]) / 2;
        const centerLng = (providerCoords[1] + customerCoords[1]) / 2;

        // Initialize map
        mapInstance.current = L.map(mapRef.current, {
            zoomControl: false,
            attributionControl: false,
            dragging: false,
            scrollWheelZoom: false,
            doubleClickZoom: false,
            boxZoom: false,
            keyboard: false,
            touchZoom: false
        }).setView([centerLat, centerLng], 14);

        // Add CartoDB Voyager tiles (clean, light theme)
        L.tileLayer("https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png", {
            maxZoom: 19,
            subdomains: "abcd",
        }).addTo(mapInstance.current);

        // Custom Icon for Kitchen
        const kitchenIcon = L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background-color: #0F766E; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M17 2v10a5 5 0 0 1-10 0V2"/><path d="M7 2h10"/></svg>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });

        // Custom Icon for Home
        const homeIcon = L.divIcon({
            className: "custom-div-icon",
            html: `<div style="background-color: #F97316; width: 32px; height: 32px; border-radius: 50%; display: flex; align-items: center; justify-content: center; color: white; box-shadow: 0 4px 6px -1px rgba(0,0,0,0.3); border: 2px solid white;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m3 9 9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z"/><polyline points="9 22 9 12 15 12 15 22"/></svg>
                   </div>`,
            iconSize: [32, 32],
            iconAnchor: [16, 32],
        });

        // Add Markers
        L.marker(providerCoords, { icon: kitchenIcon }).addTo(mapInstance.current);
        L.marker(customerCoords, { icon: homeIcon }).addTo(mapInstance.current);

        // Draw a simulated route (using intermediate points based on a generated curve)
        // In a real app, this would be a polyline from a routing API like OSRM or Google Directions
        const routePoints: L.LatLngExpression[] = [
            providerCoords,
            [
                providerCoords[0] - (providerCoords[0] - customerCoords[0]) * 0.25,
                providerCoords[1] - (providerCoords[1] - customerCoords[1]) * 0.1,
            ],
            [
                providerCoords[0] - (providerCoords[0] - customerCoords[0]) * 0.5,
                providerCoords[1] - (providerCoords[1] - customerCoords[1]) * 0.3,
            ],
            [
                providerCoords[0] - (providerCoords[0] - customerCoords[0]) * 0.75,
                providerCoords[1] - (providerCoords[1] - customerCoords[1]) * 0.8,
            ],
            customerCoords,
        ];

        const routeLine = L.polyline(routePoints, {
            color: "#F97316",
            weight: 5,
            opacity: 0.8,
            lineCap: "round",
            dashArray: "1, 10",
        }).addTo(mapInstance.current);

        // Fit bounds to show the whole route with padding
        mapInstance.current.fitBounds(routeLine.getBounds(), { padding: [50, 50] });

        return () => {
            if (mapInstance.current) {
                mapInstance.current.off();
                mapInstance.current.remove();
                mapInstance.current = null;
            }
        };
    }, [providerCoords, customerCoords]);

    return (
        <div className="absolute inset-0 z-0 h-full w-full">
            <style>{`
                .leaflet-container {
                    font-family: inherit;
                    background: transparent;
                }
                .dark .leaflet-tile {
                    filter: brightness(0.6) invert(1) contrast(3) hue-rotate(200deg) saturate(0.3) brightness(0.7);
                }
            `}</style>
            <div ref={mapRef} className="w-full h-full" />
        </div>
    );
}
