"use client";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">❤️ 我的收藏</h2>
          <Badge>{favorites.length} 筆</Badge>
        </div>
      </CardHeader>
      <CardBody>
        {favorites.length === 0 ? (
          <div className="flex h-24 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-500">選好餐廳後點「加入收藏」即可保存</p>
          </div>
        ) : (
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
            {favorites.map((item) => (
              <div
                key={item.id}
                className="group rounded-xl border border-gray-100 bg-gray-50 p-4 transition-all hover:border-gray-200 hover:bg-white hover:shadow-sm"
              >
                <p className="font-medium text-gray-900">{item.name}</p>
                {item.address && (
                  <p className="mt-1 line-clamp-1 text-xs text-gray-500">
                    {item.address}
                  </p>
                )}
                <div className="mt-3 flex gap-1.5">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onAddToWheel(item)}
                  >
                    🎰 轉盤
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => onViewOnMap(item)}
                  >
                    📍 地圖
                  </Button>
                  <Button
                    variant="danger"
                    size="sm"
                    onClick={() => onRemove(item.id)}
                  >
                    移除
                  </Button>
                </div>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </Card>
  );
}
