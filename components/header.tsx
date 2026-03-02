"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { SEARCH_RADII } from "@/lib/constants";

type HeaderProps = {
  status: string;
  isLocating: boolean;
  isSearching: boolean;
  hasLocation: boolean;
  radius: number;
  onLocate: () => void;
  onSearch: () => void;
  onRadiusChange: (radius: number) => void;
};

export function Header({
  status,
  isLocating,
  isSearching,
  hasLocation,
  radius,
  onLocate,
  onSearch,
  onRadiusChange,
}: HeaderProps) {
  return (
    <header className="border-b border-gray-100 bg-white">
      <div className="mx-auto flex max-w-6xl flex-col gap-4 px-4 py-5 sm:flex-row sm:items-center sm:justify-between sm:px-6">
        <div className="min-w-0 flex-1">
          <h1 className="text-2xl font-bold tracking-tight text-gray-900">
            🍽️ What To Eat
          </h1>
          <p className="mt-1 text-sm text-gray-600">{status}</p>
        </div>

        <div className="flex shrink-0 flex-col gap-3 sm:items-end">
          {/* Radius selector */}
          <div className="flex items-center gap-2">
            <span className="text-xs text-gray-500">搜尋半徑</span>
            <div className="flex rounded-lg border border-gray-200 p-0.5">
              {SEARCH_RADII.map((r) => (
                <button
                  key={r}
                  type="button"
                  onClick={() => onRadiusChange(r)}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                    radius === r
                      ? "bg-orange-500 text-white"
                      : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  {r}m
                </button>
              ))}
            </div>
          </div>

          {/* Action buttons */}
          <div className="flex gap-2">
            <Button variant="secondary" onClick={onLocate} disabled={isLocating}>
              {isLocating ? "定位中…" : "📍 定位"}
            </Button>
            <Button
              variant="primary"
              onClick={onSearch}
              disabled={!hasLocation || isSearching}
            >
              {isSearching ? "搜尋中…" : "🔍 搜尋附近餐廳"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
