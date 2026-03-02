"use client";

import { useCallback, useState } from "react";
import type { LatLng } from "@/types/restaurant";

type GeolocationState = {
  location: LatLng | null;
  isLocating: boolean;
  error: string | null;
};

/**
 * 封裝瀏覽器 Geolocation API 的 hook
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    isLocating: false,
    error: null,
  });

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "此裝置不支援定位功能",
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLocating: true, error: null }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          isLocating: false,
          error: null,
        });
      },
      () => {
        setState((prev) => ({
          ...prev,
          isLocating: false,
          error: "定位失敗，請確認瀏覽器定位權限",
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  return { ...state, locate };
}
