"use client";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/types/restaurant";

type WinnerCardProps = {
  winner: Restaurant;
  isFavorite: boolean;
  onAddFavorite: () => void;
  onViewOnMap: () => void;
};

export function WinnerCard({
  winner,
  isFavorite,
  onAddFavorite,
  onViewOnMap,
}: WinnerCardProps) {
  return (
    <Card className="ring-2 ring-orange-200 bg-gradient-to-br from-orange-50 to-amber-50">
      <CardHeader>
        <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
          🎉 今天就吃這家
        </p>
      </CardHeader>
      <CardBody className="pt-2">
        <h3 className="text-xl font-bold text-gray-900">{winner.name}</h3>
        {winner.address && (
          <p className="mt-1 text-sm text-gray-600">{winner.address}</p>
        )}
        <div className="mt-4 flex gap-2">
          <Button
            variant="primary"
            size="sm"
            onClick={onViewOnMap}
          >
            📍 地圖查看
          </Button>
          <Button
            variant="secondary"
            size="sm"
            onClick={onAddFavorite}
            disabled={isFavorite}
          >
            {isFavorite ? "✅ 已收藏" : "❤️ 加入收藏"}
          </Button>
          {winner.lat && winner.lng && (
            <Button
              variant="ghost"
              size="sm"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${winner.lat},${winner.lng}`,
                  "_blank",
                )
              }
            >
              🗺️ Google 地圖
            </Button>
          )}
        </div>
      </CardBody>
    </Card>
  );
}
