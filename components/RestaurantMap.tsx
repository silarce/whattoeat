"use client";

import { useEffect, useRef } from "react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";
import type { Restaurant } from "@/types/restaurant";

type RestaurantMapProps = {
  apiKey: string | undefined;
  location: { lat: number; lng: number } | null;
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
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    // 確保有足夠的資訊
    if (!apiKey || !location || !mapRef.current) {
      return;
    }

    // 調試：檢查餐廳資料
    console.log("RestaurantMap - Restaurants data:", restaurants);
    console.log(
      "RestaurantMap - Restaurants with coords:",
      restaurants.filter((r) => r.lat && r.lng),
    );

    // 非同步載入 Google Maps 並初始化
    (async () => {
      try {
        const mapsModule = await loadGoogleMaps(apiKey);
        initializeMap(mapsModule);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    })();

    function initializeMap(mapsModule: typeof google.maps) {
      if (!mapRef.current || !location) return;

      // 初始化地圖
      const map = new mapsModule.Map(mapRef.current, {
        zoom: 16,
        center: { lat: location.lat, lng: location.lng },
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      });

      mapInstanceRef.current = map;

      // 清除舊 marker
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];

      // 添加目前位置 marker
      const currentMarker = new mapsModule.Marker({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: "目前位置",
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });
      markersRef.current.push(currentMarker);

      // 添加餐廳 marker
      restaurants.forEach((restaurant) => {
        if (!restaurant.lat || !restaurant.lng) return;

        const marker = new mapsModule.Marker({
          position: { lat: restaurant.lat, lng: restaurant.lng },
          map,
          title: restaurant.name,
        });

        // 點擊 marker 時選擇該餐廳
        marker.addListener("click", () => {
          onSelectRestaurant(restaurant);
          map.panTo({ lat: restaurant.lat!, lng: restaurant.lng! });
          map.setZoom(17);
        });

        markersRef.current.push(marker);
      });

      // 自動調整地圖邊界以容納所有 marker
      if (restaurants.length > 0) {
        const bounds = new mapsModule.LatLngBounds(
          { lat: location.lat, lng: location.lng },
          { lat: location.lat, lng: location.lng }
        );

        markersRef.current.forEach((marker) => {
          const pos = marker.getPosition();
          if (pos) {
            bounds.extend(pos);
          }
        });

        map.fitBounds(bounds, 50);
      }
    }

    // cleanup
    return () => {
      markersRef.current.forEach((marker) => marker.setMap(null));
      markersRef.current = [];
    };
  }, [apiKey, location, restaurants, onSelectRestaurant]);

  return (
    <div
      ref={mapRef}
      className="h-96 w-full rounded-xl border border-black/15"
      style={{ minHeight: "400px" }}
    />
  );
}
