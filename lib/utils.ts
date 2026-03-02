import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";

/**
 * 合併 Tailwind class names，自動處理衝突
 */
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

/**
 * 從陣列中隨機取出指定數量的項目
 */
export function pickRandom<T>(items: T[], limit: number): T[] {
  return [...items].sort(() => Math.random() - 0.5).slice(0, limit);
}
