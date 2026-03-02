"use client";

import { useEffect, useRef } from "react";
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
  const markersRef = useRef<google.maps.Marker[]>([]);

  useEffect(() => {
    if (!mapRef.current) return;

    let cancelled = false;

    (async () => {
      try {
        const mapsModule = await loadGoogleMaps(apiKey);
        if (cancelled) return;
        initializeMap(mapsModule);
      } catch (error) {
        console.error("Failed to load Google Maps:", error);
      }
    })();

    function initializeMap(mapsModule: typeof google.maps) {
      if (!mapRef.current || cancelled) return;

      const map = new mapsModule.Map(mapRef.current, {
        zoom: 16,
        center: { lat: location.lat, lng: location.lng },
        mapTypeControl: false,
        fullscreenControl: false,
        streetViewControl: false,
      });

      mapInstanceRef.current = map;

      // 清除舊 marker
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];

      // 目前位置 marker
      const currentMarker = new mapsModule.Marker({
        position: { lat: location.lat, lng: location.lng },
        map,
        title: "目前位置",
        icon: "http://maps.google.com/mapfiles/ms/icons/blue-dot.png",
      });
      markersRef.current.push(currentMarker);

      // 餐廳 markers
      restaurants.forEach((restaurant) => {
        if (!restaurant.lat || !restaurant.lng) return;

        const marker = new mapsModule.Marker({
          position: { lat: restaurant.lat, lng: restaurant.lng },
          map,
          title: restaurant.name,
        });

        marker.addListener("click", () => {
          onSelectRestaurant(restaurant);
          map.panTo({ lat: restaurant.lat!, lng: restaurant.lng! });
          map.setZoom(17);
        });

        markersRef.current.push(marker);
      });

      // 自動調整邊界
      if (restaurants.length > 0) {
        const bounds = new mapsModule.LatLngBounds(
          { lat: location.lat, lng: location.lng },
          { lat: location.lat, lng: location.lng },
        );

        markersRef.current.forEach((marker) => {
          const pos = marker.getPosition();
          if (pos) bounds.extend(pos);
        });

        map.fitBounds(bounds, 50);
      }
    }

    return () => {
      cancelled = true;
      markersRef.current.forEach((m) => m.setMap(null));
      markersRef.current = [];
    };
  }, [apiKey, location, restaurants, onSelectRestaurant]);

  return (
    <div
      ref={mapRef}
      className="h-80 w-full rounded-xl sm:h-96"
      style={{ minHeight: "320px" }}
    />
  );
}
