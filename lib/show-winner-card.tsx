"use client";

import { createRoot } from "react-dom/client";
import { useState } from "react";
import { WinnerCard } from "@/components/winner-card";
import type { Restaurant } from "@/types/restaurant";

type ShowWinnerCardOptions = {
  winner: Restaurant;
  /** 傳入函數而非值，確保呼叫當下能取到最新狀態 */
  checkIsFavorite: () => boolean;
  onAddFavorite: () => Promise<void> | void;
  onViewOnMap: () => void;
};

/**
 * 內部 wrapper：讓 isFavorite 在 dialog 內部可響應更新
 */
function WinnerCardWrapper({
  winner,
  checkIsFavorite,
  onAddFavorite,
  onViewOnMap,
  onClose,
}: ShowWinnerCardOptions & { onClose: () => void }) {
  const [isFavorite, setIsFavorite] = useState(() => checkIsFavorite());

  const handleAddFavorite = async () => {
    await onAddFavorite();
    setIsFavorite(true);
  };

  return (
    <WinnerCard
      winner={winner}
      isFavorite={isFavorite}
      isOpen={true}
      onClose={onClose}
      onAddFavorite={handleAddFavorite}
      onViewOnMap={() => {
        onViewOnMap();
        onClose();
      }}
    />
  );
}

/**
 * 命令式呼叫 WinnerCard，類似 SweetAlert2 的 `Swal.fire()`
 *
 * @example
 * await showWinnerCard({
 *   winner: restaurant,
 *   checkIsFavorite: () => favs.isFavorite(restaurant.id),
 *   onAddFavorite: () => favs.add(restaurant),
 *   onViewOnMap: () => setMapTarget(restaurant),
 * });
 */
export function showWinnerCard(options: ShowWinnerCardOptions): Promise<void> {
  return new Promise((resolve) => {
    const container = document.createElement("div");
    document.body.appendChild(container);
    const root = createRoot(container);

    const cleanup = () => {
      // 延遲一幀讓離場動畫跑完
      setTimeout(() => {
        root.unmount();
        document.body.removeChild(container);
        resolve();
      }, 200);
    };

    root.render(<WinnerCardWrapper {...options} onClose={cleanup} />);
  });
}
