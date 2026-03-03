"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { useModalClose } from "@/lib/show-modal";
import type { Restaurant } from "@/types/restaurant";

type WinnerCardProps = {
  winner: Restaurant;
  checkIsFavorite: () => boolean;
  onAddFavorite: () => Promise<void> | void;
  onRemoveFavorite: () => Promise<void> | void;
};

function StarRating({ rating }: { rating: number }) {
  return (
    <div className="flex items-center gap-1.5">
      <div className="flex">
        {[1, 2, 3, 4, 5].map((star) => {
          const filled = rating >= star;
          const half = !filled && rating >= star - 0.5;
          return (
            <span key={star} className={half || filled ? "text-amber-400" : "text-gray-200"}>
              {half ? "⭐" : "★"}
            </span>
          );
        })}
      </div>
      <span className="text-sm font-semibold text-gray-700">{rating.toFixed(1)}</span>
    </div>
  );
}

export function WinnerCard({
  winner,
  checkIsFavorite,
  onAddFavorite,
  onRemoveFavorite,
}: WinnerCardProps) {
  const close = useModalClose();
  const [isFavorite, setIsFavorite] = useState(() => checkIsFavorite());
  const [loading, setLoading] = useState(false);

  const handleToggleFavorite = async () => {
    setLoading(true);
    try {
      if (isFavorite) {
        await onRemoveFavorite();
        setIsFavorite(false);
      } else {
        await onAddFavorite();
        setIsFavorite(true);
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-sm rounded-2xl bg-white shadow-2xl overflow-hidden">
      {/* 頂部橫幅 */}
      <div className="bg-gradient-to-r from-orange-500 to-orange-400 px-6 py-4">
        <div className="flex items-center justify-between">
          <p className="text-3xl font-bold text-orange-100 tracking-wide">🎉 今天就吃這家！</p>
          <button
            onClick={close}
            className="flex h-7 w-7 items-center justify-center rounded-full bg-white/20 text-white hover:bg-white/30 transition-colors"
            aria-label="關閉"
          >
            ✕
          </button>
        </div>
        <h2 className="mt-2 text-2xl font-bold text-white leading-tight">
          {winner.name}
        </h2>
        {winner.rating && <StarRating rating={winner.rating} />}
      </div>

      {/* 資訊區 */}
      <div className="px-6 py-4 space-y-2.5">
        {winner.openNow !== undefined && (
          <div className="flex items-center gap-2">
            <span className={`h-2 w-2 rounded-full shrink-0 ${winner.openNow ? "bg-green-500" : "bg-red-400"}`} />
            <span className={`text-sm font-medium ${winner.openNow ? "text-green-700" : "text-red-600"}`}>
              {winner.openNow ? "營業中" : "已打烊"}
            </span>
          </div>
        )}
        {winner.address && (
          <div className="flex items-start gap-2 text-sm text-gray-600">
            <span className="shrink-0 mt-0.5">📍</span>
            <span>{winner.address}</span>
          </div>
        )}
        {winner.phone && (
          <div className="flex items-center gap-2 text-sm text-gray-600">
            <span className="shrink-0">📞</span>
            <a href={`tel:${winner.phone}`} className="hover:text-orange-500 transition-colors">
              {winner.phone}
            </a>
          </div>
        )}
      </div>

      {/* 操作區 */}
      <div className="px-6 pb-6 space-y-2">
        {winner.id && (
          <Button
            variant="primary"
            size="md"
            onClick={() =>
              window.open(
                `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(winner.name)}&query_place_id=${winner.id}`,
                "_blank",
              )
            }
            className="w-full"
          >
            🗺️ 在 Google 地圖開啟
          </Button>
        )}
        <Button
          variant={isFavorite ? "danger" : "secondary"}
          size="md"
          onClick={handleToggleFavorite}
          disabled={loading}
          className="w-full"
        >
          {loading ? "處理中…" : isFavorite ? "🗑️ 取消收藏" : "❤️ 加入收藏"}
        </Button>
        <Button variant="ghost" size="md" onClick={close} className="w-full">
          關閉
        </Button>
      </div>
    </div>
  );
}
