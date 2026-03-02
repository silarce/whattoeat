"use client";

import { cn } from "@/lib/utils";
import { CardBody } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { FavoriteRestaurant } from "@/types/restaurant";

type FavoritesSectionProps = {
  favorites: FavoriteRestaurant[];
  onAddToWheel: (fav: FavoriteRestaurant) => void;
  onViewOnMap: (fav: FavoriteRestaurant) => void;
  onRemove: (id: string) => void;
};

export function FavoritesSection({
  favorites,
  onAddToWheel,
  onViewOnMap,
  onRemove,
}: FavoritesSectionProps) {
  return (
    <CardBody>
      {favorites.length === 0 ? (
        <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
          <p className="text-sm text-gray-500">選好餐廳後點「加入收藏」即可保存</p>
        </div>
      ) : (
        <div className="space-y-2">
          {favorites.map((item) => (
            <div
              key={item.id}
              className={cn(
                "flex items-center gap-3 rounded-xl border px-4 py-3 transition-all",
                "border-gray-100 bg-white hover:border-gray-200 hover:bg-gray-50",
              )}
            >
              <span className="text-base leading-none" aria-label="已收藏">
                ❤️
              </span>

              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-medium text-gray-900">{item.name}</p>
                {item.address && (
                  <p className="mt-0.5 truncate text-xs text-gray-500">{item.address}</p>
                )}
              </div>

              <div className="flex shrink-0 items-center gap-1">
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onAddToWheel(item)}
                  title="加入轉盤"
                >
                  🎰
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => onViewOnMap(item)}
                  title="在地圖上查看"
                >
                  🗺️
                </Button>
                <Button
                  variant="danger"
                  size="sm"
                  onClick={() => onRemove(item.id)}
                  title="移除收藏"
                >
                  🗑️
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </CardBody>
  );
}
