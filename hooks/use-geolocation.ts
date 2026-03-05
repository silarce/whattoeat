"use client";

import { useCallback, useState } from "react";
import type { LatLng } from "@/types/restaurant";

type GeolocationState = {
  location: LatLng | null;
  accuracy: number | null;
  isLocating: boolean;
  error: string | null;
  /** 定位精度偏低時的提示（不影響定位流程） */
  accuracyWarning: string | null;
  permissionDenied: boolean;
};

/**
 * 封裝瀏覽器 Geolocation API 的 hook
 */
export function useGeolocation() {
  const [state, setState] = useState<GeolocationState>({
    location: null,
    accuracy: null,
    isLocating: false,
    error: null,
    accuracyWarning: null,
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

    setState((prev) => ({ ...prev, isLocating: true, error: null, accuracyWarning: null, permissionDenied: false }));

    navigator.geolocation.getCurrentPosition(
      (position) => {
        const accuracy = position.coords.accuracy;
        setState({
          location: {
            lat: position.coords.latitude,
            lng: position.coords.longitude,
          },
          accuracy,
          isLocating: false,
          error: null,
          // 精度誤差半徑超過 150m（常見於純 Wi-Fi / 網路定位），距離帶結果僅供參考
          accuracyWarning: accuracy > 150
            ? `定位精度偏低（誤差約 ${Math.round(accuracy)} 公尺），附近餐廳距離僅供參考`
            : null,
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
      { enableHighAccuracy: true, timeout: 10000, maximumAge: 0 },
    );
  }, []);

  const clearPermissionDenied = useCallback(() => {
    setState((prev) => ({ ...prev, permissionDenied: false }));
  }, []);

  return { ...state, locate, clearPermissionDenied };
}
