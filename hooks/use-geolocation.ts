"use client";

import { useCallback, useState } from "react";
import type { LatLng } from "@/types/restaurant";

type GeolocationState = {
  location: LatLng | null;
  isLocating: boolean;
  error: string | null;
  permissionDenied: boolean;
};

/**
 * 封裝瀏覽器 Geolocation API 的 hook
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    isLocating: false,
    error: null,
    permissionDenied: false,
  });

  const locate = useCallback(() => {
    if (!navigator.geolocation) {
      setState((prev) => ({
        ...prev,
        error: "此裝置不支援定位功能",
        permissionDenied: false,
      }));
      return;
    }

    setState((prev) => ({ ...prev, isLocating: true, error: null, permissionDenied: false }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          isLocating: false,
          error: null,
          permissionDenied: false,
        });
      },
      (err) => {
        const denied = err.code === err.PERMISSION_DENIED;
        setState((prev) => ({
          ...prev,
          isLocating: false,
          error: denied ? null : "定位失敗，請稍後再試",
          permissionDenied: denied,
        }));
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  }, []);

  const clearPermissionDenied = useCallback(() => {
    setState((prev) => ({ ...prev, permissionDenied: false }));
  }, []);

  return { ...state, locate, clearPermissionDenied };
}
