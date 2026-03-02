"use client";

import { useCallback, useState } from "react";
import type { LatLng, Restaurant } from "@/types/restaurant";
import { searchAllNearby, filterByDistance, createMockRestaurants } from "@/lib/places-api";
import type { DistanceBandKey } from "@/lib/constants";
import { DISTANCE_BANDS } from "@/lib/constants";

type SearchState = {
  /** API 回傳的完整列表（1200m 內） */
  allRestaurants: Restaurant[];
  /** 目前距離帶過濾後的列表 */
  restaurants: Restaurant[];
  isSearching: boolean;
  error: string | null;
};

/**
 * 封裝餐廳搜尋邏輯的 hook — 模式 C：一次搜尋，client 端按距離帶過濾
 */
export function useRestaurantSearch() {
  const [state, setState] = useState<SearchState>({
    allRestaurants: [],
    restaurants: [],
    isSearching: false,
    error: null,
  });

  /** 一次搜尋所有候選（最大距離帶 1200m 內），回傳完整列表 */
  const search = useCallback(async (location: LatLng) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    setState((prev) => ({ ...prev, allRestaurants: [], restaurants: [], isSearching: true, error: null }));

    try {
      if (!apiKey) throw new Error("MISSING_API_KEY");

      const results = await searchAllNearby(location.lat, location.lng, apiKey);

      if (results.length === 0) throw new Error("EMPTY_RESULTS");

      // 預設先用「近」過濾
      const nearBand = DISTANCE_BANDS.find((b) => b.key === "near")!;
      const filtered = filterByDistance(results, location.lat, location.lng, nearBand.maxMeters);

      setState({ allRestaurants: results, restaurants: filtered, isSearching: false, error: null });
      return { all: results, filtered };
    } catch {
      const fallback = createMockRestaurants(location.lat, location.lng);
      setState({
        allRestaurants: fallback,
        restaurants: fallback,
        isSearching: false,
        error: "Google API 暫時不可用，已切換為模擬資料",
      });
      return { all: fallback, filtered: fallback };
    }
  }, []);

  /** 切換距離帶 — 純 client 端過濾，不再打 API */
  const applyBand = useCallback((band: DistanceBandKey, location: LatLng) => {
    setState((prev) => {
      const bandDef = DISTANCE_BANDS.find((b) => b.key === band)!;
      const filtered = filterByDistance(prev.allRestaurants, location.lat, location.lng, bandDef.maxMeters);
      return { ...prev, restaurants: filtered };
    });
  }, []);

  return { ...state, search, applyBand };
}
