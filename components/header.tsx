"use client";

import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { DISTANCE_BANDS, type DistanceBandKey } from "@/lib/constants";

type HeaderProps = {
  status: string;
  isLocating: boolean;
  isSearching: boolean;
  hasLocation: boolean;
  band: DistanceBandKey;
  onLocate: () => void;
  onBandChange: (band: DistanceBandKey) => void;
};

export function Header({
  status,
  isLocating,
  isSearching,
  hasLocation,
  band,
  onLocate,
  onBandChange,
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
          {/* Band selector + Locate button */}
          <div className="flex items-center gap-2">
            <span className="text-base font-medium text-gray-700">搜尋餐廳</span>
            <div className="flex rounded-lg border border-gray-200 p-0.5">
              {DISTANCE_BANDS.map((b) => (
                <button
                  key={b.key}
                  type="button"
                  onClick={() => onBandChange(b.key)}
                  disabled={!hasLocation || isSearching}
                  className={cn(
                    "rounded-md px-3 py-1 text-xs font-medium transition-colors",
                    band === b.key
                      ? "bg-orange-500 text-white"
                      : "text-gray-600 hover:bg-gray-100",
                  )}
                >
                  {b.label}
                </button>
              ))}
            </div>
            <Button variant="secondary" onClick={onLocate} disabled={isLocating}>
              {isLocating ? "定位中…" : "🔄 重新定位"}
            </Button>
          </div>
        </div>
      </div>
    </header>
  );
}
