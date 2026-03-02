"use client";

import { useCallback, useState } from "react";
import type { FavoriteRestaurant, Restaurant } from "@/types/restaurant";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useRestaurantSearch } from "@/hooks/use-restaurant-search";
import { useWheel } from "@/hooks/use-wheel";
import { useFavorites } from "@/hooks/use-favorites";
import { AUTO_SPIN_DELAY, MAX_WHEEL_ITEMS } from "@/lib/constants";
import { Header } from "@/components/header";
import { WheelSection } from "@/components/wheel-section";
import { WinnerCard } from "@/components/winner-card";
import { RestaurantList } from "@/components/restaurant-list";
import { MapSection } from "@/components/map-section";
import { FavoritesSection } from "@/components/favorites-section";

export default function Home() {
  // --- Hooks ---
  const geo = useGeolocation();
  const searchHook = useRestaurantSearch();
  const wheel = useWheel();
  const favs = useFavorites();

  // --- Local state ---
  const [status, setStatus] = useState("請先取得定位，開始找餐廳");
  const [manualWheelIds, setManualWheelIds] = useState<string[]>([]);
  const [mapTarget, setMapTarget] = useState<Restaurant | null>(null);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // --- Derived status message ---
  const displayStatus = geo.error ?? status;

  // --- Handlers ---
  const handleLocate = useCallback(() => {
    geo.locate();
    setStatus("定位中…");
    // We rely on geo.location being set asynchronously
  }, [geo]);

  // Update status when location changes
  const locationStatus =
    geo.location && !geo.isLocating && status === "定位中…"
      ? "定位成功，可開始搜尋附近餐廳"
      : undefined;

  const handleSearch = useCallback(async () => {
    if (!geo.location) {
      setStatus("請先完成定位");
      return;
    }

    setStatus("搜尋附近餐廳中…");
    const results = await searchHook.search(geo.location);

    if (results.length === 0) {
      setStatus("附近找不到餐廳，請嘗試其他地點");
      return;
    }

    // Fill wheel and auto-select
    const picked = wheel.fillRandom(results);
    setManualWheelIds([]);
    setStatus(`已找到 ${results.length} 家餐廳，正在抽選…`);

    setTimeout(() => {
      const winner = wheel.autoSelect(picked);
      setMapTarget(winner);
      setStatus(`推薦：${winner.name}`);
      setIsWinnerModalOpen(true);
    }, AUTO_SPIN_DELAY);
  }, [geo.location, searchHook, wheel]);

  const handleSpin = useCallback(() => {
    wheel.spin();
    setStatus("轉盤旋轉中…");
  }, [wheel]);

  // Watch for spin completion
  if (wheel.winner && status === "轉盤旋轉中…") {
    setMapTarget(wheel.winner);
    setStatus(`今天吃：${wheel.winner.name}`);
    setIsWinnerModalOpen(true);
  }

  const handleRandomize = useCallback(() => {
    if (searchHook.restaurants.length === 0) {
      setStatus("目前沒有餐廳資料，請先搜尋");
      return;
    }
    wheel.fillRandom(searchHook.restaurants);
    setManualWheelIds([]);
    setStatus("已重新隨機產生轉盤內容");
  }, [searchHook.restaurants, wheel]);

  const handleToggleWheel = useCallback(
    (id: string) => {
      setManualWheelIds((prev) => {
        const exists = prev.includes(id);
        const nextIds = exists
          ? prev.filter((i) => i !== id)
          : prev.length < MAX_WHEEL_ITEMS
            ? [...prev, id]
            : prev;

        // Sync wheel items
        const selected = searchHook.restaurants.filter((r) =>
          nextIds.includes(r.id),
        );
        wheel.setItems(selected);
        return nextIds;
      });
    },
    [searchHook.restaurants, wheel],
  );

  const handleSelectRestaurant = useCallback(
    (restaurant: Restaurant) => {
      wheel.pickDirect(restaurant);
      setMapTarget(restaurant);
      setStatus(`你選擇了：${restaurant.name}`);
      setIsWinnerModalOpen(true);
    },
    [wheel],
  );

  const handleViewOnMap = useCallback((restaurant: Restaurant | FavoriteRestaurant) => {
    setMapTarget(restaurant as Restaurant);
  }, []);

  const handleAddFavoriteFromWinner = useCallback(async () => {
    if (wheel.winner) {
      await favs.add(wheel.winner);
    }
  }, [wheel.winner, favs]);

  return (
    <div className="min-h-screen bg-gray-50">
      <Header
        status={locationStatus ?? displayStatus}
        isLocating={geo.isLocating}
        isSearching={searchHook.isSearching}
        hasLocation={!!geo.location}
        onLocate={handleLocate}
        onSearch={handleSearch}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* Winner Modal */}
        <WinnerCard
          winner={wheel.winner}
          isFavorite={wheel.winner ? favs.isFavorite(wheel.winner.id) : false}
          isOpen={isWinnerModalOpen}
          onClose={() => setIsWinnerModalOpen(false)}
          onAddFavorite={handleAddFavoriteFromWinner}
          onViewOnMap={() => {
            if (wheel.winner) handleViewOnMap(wheel.winner);
          }}
        />

        {/* Main 2-column layout */}
        <div className="grid gap-6 lg:grid-cols-5">
          {/* Wheel - takes more space */}
          <div className="space-y-6 lg:col-span-3">
            <WheelSection
              items={wheel.items}
              selectedIndex={wheel.selectedIndex}
              isSpinning={wheel.isSpinning}
              onSpin={handleSpin}
              onRandomize={handleRandomize}
              onSelect={handleSelectRestaurant}
            />

            {/* Map */}
            <MapSection
              apiKey={googleMapsApiKey}
              location={geo.location}
              restaurants={searchHook.restaurants}
              mapTarget={mapTarget}
              onSelectRestaurant={handleSelectRestaurant}
            />
          </div>

          {/* Restaurant list - sidebar */}
          <div className="lg:col-span-2">
            <RestaurantList
              restaurants={searchHook.restaurants}
              manualWheelIds={manualWheelIds}
              onToggleWheel={handleToggleWheel}
              onSelect={handleSelectRestaurant}
              onViewOnMap={handleViewOnMap}
            />
          </div>
        </div>

        {/* Favorites - full width */}
        <FavoritesSection
          favorites={favs.favorites}
          onAddToWheel={wheel.addItem}
          onViewOnMap={handleViewOnMap}
          onRemove={favs.remove}
        />
      </main>
    </div>
  );
}
