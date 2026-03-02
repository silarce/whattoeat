"use client";

import { useCallback, useRef, useState } from "react";
import type { Restaurant } from "@/types/restaurant";
import { pickRandom } from "@/lib/utils";
import {
  MAX_WHEEL_ITEMS,
  WHEEL_TOTAL_TICKS,
  WHEEL_TICK_INTERVAL,
} from "@/lib/constants";

type WheelState = {
  items: Restaurant[];
  selectedIndex: number;
  isSpinning: boolean;
  winner: Restaurant | null;
};

/**
 * 封裝轉盤抽選邏輯的 hook
 */
export function useWheel() {
  const [state, setState] = useState<WheelState>({
    items: [],
    selectedIndex: 0,
    isSpinning: false,
    winner: null,
  });
  const timerRef = useRef<number | null>(null);

  /** 以隨機選取的餐廳填入轉盤 */
  const fillRandom = useCallback((restaurants: Restaurant[]) => {
    const picked = pickRandom(restaurants, MAX_WHEEL_ITEMS);
    setState({
      items: picked,
      selectedIndex: 0,
      isSpinning: false,
      winner: null,
    });
    return picked;
  }, []);

  /** 手動設定轉盤項目 */
  const setItems = useCallback((items: Restaurant[]) => {
    setState((prev) => ({
      ...prev,
      items: items.slice(0, MAX_WHEEL_ITEMS),
    }));
  }, []);

  /** 加入單一項目到轉盤 */
  const addItem = useCallback((item: Restaurant) => {
    setState((prev) => {
      if (
        prev.items.length >= MAX_WHEEL_ITEMS ||
        prev.items.some((i) => i.id === item.id)
      ) {
        return prev;
      }
      return { ...prev, items: [...prev.items, item] };
    });
  }, []); 

  /** 直接挑選某餐廳為贏家 (不經轉盤動畫) */
  const pickDirect = useCallback((restaurant: Restaurant) => {
    setState((prev) => {
      const nextIndex = prev.items.findIndex((item) => item.id === restaurant.id);
      return {
        ...prev,
        selectedIndex: nextIndex >= 0 ? nextIndex : prev.selectedIndex,
        winner: restaurant,
        isSpinning: false,
      };
    });
  }, []);

  /** 立即選出贏家 (搜尋後自動抽選) */
  const autoSelect = useCallback((items: Restaurant[]) => {
    const finalIndex = Math.floor(Math.random() * items.length);
    const selected = items[finalIndex];
    setState((prev) => ({
      ...prev,
      items,
      selectedIndex: finalIndex,
      winner: selected,
    }));
    return selected;
  }, []);

  /** 執行轉盤旋轉動畫 */
  const spin = useCallback(() => {
    setState((prev) => {
      if (prev.items.length === 0 || prev.isSpinning) return prev;
      return { ...prev, isSpinning: true, winner: null };
    });

    let ticks = 0;
    let current = 0;

    // 需要在函式外取得最新的 items
    timerRef.current = window.setInterval(() => {
      setState((prev) => {
        if (!prev.isSpinning) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          return prev;
        }

        current = (current + 1) % prev.items.length;
        ticks += 1;

        if (ticks >= WHEEL_TOTAL_TICKS) {
          if (timerRef.current) window.clearInterval(timerRef.current);
          const finalIndex = Math.floor(Math.random() * prev.items.length);
          const selected = prev.items[finalIndex];
          return {
            ...prev,
            selectedIndex: finalIndex,
            winner: selected,
            isSpinning: false,
          };
        }

        return { ...prev, selectedIndex: current };
      });
    }, WHEEL_TICK_INTERVAL);
  }, []);

  return {
    ...state,
    fillRandom,
    setItems,
    addItem,
    pickDirect,
    autoSelect,
    spin,
  };
}
