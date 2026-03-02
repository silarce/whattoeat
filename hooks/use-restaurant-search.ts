"use client";

import { useCallback, useState } from "react";
import type { LatLng, Restaurant } from "@/types/restaurant";
import { searchNearbyRestaurants, createMockRestaurants } from "@/lib/places-api";

type SearchState = {
  restaurants: Restaurant[];
  isSearching: boolean;
  error: string | null;
};

/**
 * 封裝餐廳搜尋邏輯的 hook
 */
export function useRestaurantSearch() {
  const [state, setState] = useState<SearchState>({
    restaurants: [],
    isSearching: false,
    error: null,
  });

  const search = useCallback(async (location: LatLng) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

    setState({ restaurants: [], isSearching: true, error: null });

    try {
      if (!apiKey) {
        throw new Error("MISSING_API_KEY");
      }

      const results = await searchNearbyRestaurants(
        location.lat,
        location.lng,
        apiKey,
      );

      if (results.length === 0) {
        throw new Error("EMPTY_RESULTS");
      }

      setState({ restaurants: results, isSearching: false, error: null });
      return results;
    } catch {
      // Fallback to mock data
      const fallback = createMockRestaurants(location.lat, location.lng);
      setState({
        restaurants: fallback,
        isSearching: false,
        error: "Google API 暫時不可用，已切換為模擬資料",
      });
      return fallback;
    }
  }, []);

  return { ...state, search };
}
