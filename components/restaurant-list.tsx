"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import Container from "@/components/ui/container";
import SubContainer from "@/components/ui/subContainer";
import Top from "@/components/ui/top";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { RestaurantData } from "@/types/restaurant";
import { MAX_WHEEL_ITEMS, DISTANCE_BANDS, type DistanceBandKey } from "@/lib/constants";
import { Pagination } from "@/components/ui/pagination";
import { MapPinIcon, InfoIcon } from "@/components/icons";

type RestaurantListProps = {
  totalCount: number;
  pagedRestaurants: RestaurantData[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  manualWheelIds: string[];
  favoriteIds: string[];
  band: DistanceBandKey;
  hasLocation: boolean;
  isSearching: boolean;
  onToggleWheel: (id: string) => void;
  onSelect: (restaurant: RestaurantData) => void;
  onViewOnMap: (restaurant: RestaurantData) => void;
  onBandChange: (band: DistanceBandKey) => void;
};

export function RestaurantList({
  totalCount,
  pagedRestaurants,
  page,
  totalPages,
  onPageChange,
  manualWheelIds,
  favoriteIds,
  band,
  hasLocation,
  isSearching,
  onToggleWheel,
  onSelect,
  onViewOnMap,
  onBandChange,
}: RestaurantListProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <Container className="flex-1 min-h-0 flex flex-col">
      <Top>
        <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-2">
            <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">📋 附近餐廳</h2>
            <Badge variant="info">{totalCount} 間</Badge>
          </div>
          <DistanceControl onBandChange={onBandChange} hasLocation={hasLocation} isSearching={isSearching} band={band} />
        </div>
        {totalCount > 0 && (
          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
            勾選加入轉盤（最多 {MAX_WHEEL_ITEMS} 家）
          </p>
        )}
      </Top>
      <SubContainer className="flex-1 min-h-0 pb-0 flex flex-col">
        {totalCount === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">附近沒有餐廳</p>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-auto space-y-2 pb-2">
              {pagedRestaurants.map((restaurant) => {
                const checked = manualWheelIds.includes(restaurant.id);
                const isFav = favoriteIds.includes(restaurant.id);
                const wheelFull = manualWheelIds.length >= MAX_WHEEL_ITEMS;
                return (
                  <div
                    key={restaurant.id}
                    className={cn(
                      "flex items-center gap-2 sm:gap-3 rounded-xl border px-3 py-2.5 sm:px-4 sm:py-3 transition-all",
                      checked
                        ? "border-orange-200 bg-orange-50 dark:border-orange-800 dark:bg-orange-950"
                        : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50 dark:border-gray-700 dark:bg-gray-800 dark:hover:border-gray-600 dark:hover:bg-gray-750",
                    )}
                  >
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => onToggleWheel(restaurant.id)}
                      disabled={wheelFull && !checked}
                      className="h-5 w-5 shrink-0 rounded border-gray-300 text-orange-500 focus:ring-2 focus:ring-orange-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                      aria-label={`加入轉盤：${restaurant.name}`}
                    />

                    <div className="min-w-0 flex-1">
                      <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">
                        {restaurant.name}
                      </p>
                      {restaurant.address && (
                        <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">
                          {restaurant.address}
                        </p>
                      )}
                    </div>

                    <div className="flex shrink-0 items-center">
                      <span
                        className={cn("text-base leading-none", !isFav && "hidden")}
                        aria-label="已收藏"
                        aria-hidden={!isFav}
                      >
                        ❤️
                      </span>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onViewOnMap(restaurant)}
                        title="在地圖上查看"
                        className="min-h-11 min-w-11 px-2"
                      >
                        <MapPinIcon className="w-5 h-5" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => onSelect(restaurant)}
                        title="選擇此餐廳"
                        className="min-h-11 min-w-11 px-2"
                      >
                        <InfoIcon className="w-5 h-5" />
                      </Button>
                    </div>
                  </div>
                );
              })}

            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </SubContainer>
    </Container>
  );
}


const DistanceControl = (
  { onBandChange,
    hasLocation,
    isSearching,
    band,

  }: {
    onBandChange: RestaurantListProps["onBandChange"];
    hasLocation: RestaurantListProps["hasLocation"];
    isSearching: RestaurantListProps["isSearching"];
    band: RestaurantListProps["band"];
  }
) => {
  return (
    <div className="flex rounded-lg border border-gray-200 p-0.5 dark:border-gray-700">
      {DISTANCE_BANDS.map((b) => (
        <button
          key={b.key}
          type="button"
          onClick={() => onBandChange(b.key)}
          disabled={!hasLocation || isSearching}
          className={cn(
            "rounded-md px-3 py-2 text-xs font-medium transition-colors min-h-11 min-w-11",
            "cursor-pointer",
            band === b.key
              ? "bg-orange-500 text-white"
              : "text-gray-600 hover:bg-gray-100 dark:text-gray-400 dark:hover:bg-gray-800",
          )}
        >
          {b.label}
        </button>
      ))}
    </div>
  )
}


