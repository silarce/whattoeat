"use client";

import { useCallback, useMemo, useState } from "react";
import type { LatLng, Restaurant } from "@/types/restaurant";
import {
  searchAllNearby,
  filterByDistance,
  sortByDistance,
} from "@/lib/places-api";
import type { DistanceBandKey } from "@/lib/constants";
import { DISTANCE_BANDS } from "@/lib/constants";

const PAGE_SIZE = 10;

type SearchState = {
  /** API 回傳的完整列表（最大距離帶內） */
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

  /** 一次搜尋所有候選（最大距離帶內），回傳完整列表 */
  const search = useCallback(async (location: LatLng) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    setState((prev) => ({
      ...prev,
      allRestaurants: [],
      restaurants: [],
      isSearching: true,
      error: null,
    }));

    try {
      if (!apiKey) throw new Error("MISSING_API_KEY");

      const results = await searchAllNearby(location.lat, location.lng, apiKey);

      if (results.length === 0) throw new Error("EMPTY_RESULTS");

      // 預設先用「遠」過濾
      const nearBand = DISTANCE_BANDS.find((b) => b.key === "far")!;
      const filtered = sortByDistance(
        filterByDistance(
          results,
          location.lat,
          location.lng,
          nearBand.maxMeters,
        ),
        location.lat,
        location.lng,
      );

      setState({
        allRestaurants: results,
        restaurants: filtered,
        isSearching: false,
        error: null,
      });
      return { all: results, filtered };
    } catch {
      alert("google api 不可用，請稍後重試");

      setState({
        allRestaurants: [],
        restaurants: [],
        isSearching: false,
        error: "Google API 暫時不可用，已切換為模擬資料",
      });
      return { all: [], filtered: [] };
    }
  }, []);

  /** 切換距離帶 — 純 client 端過濾，不再打 API */
  const applyBand = useCallback((band: DistanceBandKey, location: LatLng) => {
    setState((prev) => {
      const bandDef = DISTANCE_BANDS.find((b) => b.key === band)!;
      const filtered = sortByDistance(
        filterByDistance(
          prev.allRestaurants,
          location.lat,
          location.lng,
          bandDef.maxMeters,
        ),
        location.lat,
        location.lng,
      );
      return { ...prev, restaurants: filtered };
    });
  }, []);

  // --- 分頁 ---
  const [page, setPage] = useState(0);

  // restaurants 變更時自動回到第一頁
  const totalPages = Math.ceil(state.restaurants.length / PAGE_SIZE);
  const safePage = page >= totalPages ? 0 : page;

  const pagedRestaurants = useMemo(
    () =>
      state.restaurants.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [state.restaurants, safePage],
  );

  return {
    ...state,
    search,
    applyBand,
    page: safePage,
    totalPages,
    pagedRestaurants,
    setPage,
  };
}
