"use client";

import { useRef } from "react";
import { cn } from "@/lib/utils";
import { CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Pagination } from "@/components/ui/pagination";
import type { FavoriteRestaurant } from "@/types/restaurant";
import { MAX_WHEEL_ITEMS } from "@/lib/constants";
import Image from "next/image";

type FavoritesSectionProps = {
  favorites: FavoriteRestaurant[];
  pagedFavorites: FavoriteRestaurant[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  manualWheelIds: string[];
  onToggleWheel: (id: string) => void;
  onSelect: (fav: FavoriteRestaurant) => void;
  onRemove: (id: string) => void;
};

export function FavoritesSection({
  favorites,
  pagedFavorites,
  page,
  totalPages,
  onPageChange,
  manualWheelIds,
  onToggleWheel,
  onSelect,
  onRemove,
}: FavoritesSectionProps) {
  const scrollRef = useRef<HTMLDivElement>(null);

  const handlePageChange = (newPage: number) => {
    onPageChange(newPage);
    scrollRef.current?.scrollTo({ top: 0, behavior: "smooth" });
  };

  return (
    <CardBody className="flex-1 min-h-0 pb-0 flex flex-col">
      {favorites.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
          <p className="text-sm text-gray-500 dark:text-gray-400">選好餐廳後點「加入收藏」即可保存</p>
        </div>
      ) : (
        <>
          {favorites.length > 0 && (
            <p className="mb-2 text-xs text-gray-500 dark:text-gray-400">
              勾選加入轉盤（最多 {MAX_WHEEL_ITEMS} 家）
            </p>
          )}
          <div ref={scrollRef} className="flex-1 overflow-auto space-y-2 pb-2">
            {pagedFavorites.map((item) => {
              const checked = manualWheelIds.includes(item.id);
              const wheelFull = manualWheelIds.length >= MAX_WHEEL_ITEMS;
              return (
                <div
                  key={item.id}
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
                    onChange={() => onToggleWheel(item.id)}
                    disabled={wheelFull && !checked}
                    className="h-5 w-5 shrink-0 rounded border-gray-300 text-orange-500 focus:ring-2 focus:ring-orange-500 cursor-pointer disabled:cursor-not-allowed disabled:opacity-40"
                    aria-label={`加入轉盤：${item.name}`}
                  />

                  <span className="text-base leading-none" aria-label="已收藏">
                    ❤️
                  </span>

                  <div className="min-w-0 flex-1">
                    <p className="truncate text-sm font-medium text-gray-900 dark:text-gray-100">{item.name}</p>
                    {item.address && (
                      <p className="mt-0.5 truncate text-xs text-gray-500 dark:text-gray-400">{item.address}</p>
                    )}
                  </div>

                  <div className="flex shrink-0 items-center">
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => onSelect(item)}
                      title="詳細資訊"
                      className="min-h-11 min-w-11 px-2"
                    >
                      <Image
                        src="/icons/info.svg"
                        alt="詳細資訊"
                        width={20}
                        height={20}
                        className="text-gray-600"
                      />
                    </Button>
                    <Button
                      variant="danger"
                      size="sm"
                      onClick={() => onRemove(item.id)}
                      title="移除收藏"
                      className="min-h-11 min-w-11 px-2"
                    >
                      🗑️
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
  );
}
