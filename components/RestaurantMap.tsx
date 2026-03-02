"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";
import type { Restaurant } from "@/types/restaurant";

type RestaurantMapProps = {
  apiKey: string;
  location: { lat: number; lng: number };
  restaurants: Restaurant[];
  onSelectRestaurant: (restaurant: Restaurant) => void;
};

export default function RestaurantMap({
  apiKey,
  location,
  restaurants,
  onSelectRestaurant,
}: RestaurantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const mapsModuleRef = useRef<typeof google.maps | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const locationMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);

  // 用 state 標記地圖是否就緒，讓後續 effect 能正確依賴
  const [mapReady, setMapReady] = useState(false);

  const onSelectRef = useRef(onSelectRestaurant);
  onSelectRef.current = onSelectRestaurant;

  // 1) 初始化地圖
  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        const mapsModule = await loadGoogleMaps(apiKey);
        if (cancelled || !mapRef.current) return;

        mapsModuleRef.current = mapsModule;

        if (mapInstanceRef.current) {
          setMapReady(true);
          return;
        }

        if (!window.google?.maps) {
          console.error("Google Maps API not loaded");
          return;
        }

        const map = new mapsModule.Map(mapRef.current, {
          zoom: 16,
          center: { lat: location.lat, lng: location.lng },
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
          mapId: process.env.NEXT_PUBLIC_GOOGLE_MAPS_MAP_ID ?? "DEMO_MAP_ID",
        });

        mapInstanceRef.current = map;
        setMapReady(true);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // 2) location 改變 or 地圖就緒 → 更新位置 marker
  useEffect(() => {
    if (!mapReady) return;
    const map = mapInstanceRef.current;
    const mapsModule = mapsModuleRef.current;
    if (!map || !mapsModule) return;

    map.panTo({ lat: location.lat, lng: location.lng });

    if (!mapsModule.marker?.AdvancedMarkerElement) {
      console.warn("AdvancedMarkerElement not available");
      return;
    }

    if (locationMarkerRef.current) {
      locationMarkerRef.current.position = { lat: location.lat, lng: location.lng };
    } else {
      const el = document.createElement("div");
      el.innerHTML =
        '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#4A90E2" stroke="white" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="white"/></svg>';
      locationMarkerRef.current = new mapsModule.marker.AdvancedMarkerElement({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: "目前位置",
        content: el,
      });
    }
  }, [mapReady, location.lat, location.lng]);

  // 3) 更新餐廳 markers
  const updateMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    const mapsModule = mapsModuleRef.current;
    if (!map || !mapsModule) return;

    markersRef.current.forEach((m) => { m.map = null; });
    markersRef.current = [];

    if (!mapsModule.marker?.AdvancedMarkerElement) return;

    restaurants.forEach((restaurant) => {
      if (!restaurant.lat || !restaurant.lng) return;

      const el = document.createElement("div");
      el.innerHTML =
        '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 2C9.37 2 4 7.37 4 14c0 7 12 16 12 16s12-9 12-16c0-6.63-5.37-12-12-12z" fill="#FF6B35" stroke="white" stroke-width="1.5"/><circle cx="16" cy="13" r="4" fill="white"/></svg>';
      const marker = new mapsModule.marker.AdvancedMarkerElement({
        position: { lat: restaurant.lat, lng: restaurant.lng },
        map,
        title: restaurant.name,
        content: el,
      });

      marker.addEventListener("gmp-click", () => {
        onSelectRef.current(restaurant);
        map.panTo({ lat: restaurant.lat!, lng: restaurant.lng! });
        map.setZoom(17);
      });

      markersRef.current.push(marker);
    });

    if (restaurants.length > 0) {
      const bounds = new mapsModule.LatLngBounds();
      bounds.extend({ lat: location.lat, lng: location.lng });
      markersRef.current.forEach((marker) => {
        const pos = marker.position;
        if (pos) bounds.extend(pos);
      });
      map.fitBounds(bounds, 50);
    }
  }, [restaurants, location.lat, location.lng]);

  // 4) 地圖就緒 + restaurants 改變 → 更新 markers
  useEffect(() => {
    if (!mapReady) return;
    // 小延遲確保地圖 tiles 已載入
    const timer = setTimeout(() => {
      updateMarkers();
    }, 100);
    return () => clearTimeout(timer);
  }, [mapReady, restaurants, updateMarkers]);

  return (
    <div
      ref={mapRef}
      className="h-80 w-full rounded-xl sm:h-96"
      style={{ minHeight: "320px" }}
    />
  );
}
