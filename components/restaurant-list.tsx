"use client";

import { cn } from "@/lib/utils";
import { CardContainer, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/types/restaurant";
import { MAX_WHEEL_ITEMS } from "@/lib/constants";

type RestaurantListProps = {
  totalCount: number;
  pagedRestaurants: Restaurant[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  manualWheelIds: string[];
  onToggleWheel: (id: string) => void;
  onSelect: (restaurant: Restaurant) => void;
  onViewOnMap: (restaurant: Restaurant) => void;
};

export function RestaurantList({
  totalCount,
  pagedRestaurants,
  page,
  totalPages,
  onPageChange,
  manualWheelIds,
  onToggleWheel,
  onSelect,
  onViewOnMap,
}: RestaurantListProps) {

  return (
    <CardContainer>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">📋 附近餐廳</h2>
          <Badge variant="info">{totalCount} 家</Badge>
        </div>
        {totalCount > 0 && (
          <p className="mt-1 text-xs text-gray-500">
            勾選可手動加入轉盤（最多 {MAX_WHEEL_ITEMS} 家）
          </p>
        )}
      </CardHeader>
      <CardBody>
        {totalCount === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-500">點擊「搜尋附近餐廳」開始探索</p>
          </div>
        ) : (
          <div className="space-y-2">
            {pagedRestaurants.map((restaurant) => {
              const checked = manualWheelIds.includes(restaurant.id);
              return (
                <div
                  key={restaurant.id}
                  className={cn(
                    "group flex items-center gap-3 rounded-xl border px-4 py-3 transition-all",
                    checked
                      ? "border-orange-200 bg-orange-50"
                      : "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50",
                  )}
                >
                  <input
                    type="checkbox"
                    checked={checked}
                    onChange={() => onToggleWheel(restaurant.id)}
                    className="h-4 w-4 shrink-0 rounded border-gray-300 text-orange-500 focus:ring-2 focus:ring-orange-500"
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

                  <div className="flex shrink-0 gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onViewOnMap(restaurant)}
                    >
                      📍
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelect(restaurant)}
                    >
                      ✅
                    </Button>
                  </div>
                </div>
              );
            })}

            {/* 翻頁控制 */}
            {totalPages > 1 && (
              <div className="flex items-center justify-between border-t border-gray-100 pt-3">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(page - 1)}
                  disabled={page === 0}
                >
                  ← 上一頁
                </Button>
                <span className="text-xs text-gray-500">
                  {page + 1} / {totalPages}
                </span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onPageChange(page + 1)}
                  disabled={page >= totalPages - 1}
                >
                  下一頁 →
                </Button>
              </div>
            )}
          </div>
        )}
      </CardBody>
    </CardContainer>
  );
}
