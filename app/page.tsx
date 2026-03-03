"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import type { FavoriteRestaurant, Restaurant } from "@/types/restaurant";
import type { DistanceBandKey } from "@/lib/constants";
import { DISTANCE_BANDS, MAX_WHEEL_ITEMS } from "@/lib/constants";
import { filterByDistance } from "@/lib/places-api";
import { useGeolocation } from "@/hooks/use-geolocation";
import { useRestaurantSearch } from "@/hooks/use-restaurant-search";
import { useWheel } from "@/hooks/use-wheel";
import { useFavorites } from "@/hooks/use-favorites";
import { Header } from "@/components/header";
import { WheelSection } from "@/components/wheel-section";
import { WinnerCard } from "@/components/winner-card";
import { showModal } from "@/lib/show-modal";
import { MapSection } from "@/components/map-section";
import { SidePanel } from "@/components/side-panel";
import { LocationPermissionModal } from "@/components/location-permission-modal";
import { LoadingOverlay } from "@/components/ui/loading-overlay";

export default function Home() {
  // region  --- Hooks ---
  const geo = useGeolocation();
  const searchHook = useRestaurantSearch();
  const wheel = useWheel();
  const favs = useFavorites();

  // region --- Local state ---
  const [manualWheelIds, setManualWheelIds] = useState<string[]>([]);
  const [mapTarget, setMapTarget] = useState<Restaurant | null>(null);
  const [band, setBand] = useState<DistanceBandKey>("near");

  // 掛載後自動定位
  useEffect(() => {
    geo.locate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // 定位成功且尚未搜尋時，自動搜尋一次
  useEffect(() => {
    if (geo.location && searchHook.allRestaurants.length === 0 && !searchHook.isSearching) {
      const location = geo.location;
      (async () => {
        const { filtered } = await searchHook.search(location);
        if (filtered.length === 0) {
          return;
        }
        wheel.fillRandom(filtered);
        setManualWheelIds([]);
      })();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [geo.location]);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;

  // --- Handlers ---
  const handleLocate = useCallback(() => {
    geo.locate();
  }, [geo]);

  /** 切換距離帶 — 純 client 端過濾，不再打 API */
  const handleBandChange = useCallback(
    (newBand: DistanceBandKey) => {
      setBand(newBand);
      if (!geo.location) return;

      const bandDef = DISTANCE_BANDS.find((b) => b.key === newBand)!;
      const location = geo.location;

      // 如果還沒搜尋過，先打一次 API
      if (searchHook.allRestaurants.length === 0) {
        (async () => {
          const { all } = await searchHook.search(location);
          searchHook.applyBand(newBand, location);
          const filtered = filterByDistance(all, location.lat, location.lng, bandDef.maxMeters);
          if (filtered.length > 0) {
            wheel.fillRandom(filtered);
            setManualWheelIds([]);
          }
        })();
        return;
      }

      // 已有快取資料，純 client 端過濾
      searchHook.applyBand(newBand, location);
      const filtered = filterByDistance(
        searchHook.allRestaurants,
        location.lat,
        location.lng,
        bandDef.maxMeters,
      );

      if (filtered.length > 0) {
        wheel.fillRandom(filtered);
        setManualWheelIds([]);
      }
    },
    [geo.location, searchHook, wheel],
  );

  const handleSpin = useCallback(() => {
    if (wheel.items.length === 0) return;
    wheel.spin();
  }, [wheel]);

  const handleRandomize = useCallback(() => {
    if (searchHook.restaurants.length === 0) return;
    wheel.fillRandom(searchHook.restaurants);
    setManualWheelIds([]);
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
      showModal(
        <WinnerCard
          winner={restaurant}
          checkIsFavorite={() => favs.isFavorite(restaurant.id)}
          onAddFavorite={() => favs.add(restaurant)}
          onRemoveFavorite={() => favs.remove(restaurant.id)}
        />,
      );
    },
    [wheel, favs],
  );

  const handleViewOnMap = useCallback((restaurant: Restaurant | FavoriteRestaurant) => {
    setMapTarget(restaurant as Restaurant);
  }, []);

  // 偵測轉盤從「旋轉中」→「停止且有贏家」的時機，呼叫 handleSelectRestaurant
  const prevIsSpinningRef = useRef(false);
  useEffect(() => {
    const wasSpinning = prevIsSpinningRef.current;
    prevIsSpinningRef.current = wheel.isSpinning;
    if (wasSpinning && !wheel.isSpinning && wheel.winner) {
      handleSelectRestaurant(wheel.winner);
    }
  }, [wheel.isSpinning, wheel.winner, handleSelectRestaurant]);




// region --- Render ---

  return (
    <div className="min-h-screen bg-gray-50">
      <LoadingOverlay isLoading={geo.isLocating} message="正在定位中…" fullscreen />
      <Header
        // status={locationStatus ?? displayStatus}
        isLocating={geo.isLocating}
        hasFailed={!!geo.error || geo.permissionDenied}
        onLocate={handleLocate}
      />

      <main className="mx-auto max-w-6xl space-y-6 px-4 py-6 sm:px-6">
        {/* Location Permission Modal */}
        <LocationPermissionModal
          isOpen={geo.permissionDenied}
          onClose={geo.clearPermissionDenied}
          onRetry={geo.locate}
        />

        {/* Main 2-column layout */}
        <div className="grid gap-6 lg:grid-cols-5">
          <div className="space-y-6 lg:col-span-3">
            <WheelSection
              items={wheel.items}
              selectedIndex={wheel.selectedIndex}
              isSpinning={wheel.isSpinning}
              onSpin={handleSpin}
              onRandomize={handleRandomize}
              onSelect={handleSelectRestaurant}
            />

            <MapSection
              apiKey={googleMapsApiKey}
              location={geo.location}
              restaurants={searchHook.restaurants}
              mapTarget={mapTarget}
              onSelectRestaurant={handleSelectRestaurant}
            />
          </div>

          <div className="lg:col-span-2">
            <SidePanel
              totalCount={searchHook.restaurants.length}
              pagedRestaurants={searchHook.pagedRestaurants}
              page={searchHook.page}
              totalPages={searchHook.totalPages}
              onPageChange={searchHook.setPage}
              manualWheelIds={manualWheelIds}
              favoriteIds={favs.favorites.map((f) => f.id)}
              band={band}
              hasLocation={!!geo.location}
              isSearching={searchHook.isSearching}
              onToggleWheel={handleToggleWheel}
              onSelect={handleSelectRestaurant}
              onViewOnMap={handleViewOnMap}
              onBandChange={handleBandChange}
              favorites={favs.favorites}
              pagedFavorites={favs.pagedFavorites}
              favPage={favs.page}
              favTotalPages={favs.totalPages}
              onFavPageChange={favs.setPage}
              onAddToWheel={wheel.addItem}
              onRemoveFavorite={favs.remove}
            />
          </div>
        </div>
      </main>
    </div>
  );
}
