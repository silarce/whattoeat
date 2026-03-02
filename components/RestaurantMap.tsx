"use client";

import { useEffect, useRef, useCallback } from "react";
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

  // 以 ref 保存 callback，避免 effect 因 callback 變化而重跑
  const onSelectRef = useRef(onSelectRestaurant);
  onSelectRef.current = onSelectRestaurant;

  // 1) 初始化地圖 — 只在 apiKey 改變時執行一次
  useEffect(() => {
    if (!mapRef.current) return;
    let cancelled = false;

    (async () => {
      try {
        const mapsModule = await loadGoogleMaps(apiKey);
        if (cancelled || !mapRef.current) return;

        mapsModuleRef.current = mapsModule;

        // 如果地圖已存在，不重建
        if (mapInstanceRef.current) return;

        const map = new mapsModule.Map(mapRef.current, {
          zoom: 16,
          center: { lat: location.lat, lng: location.lng },
          mapTypeControl: false,
          fullscreenControl: false,
          streetViewControl: false,
        });

        mapInstanceRef.current = map;
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    })();

    return () => {
      cancelled = true;
    };
    // 只在 apiKey 變化時初始化，location 用於初始 center
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [apiKey]);

  // 2) location 改變 → 更新地圖中心與位置 marker
  useEffect(() => {
    const map = mapInstanceRef.current;
    const mapsModule = mapsModuleRef.current;
    if (!map || !mapsModule) return;

    map.panTo({ lat: location.lat, lng: location.lng });

    // 更新或建立位置 marker
    if (locationMarkerRef.current) {
      locationMarkerRef.current.position = {
        lat: location.lat,
        lng: location.lng,
      };
    } else {
      const markerElement = document.createElement("div");
      markerElement.innerHTML =
        '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#4A90E2" stroke="white" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="white"/></svg>';
      locationMarkerRef.current = new mapsModule.marker.AdvancedMarkerElement({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: "目前位置",
        content: markerElement,
      });
    }
  }, [location.lat, location.lng]);

  // 3) 更新餐廳 markers — 只在 restaurants 陣列改變時
  const updateMarkers = useCallback(() => {
    const map = mapInstanceRef.current;
    const mapsModule = mapsModuleRef.current;
    if (!map || !mapsModule) return;

    // 清除舊的餐廳 markers
    markersRef.current.forEach((m) => {
      m.map = null;
    });
    markersRef.current = [];

    restaurants.forEach((restaurant) => {
      if (!restaurant.lat || !restaurant.lng) return;

      const markerElement = document.createElement("div");
      markerElement.innerHTML =
        '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 2C9.37 2 4 7.37 4 14c0 7 12 16 12 16s12-9 12-16c0-6.63-5.37-12-12-12z" fill="#FF6B35" stroke="white" stroke-width="1.5"/><circle cx="16" cy="13" r="4" fill="white"/></svg>';
      const marker = new mapsModule.marker.AdvancedMarkerElement({
        position: { lat: restaurant.lat, lng: restaurant.lng },
        map,
        title: restaurant.name,
        content: markerElement,
      });

      marker.addEventListener("gmp-click", () => {
        onSelectRef.current(restaurant);
        map.panTo({ lat: restaurant.lat!, lng: restaurant.lng! });
        map.setZoom(17);
      });

      markersRef.current.push(marker);
    });

    // 自動調整邊界
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

  useEffect(() => {
    updateMarkers();
  }, [updateMarkers]);

  // 地圖載入後首次標記 (等初始化完成)
  useEffect(() => {
    // 輪詢等待 map 就緒後放置 markers
    if (!mapInstanceRef.current) {
      const timer = setInterval(() => {
        if (mapInstanceRef.current && mapsModuleRef.current) {
          clearInterval(timer);
          // 放置位置 marker
          if (!locationMarkerRef.current) {
            const markerElement = document.createElement("div");
            markerElement.innerHTML =
              '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#4A90E2" stroke="white" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="white"/></svg>';
            locationMarkerRef.current = new mapsModuleRef.current.marker.AdvancedMarkerElement({
              position: { lat: location.lat, lng: location.lng },
              map: mapInstanceRef.current,
              title: "目前位置",
              content: markerElement,
            });
          }
          updateMarkers();
        }
      }, 100);

      return () => clearInterval(timer);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div
      ref={mapRef}
      className="h-80 w-full rounded-xl sm:h-96"
      style={{ minHeight: "320px" }}
    />
  );
}
