"use client";

import { useCallback, useRef, useState } from "react";
import type { Restaurant } from "@/types/restaurant";
import { pickRandom } from "@/lib/utils";
import {
  MAX_WHEEL_ITEMS,
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
    selectedIndex: -1,
    isSpinning: false,
    winner: null,
  });
  const timerRef = useRef<number | null>(null);
  // ref 鏡像，讓 spin() 不需要依賴 state 就能讀到最新項目
  const itemsRef = useRef<Restaurant[]>([]);
  const isSpinningRef = useRef(false);

  /** 以隨機選取的餐廳填入轉盤 */
  const fillRandom = useCallback((restaurants: Restaurant[]) => {
    const picked = pickRandom(restaurants, MAX_WHEEL_ITEMS);
    itemsRef.current = picked;
    setState({
      items: picked,
      selectedIndex: -1,
      isSpinning: false,
      winner: null,
    });
    return picked;
  }, []);

  /** 手動設定轉盤項目 */
  const setItems = useCallback((items: Restaurant[]) => {
    const next = items.slice(0, MAX_WHEEL_ITEMS);
    itemsRef.current = next;
    setState((prev) => {
      // 找出目前被選中的餐廳 ID
      const selectedId = prev.selectedIndex >= 0
        ? prev.items[prev.selectedIndex]?.id
        : undefined;
      // 在新陣列中尋找同一間餐廳
      const newSelectedIndex = selectedId !== undefined
        ? next.findIndex((r) => r.id === selectedId)
        : -1;
      return {
        ...prev,
        items: next,
        selectedIndex: newSelectedIndex,
        // 若選中餐廳已被移除，同步清除 winner
        winner: newSelectedIndex >= 0 ? prev.winner : null,
      };
    });
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
      const next = [...prev.items, item];
      itemsRef.current = next;
      return { ...prev, items: next };
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

  /** 清除選中狀態（保留轉盤項目，只雜置 winner / selectedIndex） */
  const clearSelection = useCallback(() => {
    setState((prev) => ({ ...prev, selectedIndex: -1, winner: null }));
  }, []);

  /** 執行轉盤旋轉動畫 */
  const spin = useCallback(() => {
    const items = itemsRef.current;
    if (items.length === 0 || isSpinningRef.current) return;
    isSpinningRef.current = true;

    // --- 在 setState 之外預先計算所有亂數，避免 Strict Mode double-invoke 問題 ---
    const TICKS = 30;      // 動畫總格數
    const MIN_DELAY = 55;  // 最快間隔 (ms)
    const MAX_DELAY = 260; // 最慢間隔 (ms)，緩速停止

    // 決定最終贏家
    const finalIndex = Math.floor(Math.random() * items.length);

    // 建立索引路徑：完全隨機且不重複相鄰格，最後一格固定為贏家
    const path: number[] = [];
    let last = -1;
    for (let i = 0; i < TICKS - 1; i++) {
      let idx: number;
      if (items.length === 1) {
        idx = 0;
      } else {
        do { idx = Math.floor(Math.random() * items.length); } while (idx === last);
      }
      path.push(idx);
      last = idx;
    }
    path.push(finalIndex);

    // ease-out 延遲時間表：二次方加速緩停
    const delays = path.map((_, i) => {
      const t = i / (TICKS - 1);
      return Math.round(MIN_DELAY + (MAX_DELAY - MIN_DELAY) * t * t);
    });

    setState((prev) => ({ ...prev, isSpinning: true, winner: null }));

    // 用 setTimeout 鏈接，比 setInterval 更精準
    let elapsed = 0;
    path.forEach((idx, i) => {
      elapsed += delays[i];
      const isLast = i === path.length - 1;
      timerRef.current = window.setTimeout(() => {
        if (isLast) {
          isSpinningRef.current = false;
          setState((prev) => ({
            ...prev,
            selectedIndex: idx,
            winner: items[idx],
            isSpinning: false,
          }));
        } else {
          setState((prev) => ({ ...prev, selectedIndex: idx }));
        }
      }, elapsed);
    });
  }, []);

  return {
    ...state,
    fillRandom,
    setItems,
    addItem,
    pickDirect,
    autoSelect,
    clearSelection,
    spin,
  };
}
