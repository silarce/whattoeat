"use client";

import { useRef } from "react";
import Image from "next/image";
import { cn } from "@/lib/utils";
import { CardContainer, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/types/restaurant";
import { MAX_WHEEL_ITEMS, DISTANCE_BANDS, type DistanceBandKey } from "@/lib/constants";
import { Pagination } from "@/components/ui/pagination";

type RestaurantListProps = {
  totalCount: number;
  pagedRestaurants: Restaurant[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  manualWheelIds: string[];
  favoriteIds: string[];
  band: DistanceBandKey;
  hasLocation: boolean;
  isSearching: boolean;
  onToggleWheel: (id: string) => void;
  onSelect: (restaurant: Restaurant) => void;
  onViewOnMap: (restaurant: Restaurant) => void;
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
    <CardContainer>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">📋 附近餐廳</h2>
          <div className="flex items-center gap-4">
            <DistanceControl onBandChange={onBandChange} hasLocation={hasLocation} isSearching={isSearching} band={band} />
            <Badge variant="info">{totalCount} 間</Badge>
          </div>
        </div>
        <div className="mt-2 flex items-center justify-between">

          {totalCount > 0 && (
            <p className="text-xs text-gray-500">
              勾選加入轉盤（最多 {MAX_WHEEL_ITEMS} 家）
            </p>
          )}
        </div>
      </CardHeader>
      <CardBody className="h-130.5 pb-0 flex flex-col">
        {totalCount === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-500">點擊「搜尋附近餐廳」開始探索</p>
          </div>
        ) : (
          <>
            <div ref={scrollRef} className="flex-1 overflow-auto space-y-2 pb-2">
            {pagedRestaurants.map((restaurant) => {
              const checked = manualWheelIds.includes(restaurant.id);
              const isFav = favoriteIds.includes(restaurant.id);
              return (
                <div
                  key={restaurant.id}
                  className={cn(
                    "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all",
                    checked
                      ? "border-orange-200 bg-orange-50"
                      : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleWheel(restaurant.id)}
                    className="h-4 w-4 shrink-0 rounded border-gray-300 text-orange-500 focus:ring-2 focus:ring-orange-500 cursor-pointer"
                    aria-label={`加入轉盤：${restaurant.name}`}
                  />

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900">
                      {restaurant.name}
                    </p>
                    {restaurant.address && (
                      <p className="mt-0.5 truncate text-xs text-gray-500">
                        {restaurant.address}
                      </p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center gap-1">
                    <span
                      className={cn("text-base leading-none", !isFav && "invisible")}
                      aria-label="已收藏"
                      aria-hidden={!isFav}
                    >
                      ❤️
                    </span>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => onViewOnMap(restaurant)}
                      title="在地圖上查看"
                    >
                      <Image
                        src="/icons/map-pin.svg"
                        alt="地圖標記"
                        width={24}
                        height={24}
                        className="text-gray-600"
                      />
                    </Button>
                    <Button
                      variant="ghost"
                      size="lg"
                      onClick={() => onSelect(restaurant)}
                      title="選擇此餐廳"
                    >
                      <Image
                        src="/icons/info.svg"
                        alt="詳細資訊"
                        width={24}
                        height={24}
                        className="text-gray-600"
                      />
                    </Button>
                  </div>
                </div>
              );
            })}

            </div>
            <Pagination page={page} totalPages={totalPages} onPageChange={handlePageChange} />
          </>
        )}
      </CardBody>
    </CardContainer>
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
    <div className="flex rounded-lg border border-gray-200 p-0.5">
      {DISTANCE_BANDS.map((b) => (
        <button
          key={b.key}
          type="button"
          onClick={() => onBandChange(b.key)}
          disabled={!hasLocation || isSearching}
          className={cn(
            "rounded-md px-3 py-1 text-xs font-medium transition-colors",
            "cursor-pointer",
            band === b.key
              ? "bg-orange-500 text-white"
              : "text-gray-600 hover:bg-gray-100",
          )}
        >
          {b.label}
        </button>
      ))}
    </div>
  )
}


