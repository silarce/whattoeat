"use client";
import { MenuIcon } from "@/components/icons";

import { Button } from "@/components/ui/button";
import { ThemeToggle } from "@/components/theme-toggle";

type HeaderProps = {
  isLocating: boolean;
  onLocate: () => void;
  onOpenDrawer?: () => void;
  /** 用於在 burger 上顯示餐廳數量 badge */
  restaurantCount?: number;
};

export function Header({
  isLocating,
  onLocate,
  onOpenDrawer,
  restaurantCount,
}: HeaderProps) {
  return (
    <header className="border-b border-gray-100 bg-white dark:border-gray-800 dark:bg-gray-900">
      <div className="min-h-20 mx-auto flex max-w-6xl items-center gap-4 px-4 py-5 sm:px-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900 dark:text-gray-100">
            🍽️ 吃什麼?
          </h1>
        </div>

        <ThemeToggle />

        <div className="shrink-0">
          <Button variant="secondary" onClick={onLocate} disabled={isLocating}>
            {isLocating ? "定位中…" : "🔄 重新定位"}
          </Button>
        </div>

        {/* Burger menu — 僅在 < lg 顯示 */}
        {onOpenDrawer && (
          <button
            onClick={onOpenDrawer}
            className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 hover:bg-gray-50 transition-colors lg:hidden dark:border-gray-700 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
            aria-label="開啟餐廳列表"
          >
            <MenuIcon className="h-5 w-5" />
            {!!restaurantCount && restaurantCount > 0 && (
              <span className="absolute -top-1.5 -right-1.5 flex h-5 min-w-5 items-center justify-center rounded-full bg-orange-500 px-1 text-[10px] font-bold text-white">
                {restaurantCount}
              </span>
            )}
          </button>
        )}
      </div>
    </header>
  );
}
