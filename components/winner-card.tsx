"use client";

import * as Dialog from "@radix-ui/react-dialog";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/types/restaurant";

type WinnerCardProps = {
  winner: Restaurant | null;
  isFavorite: boolean;
  isOpen: boolean;
  onClose: () => void;
  onAddFavorite: () => void;
  onViewOnMap: () => void;
};

export function WinnerCard({
  winner,
  isFavorite,
  isOpen,
  onClose,
  onAddFavorite,
  onViewOnMap,
}: WinnerCardProps) {
  if (!winner) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={onClose}>
      <Dialog.Portal>
        {/* Backdrop */}
        <Dialog.Overlay className="fixed inset-0 z-40 bg-black/50" />

        {/* Modal Content */}
        <Dialog.Content className="fixed left-1/2 top-1/2 z-50 w-full max-w-md -translate-x-1/2 -translate-y-1/2 transform rounded-2xl bg-white p-6 shadow-2xl focus:outline-none">
          <div className="space-y-4">
            {/* Header */}
            <div className="flex items-start justify-between">
              <div>
                <p className="text-xs font-semibold uppercase tracking-wider text-orange-600">
                  🎉 今天就吃這家
                </p>
                <Dialog.Title className="mt-2 text-2xl font-bold text-gray-900">
                  {winner.name}
                </Dialog.Title>
              </div>
              <Dialog.Close className="inline-flex h-6 w-6 items-center justify-center text-2xl text-gray-400 hover:text-gray-600">
                ✕
              </Dialog.Close>
            </div>

            {/* Content */}
            {winner.address && (
              <p className="text-sm text-gray-600">{winner.address}</p>
            )}

            {/* Actions */}
            <div className="space-y-2">
              <Button
                variant="primary"
                size="md"
                onClick={() => {
                  onViewOnMap();
                  onClose();
                }}
                className="w-full"
              >
                📍 地圖查看
              </Button>
              <Button
                variant="secondary"
                size="md"
                onClick={onAddFavorite}
                disabled={isFavorite}
                className="w-full"
              >
                {isFavorite ? "✅ 已收藏" : "❤️ 加入收藏"}
              </Button>
              {winner.lat && winner.lng && (
                <Button
                  variant="ghost"
                  size="md"
                  onClick={() =>
                    window.open(
                      `https://www.google.com/maps/search/?api=1&query=${winner.lat},${winner.lng}`,
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
            <Dialog.Close asChild>
              <Button
                variant="ghost"
                size="md"
                className="w-full"
              >
                關閉
              </Button>
            </Dialog.Close>
          </div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
}
