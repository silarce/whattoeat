"use client";

import { useCallback, useEffect, useState } from "react";
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
import { LocationPermissionModal } from "@/components/location-permission-modal";

export default function Home() {
  // --- Hooks ---
  const geo = useGeolocation();
  const searchHook = useRestaurantSearch();
  const wheel = useWheel();
  const favs = useFavorites();

  // --- Local state ---
  const [status, setStatus] = useState("定位中…");
  const [manualWheelIds, setManualWheelIds] = useState<string[]>([]);
  const [mapTarget, setMapTarget] = useState<Restaurant | null>(null);
  const [isWinnerModalOpen, setIsWinnerModalOpen] = useState(false);
  const [radius, setRadius] = useState(100);

  // 挂載後自動定位
  useEffect(() => {
    geo.locate();
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 定位成功且這是首次時，自動搜尋 100m 内的餐廳
  useEffect(() => {
    if (geo.location && searchHook.restaurants.length === 0 && !searchHook.isSearching) {
      const location = geo.location;
      (async () => {
        setStatus("搜尋附近餐廳中…");
        const results = await searchHook.search(location, 100);
        if (results.length === 0) {
          setStatus("附近找不到餐廳，請改變半徑或位置");
          return;
        }
        const picked = wheel.fillRandom(results);
        setManualWheelIds([]);
        setStatus(`已找到 ${results.length} 家餐廳，你可以點擊轉盤來選擇`);
      })();
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.location]);

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
    geo.location && !geo.isLocating
      ? "定位成功，請設定事始半徑並搜尋餐廳"
      : undefined;

  const handleSearch = useCallback(async () => {
    if (!geo.location) {
      setStatus("請先完成定位");
      return;
    }

    setStatus("搜尋附近餐廳中…");
    const results = await searchHook.search(geo.location, radius);

    if (results.length === 0) {
      setStatus("附近找不到餐廳，請嘗試其他地點");
      return;
    }

    // 只填入轉盤，不自動投丫推荐
    const picked = wheel.fillRandom(results);
    setManualWheelIds([]);
    setStatus(`已找到 ${results.length} 家餐廳，你可以鑿擋鐫馬來骋馬`);
  }, [geo.location, searchHook, wheel, radius]);

  const handleSpin = useCallback(() => {
    if (wheel.items.length === 0) {
      setStatus("就儀並沒有餐廳，請先搜尋");
      return;
    }
    wheel.spin();
    setStatus("轉盤旋轉中…");
  }, [wheel]);

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
        radius={radius}
        onLocate={handleLocate}
        onRadiusChange={(newRadius) => {
          setRadius(newRadius);
          // 切換半徑時立即執行搜尋
          if (geo.location) {
            const location = geo.location;
            (async () => {
              setStatus("搜尋附近餐廳中…");
              const results = await searchHook.search(location, newRadius);
              if (results.length === 0) {
                setStatus("附近找不到餐廳，請嘗試其他地點");
                return;
              }
              const picked = wheel.fillRandom(results);
              setManualWheelIds([]);
              setStatus(`已找到 ${results.length} 家餐廳，你可以鑿擋鐫馬來骋馬`);
            })();
          }
        }}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* Location Permission Modal */}
        <LocationPermissionModal
          isOpen={geo.permissionDenied}
          onClose={geo.clearPermissionDenied}
          onRetry={geo.locate}
        />

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
