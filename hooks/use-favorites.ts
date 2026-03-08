"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import type { FavoriteRestaurant, RestaurantData } from "@/types/restaurant";
import { toFavorite } from "@/types/restaurant";
import { getFavorites, addFavorite as dbAdd, removeFavorite as dbRemove } from "@/lib/favorites-db";
import { PAGE_SIZE } from "@/lib/constants";

/**
 * 封裝 IndexedDB 收藏管理的 hook
 */
export function useFavorites() {
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [page, setPage] = useState(0);

  useEffect(() => {
    getFavorites()
      .then(setFavorites)
      .catch(() => {
        alert("取得收藏資料失敗，請確認您使用的是主流瀏覽器且已允許使用 IndexedDB");
      })
      .finally(() => setIsLoading(false));
  }, []);

  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.id)), [favorites]);

  const isFavorite = useCallback((id: string) => favoriteIds.has(id), [favoriteIds]);

  const add = useCallback(async (restaurant: RestaurantData) => {
    await dbAdd(toFavorite(restaurant));
    const next = await getFavorites();
    setFavorites(next);
  }, []);

  const remove = useCallback(async (id: string) => {
    await dbRemove(id);
    const next = await getFavorites();
    setFavorites(next);
  }, []);

  const totalPages = Math.max(1, Math.ceil(favorites.length / PAGE_SIZE));
  const safePage = page >= totalPages ? 0 : page;

  const pagedFavorites = useMemo(
    () => favorites.slice(safePage * PAGE_SIZE, (safePage + 1) * PAGE_SIZE),
    [favorites, safePage],
  );

  return {
    favorites,
    isLoading,
    isFavorite,
    add,
    remove,
    pagedFavorites,
    page: safePage,
    totalPages,
    setPage,
  };
}
