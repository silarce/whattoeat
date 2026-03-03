"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";
import type { Restaurant } from "@/types/restaurant";

type RestaurantMapProps = {
  apiKey: string;
  location: { lat: number; lng: number };
  restaurants: Restaurant[];
  selectedRestaurant: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
};

export default function RestaurantMap({
  apiKey,
  location,
  restaurants,
  selectedRestaurant,
  onSelectRestaurant,
}: RestaurantMapProps) {
  const mapRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<google.maps.Map | null>(null);
  const mapsModuleRef = useRef<typeof google.maps | null>(null);
  const markersRef = useRef<google.maps.marker.AdvancedMarkerElement[]>([]);
  const locationMarkerRef = useRef<google.maps.marker.AdvancedMarkerElement | null>(null);
  const infoWindowRef = useRef<google.maps.InfoWindow | null>(null);
  const labelsRef = useRef<HTMLElement[]>([]);
  const zoomListenerRef = useRef<google.maps.MapsEventListener | null>(null);

  // 用 state 標記地圖是否就緒，讓後續 effect 能正確依賴
  const [mapReady, setMapReady] = useState(false);

  const onSelectRef = useRef(onSelectRestaurant);
  onSelectRef.current = onSelectRestaurant;

  /** 開啟 InfoWindow 並顯示餐廳資訊 — 用 ref 儲存避免 useCallback 順序問題 */
  const openInfoWindowFn = useCallback(
    (anchor: google.maps.marker.AdvancedMarkerElement, restaurant: Restaurant) => {
      const mapsModule = mapsModuleRef.current;
      const map = mapInstanceRef.current;
      if (!mapsModule || !map) return;

      if (!infoWindowRef.current) {
        infoWindowRef.current = new mapsModule.InfoWindow();
      }

      const mapsUrl = restaurant.lat && restaurant.lng
        ? `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}&query_place_id=${restaurant.id}`
        : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(restaurant.name)}`;

      infoWindowRef.current.setContent(
        `<div style="font-family:'Google Sans',Roboto,Arial,sans-serif;min-width:160px;max-width:240px;padding:0">
          <div style="padding:12px 14px 4px">
            <div style="font-size:16px;font-weight:500;color:#202124;line-height:1.3;margin-bottom:4px">${restaurant.name}</div>
            ${restaurant.address
              ? `<div style="font-size:13px;color:#70757a;line-height:1.4;margin-top:4px">${restaurant.address}</div>`
              : ""}
          </div>
          <div style="border-top:1px solid #e8eaed;margin-top:8px;padding:8px 14px">
            <a href="${mapsUrl}" target="_blank" rel="noopener"
              style="font-size:13px;color:#1a73e8;text-decoration:none;font-weight:400">
              在 Google 地圖上查看
            </a>
          </div>
        </div>`,
      );

      infoWindowRef.current.open({ anchor, map });
    },
    [],
  );
  const openInfoWindowRef = useRef(openInfoWindowFn);
  openInfoWindowRef.current = openInfoWindowFn;

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
    labelsRef.current = [];

    // 移除舊的 zoom 監聽器
    if (zoomListenerRef.current) {
      zoomListenerRef.current.remove();
      zoomListenerRef.current = null;
    }

    if (!mapsModule.marker?.AdvancedMarkerElement) return;

    // zoom 閾值：超過此值就隱藏 label（Google 地圖已顯示 POI 名稱）
    const LABEL_HIDE_ZOOM = 18;

    restaurants.forEach((restaurant) => {
      if (!restaurant.lat || !restaurant.lng) return;

      // 外層容器：label 在上、pin SVG 在下
      const el = document.createElement("div");
      el.style.cssText = "display:flex;flex-direction:column;align-items:center;cursor:pointer;";

      // 名稱 label
      const label = document.createElement("div");
      const shortName = restaurant.name.length > 12
        ? restaurant.name.slice(0, 12) + "…"
        : restaurant.name;
      label.textContent = shortName;
      label.style.cssText = [
        "max-width:110px",
        "padding:2px 6px",
        "border-radius:4px",
        "background:transparent",
        "font-size:13px",
        "font-weight:600",
        "color:#e18646",
        "white-space:nowrap",
        "overflow:hidden",
        "text-overflow:ellipsis",
        "margin-bottom:2px",
        "pointer-events:none",
        "-webkit-text-stroke:2.5px white",
        "paint-order:stroke fill",
      ].join(";");

      // pin SVG
      const pinEl = document.createElement("div");
      pinEl.innerHTML =
        '<svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 2C9.37 2 4 7.37 4 14c0 7 12 28 12 28s12-21 12-28c0-6.63-5.37-12-12-12z" fill="#e18646" stroke="white" stroke-width="1.5"/><circle cx="16" cy="13" r="4" fill="white"/></svg>';

      el.appendChild(label);
      el.appendChild(pinEl);
      labelsRef.current.push(label);

      const handleClick = () => {
        openInfoWindowRef.current(marker, restaurant);
        map.panTo({ lat: restaurant.lat!, lng: restaurant.lng! });
        map.setZoom(18);
      };
      el.addEventListener("click", handleClick);

      const marker = new mapsModule.marker.AdvancedMarkerElement({
        position: { lat: restaurant.lat, lng: restaurant.lng },
        map,
        title: restaurant.name,
        content: el,
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

    // 根據 zoom 同步 label 可見性
    const syncLabels = () => {
      const zoom = map.getZoom() ?? 0;
      const visible = zoom < LABEL_HIDE_ZOOM;
      labelsRef.current.forEach((lbl) => {
        lbl.style.display = visible ? "" : "none";
      });
    };
    syncLabels();
    zoomListenerRef.current = mapsModule.event.addListener(map, "zoom_changed", syncLabels);
  }, [restaurants, location.lat, location.lng]);

  // 4) 地圖就緒 + restaurants 改變 → 更新 markers
  useEffect(() => {
    if (!mapReady) return;
    const timer = setTimeout(() => {
      updateMarkers();
    }, 100);
    return () => {
      clearTimeout(timer);
      if (zoomListenerRef.current) {
        zoomListenerRef.current.remove();
        zoomListenerRef.current = null;
      }
    };
  }, [mapReady, restaurants, updateMarkers]);

  // 5) selectedRestaurant 改變 → focus 並開啟 InfoWindow
  useEffect(() => {
    if (!mapReady || !selectedRestaurant) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    if (selectedRestaurant.lat && selectedRestaurant.lng) {
      map.panTo({ lat: selectedRestaurant.lat, lng: selectedRestaurant.lng });
      map.setZoom(18);

      // 找出對應的 marker 並開啟 InfoWindow
      const marker = markersRef.current.find(
        (m) => m.title === selectedRestaurant.name,
      );
      if (marker) {
        openInfoWindowRef.current(marker, selectedRestaurant);
      }
    }
  }, [mapReady, selectedRestaurant]);

  return (
    <div
      ref={mapRef}
      className="h-64 w-full rounded-xl sm:h-80 md:h-96 lg:h-[28rem]"
      style={{ minHeight: "256px" }}
    />
  );
}
