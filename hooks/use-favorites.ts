"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FavoriteRestaurant, Restaurant } from "@/types/restaurant";
import { toFavorite } from "@/types/restaurant";
import {
  getFavorites,
  addFavorite as dbAdd,
  removeFavorite as dbRemove,
} from "@/lib/favorites-db";

/**
 * 封裝 IndexedDB 收藏管理的 hook
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .catch(() => {
        /* 靜默失敗 */
      })
      .finally(() => setIsLoading(false));
  }, []);

  const favoriteIds = useMemo(
    () => new Set(favorites.map((item) => item.id)),
    [favorites],
  );

  const isFavorite = useCallback(
    (id: string) => favoriteIds.has(id),
    [favoriteIds],
  );

  const add = useCallback(async (restaurant: Restaurant) => {
    await dbAdd(toFavorite(restaurant));
    const next = await getFavorites();
    setFavorites(next);
  }, []);

  const remove = useCallback(async (id: string) => {
    await dbRemove(id);
    const next = await getFavorites();
    setFavorites(next);
  }, []);

  return { favorites, isLoading, isFavorite, add, remove };
}
