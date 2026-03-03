"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useModalClose } from "@/lib/show-modal";
import type { Restaurant } from "@/types/restaurant";

type WinnerCardProps = {
  winner: Restaurant;
  checkIsFavorite: () => boolean;
  onAddFavorite: () => Promise<void> | void;
};

export function WinnerCard({
  winner,
  checkIsFavorite,
  onAddFavorite,
}: WinnerCardProps) {
  const close = useModalClose();
  const [isFavorite, setIsFavorite] = useState(() => checkIsFavorite());

  return (
    <div className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl">
      <div className="space-y-4">
        {/* Header */}
        <div className="flex items-start justify-between">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
              🎉 今天就吃這家
            </p>
            <h2 className="mt-2 text-2xl font-bold text-gray-900">
              {winner.name}
            </h2>
          </div>
          <button
            onClick={close}
            className="inline-flex h-6 w-6 items-center justify-center text-2xl text-gray-400 hover:text-gray-600"
            aria-label="關閉"
          >
            ✕
          </button>
        </div>

        {/* Content */}
        {winner.address && (
          <p className="text-sm text-gray-600">{winner.address}</p>
        )}

        {/* Actions */}
        <div className="space-y-2">
          <Button
            variant="secondary"
            size="md"
            onClick={async () => { await onAddFavorite(); setIsFavorite(true); }}
            disabled={isFavorite}
            className="w-full"
          >
            {isFavorite ? "✅ 已收藏" : "❤️ 加入收藏"}
          </Button>
          {winner.id && (
            <Button
              variant="ghost"
              size="md"
              onClick={() =>
                window.open(
                  `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(winner.name)}&query_place_id=${winner.id}`,
                  "_blank",
                )
              }
              className="w-full"
            >
              🗺️ Google 地圖
            </Button>
          )}
        </div>

        {/* Close Button */}
        <Button variant="ghost" size="md" onClick={close} className="w-full">
          關閉
        </Button>
      </div>
    </div>
  );
}
