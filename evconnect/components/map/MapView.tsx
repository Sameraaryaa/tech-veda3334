"use client";

import React, { useRef, useEffect, useCallback } from "react";
import mapboxgl from "mapbox-gl";
import "mapbox-gl/dist/mapbox-gl.css";
import { Charger } from "@/lib/types";

/* ═══════════════════════════════════════════════════════════
   MapView — Mapbox GL JS map with live charger markers
   Real-time updates, route drawing, custom markers
   ═══════════════════════════════════════════════════════════ */

interface MapViewProps {
  chargers: Charger[];
  onChargerClick?: (charger: Charger) => void;
  routeGeoJSON?: string;
  center?: [number, number];
  zoom?: number;
}

// Marker color config by status
const MARKER_COLORS: Record<string, { bg: string; shadow: string; pulse: boolean }> = {
  available: { bg: "#00FF88", shadow: "rgba(0,255,136,0.5)", pulse: true },
  charging: { bg: "#F59E0B", shadow: "rgba(245,158,11,0.3)", pulse: false },
  booked: { bg: "#EF4444", shadow: "rgba(239,68,68,0.3)", pulse: false },
  offline: { bg: "#4A5568", shadow: "rgba(74,85,104,0.2)", pulse: false },
};

function createMarkerElement(status: string): HTMLDivElement {
  const config = MARKER_COLORS[status] || MARKER_COLORS.offline;
  const el = document.createElement("div");
  el.className = "ev-marker";
  el.style.cssText = `position:relative;width:40px;height:40px;cursor:pointer;`;

  // Pulse ring for available
  if (config.pulse) {
    const ring = document.createElement("div");
    ring.style.cssText = `
      position:absolute;inset:0;
      border:2px solid ${config.bg};
      border-radius:50%;
      animation:marker-pulse 2s infinite;
    `;
    el.appendChild(ring);
  }

  // Core circle
  const core = document.createElement("div");
  core.style.cssText = `
    position:absolute;inset:4px;
    background:${config.bg};
    border-radius:50%;
    display:flex;align-items:center;justify-content:center;
    font-size:16px;
    box-shadow:0 0 20px ${config.shadow};
    transition:transform 0.2s;
  `;
  core.textContent = "⚡";
  el.appendChild(core);

  el.addEventListener("mouseenter", () => {
    core.style.transform = "scale(1.15)";
  });
  el.addEventListener("mouseleave", () => {
    core.style.transform = "scale(1)";
  });

  return el;
}

export default function MapView({
  chargers,
  onChargerClick,
  routeGeoJSON,
  center = [77.5946, 12.9716],
  zoom = 12,
}: MapViewProps) {
  const mapContainerRef = useRef<HTMLDivElement>(null);
  const mapRef = useRef<mapboxgl.Map | null>(null);
  const markersRef = useRef<mapboxgl.Marker[]>([]);
  const popupRef = useRef<mapboxgl.Popup | null>(null);

  // Initialize map
  useEffect(() => {
    const token = process.env.NEXT_PUBLIC_MAPBOX_TOKEN;
    if (!mapContainerRef.current) return;

    if (!token) {
      // Show placeholder if no token
      mapContainerRef.current.innerHTML = `
        <div style="display:flex;flex-direction:column;align-items:center;justify-content:center;height:100%;background:#050A14;color:#8BA0B4;">
          <div style="font-size:64px;margin-bottom:16px;">🗺️</div>
          <p style="font-size:14px;">Add NEXT_PUBLIC_MAPBOX_TOKEN to .env.local</p>
          <p style="font-size:12px;margin-top:4px;color:#4A5568;">Map will render with your Mapbox token</p>
        </div>
      `;
      return;
    }

    mapboxgl.accessToken = token;

    const map = new mapboxgl.Map({
      container: mapContainerRef.current,
      style: "mapbox://styles/mapbox/navigation-night-v1",
      center,
      zoom,
      attributionControl: false,
    });

    map.addControl(
      new mapboxgl.NavigationControl({ showCompass: false }),
      "top-right"
    );

    mapRef.current = map;

    // Add pulse animation style
    const style = document.createElement("style");
    style.textContent = `
      @keyframes marker-pulse {
        0% { transform: scale(1); opacity: 1; }
        100% { transform: scale(2.5); opacity: 0; }
      }
    `;
    document.head.appendChild(style);

    return () => {
      map.remove();
      style.remove();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Update markers when chargers change
  const updateMarkers = useCallback(() => {
    const map = mapRef.current;
    if (!map) return;

    // Remove existing markers
    markersRef.current.forEach((m) => m.remove());
    markersRef.current = [];

    // Add new markers
    chargers.forEach((charger) => {
      const el = createMarkerElement(charger.status);

      const marker = new mapboxgl.Marker({ element: el })
        .setLngLat([charger.location.lng, charger.location.lat])
        .addTo(map);

      el.addEventListener("click", () => {
        // Close existing popup
        if (popupRef.current) popupRef.current.remove();

        const popup = new mapboxgl.Popup({
          offset: 25,
          closeButton: true,
          maxWidth: "280px",
        })
          .setLngLat([charger.location.lng, charger.location.lat])
          .setHTML(`
            <div style="font-family:'DM Sans',sans-serif;">
              <div style="font-family:'Syne',sans-serif;font-weight:700;font-size:14px;color:#F0F4F8;margin-bottom:4px;">
                ${charger.ownerName}
              </div>
              <div style="font-size:12px;color:#8BA0B4;margin-bottom:8px;">
                ${charger.location.address}
              </div>
              <div style="display:flex;gap:8px;align-items:center;margin-bottom:8px;">
                <span style="background:rgba(0,255,136,0.15);color:#00FF88;padding:2px 8px;border-radius:999px;font-size:11px;">
                  ${charger.connectorType}
                </span>
                <span style="font-family:'Space Mono',monospace;font-size:12px;color:#8BA0B4;">
                  ${charger.powerKW} kW
                </span>
              </div>
              <div style="font-family:'Space Mono',monospace;font-size:16px;color:#00FF88;font-weight:700;margin-bottom:8px;">
                ₹${charger.pricePerUnit}/kWh
              </div>
              <button
                onclick="document.dispatchEvent(new CustomEvent('book-charger',{detail:'${charger.id}'}))"
                style="
                  width:100%;padding:8px;
                  background:#00FF88;color:#050A14;
                  border:none;border-radius:8px;
                  font-family:'Syne',sans-serif;font-weight:700;font-size:13px;
                  cursor:pointer;
                "
              >Book Now</button>
            </div>
          `)
          .addTo(map);

        popupRef.current = popup;
        onChargerClick?.(charger);
      });

      markersRef.current.push(marker);
    });
  }, [chargers, onChargerClick]);

  useEffect(() => {
    const map = mapRef.current;
    if (!map) return;

    if (map.isStyleLoaded()) {
      updateMarkers();
    } else {
      map.on("load", updateMarkers);
    }
  }, [updateMarkers]);

  // Draw route when routeGeoJSON changes
  useEffect(() => {
    const map = mapRef.current;
    if (!map || !routeGeoJSON) return;

    const addRoute = () => {
      // Remove existing route
      if (map.getSource("route")) {
        map.removeLayer("route-line");
        map.removeSource("route");
      }

      const geojson = JSON.parse(routeGeoJSON);

      map.addSource("route", {
        type: "geojson",
        data: {
          type: "Feature",
          properties: {},
          geometry: geojson,
        },
      });

      map.addLayer({
        id: "route-line",
        type: "line",
        source: "route",
        layout: {
          "line-join": "round",
          "line-cap": "round",
        },
        paint: {
          "line-color": "#0EA5E9",
          "line-width": 4,
          "line-opacity": 0.85,
        },
      });

      // Fit bounds to route
      const coords = geojson.coordinates as [number, number][];
      if (coords.length > 0) {
        const bounds = new mapboxgl.LngLatBounds();
        coords.forEach((c) => bounds.extend(c));
        map.fitBounds(bounds, { padding: 60, duration: 1500 });
      }
    };

    if (map.isStyleLoaded()) {
      addRoute();
    } else {
      map.on("load", addRoute);
    }
  }, [routeGeoJSON]);

  // Method to fly to a location (exposed via ref if needed)
  useEffect(() => {
    const handler = (e: Event) => {
      const charger = chargers.find(
        (c) => c.id === (e as CustomEvent).detail
      );
      if (charger) onChargerClick?.(charger);
    };
    document.addEventListener("book-charger", handler);
    return () => document.removeEventListener("book-charger", handler);
  }, [chargers, onChargerClick]);

  return (
    <div className="relative w-full h-full">
      <div ref={mapContainerRef} className="w-full h-full" />
    </div>
  );
}

/**
 * Fly map to a specific charger location
 */
export function flyToCharger(
  mapRef: React.RefObject<mapboxgl.Map | null>,
  charger: Charger
) {
  mapRef.current?.flyTo({
    center: [charger.location.lng, charger.location.lat],
    zoom: 15,
    duration: 1200,
  });
}
