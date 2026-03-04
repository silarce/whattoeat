"use client";

import { useEffect, useRef, useCallback, useState } from "react";
import { loadGoogleMaps } from "@/lib/google-maps-loader";
import type { Restaurant } from "@/types/restaurant";
import { makePinSvg, locationDotSvg } from "@/lib/map-icons";

type RestaurantMapProps = {
  apiKey: string;
  location: { lat: number; lng: number };
  restaurants: Restaurant[];
  extraRestaurant?: Restaurant | null;
  selectedRestaurant: Restaurant | null;
  isDark?: boolean;
  onSelectRestaurant: (restaurant: Restaurant) => void;
};

// zoom 閾値：超過此値就隱藏自訂 label（預留給 Google 原生 POI 標籤）
const LABEL_HIDE_ZOOM = 20;
// 點擊 marker / 選取餐廳時，地圖縮放到的目標 zoom（街道等級）
const RESTAURANT_FOCUS_ZOOM = 17;
const MARKER_DEFAULT_COLOR = "#e18646";
const MARKER_WINNER_COLOR  = "#ef4444";

const makePinHtml = makePinSvg;

function applyColorToEl(el: HTMLElement, color: string) {
  const labelDiv = el.firstElementChild as HTMLElement | null;
  if (labelDiv) labelDiv.style.color = color;
  const pinDiv = el.lastElementChild as HTMLElement | null;
  if (pinDiv) pinDiv.innerHTML = makePinHtml(color);
}
export default function RestaurantMap({
  apiKey,
  location,
  restaurants,
  extraRestaurant,
  selectedRestaurant,
  isDark = false,
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
  const selectedMarkerElRef = useRef<HTMLElement | null>(null);
  // ref 鏡像，讓 updateMarkers 不需依賴 selectedRestaurant 就能讀到最新值
  const selectedRestaurantRef = useRef(selectedRestaurant);
  selectedRestaurantRef.current = selectedRestaurant;

  // 用 state 標記地圖是否就緒，讓後續 effect 能正確依賴
  const [mapReady, setMapReady] = useState(false);

  // isDark ref 鏡像，讓初始化的 async 閉包能讀到最新值
  const isDarkRef = useRef(isDark);
  isDarkRef.current = isDark;

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
          colorScheme: isDarkRef.current ? "DARK" : "LIGHT",
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

  // 2) isDark 變化時元件會被 key 強制 remount，此 effect 保留備用

  // 3) location 改變 or 地圖就緒 → 更新位置 marker
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
      el.innerHTML = locationDotSvg;
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
    selectedMarkerElRef.current = null;

    // 移除舊的 zoom 監聽器
    if (zoomListenerRef.current) {
      zoomListenerRef.current.remove();
      zoomListenerRef.current = null;
    }

    if (!mapsModule.marker?.AdvancedMarkerElement) return;

    // 若 extraRestaurant 不在目前清單中，額外加入以確保地圖上有其 marker
    const effectiveList =
      extraRestaurant && !restaurants.some((r) => r.id === extraRestaurant.id)
        ? [...restaurants, extraRestaurant]
        : restaurants;


    effectiveList.forEach((restaurant) => {
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
      const isWinner = selectedRestaurantRef.current?.id === restaurant.id;
      const pinColor = isWinner ? MARKER_WINNER_COLOR : MARKER_DEFAULT_COLOR;
      label.style.color = pinColor;
      pinEl.innerHTML = makePinHtml(pinColor);

      el.appendChild(label);
      el.appendChild(pinEl);
      labelsRef.current.push(label);

      const handleClick = () => {
        openInfoWindowRef.current(marker, restaurant);
        map.panTo({ lat: restaurant.lat!, lng: restaurant.lng! });
        map.setZoom(RESTAURANT_FOCUS_ZOOM);
      };
      el.addEventListener("click", handleClick);

      const marker = new mapsModule.marker.AdvancedMarkerElement({
        position: { lat: restaurant.lat, lng: restaurant.lng },
        map,
        title: restaurant.name,
        content: el,
      });

      markersRef.current.push(marker);

      if (isWinner) selectedMarkerElRef.current = el;
    });

    if (effectiveList.length > 0) {
      const bounds = new mapsModule.LatLngBounds();
      bounds.extend({ lat: location.lat, lng: location.lng });
      markersRef.current.forEach((marker) => {
        const pos = marker.position;
        if (pos) bounds.extend(pos);
      });
      map.fitBounds(bounds, 50);
    }

    // 若此時已有 winner，fitBounds 之後立即置中回 winner
    const winner = selectedRestaurantRef.current;
    if (winner?.lat && winner?.lng) {
      map.panTo({ lat: winner.lat, lng: winner.lng });
      map.setZoom(RESTAURANT_FOCUS_ZOOM);
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
  }, [restaurants, extraRestaurant, location.lat, location.lng]);

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

  // 5) selectedRestaurant 改變 → focus、開啟 InfoWindow、更新 marker 顏色
  useEffect(() => {
    if (!mapReady) return;
    const map = mapInstanceRef.current;
    if (!map) return;

    // 還原舊的 winner marker
    if (selectedMarkerElRef.current) {
      applyColorToEl(selectedMarkerElRef.current, MARKER_DEFAULT_COLOR);
      selectedMarkerElRef.current = null;
    }

    if (!selectedRestaurant?.lat || !selectedRestaurant?.lng) return;

    map.panTo({ lat: selectedRestaurant.lat, lng: selectedRestaurant.lng });
    map.setZoom(RESTAURANT_FOCUS_ZOOM);

    const marker = markersRef.current.find((m) => m.title === selectedRestaurant.name);
    if (marker) {
      openInfoWindowRef.current(marker, selectedRestaurant);
      const el = marker.content as HTMLElement;
      applyColorToEl(el, MARKER_WINNER_COLOR);
      selectedMarkerElRef.current = el;
    }
  }, [mapReady, selectedRestaurant]);

  return (
    <div
      ref={mapRef}
      className="h-64 w-full rounded-xl sm:h-80 md:h-96 lg:h-112"
      style={{ minHeight: "256px" }}
    />
  );
}
