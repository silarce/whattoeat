"use client";

import { Button } from "@/components/ui/button";

type HeaderProps = {
  status: string;
  isLocating: boolean;
  isSearching: boolean;
  hasLocation: boolean;
  onLocate: () => void;
  onSearch: () => void;
};

export function Header({
  status,
  isLocating,
  isSearching,
  hasLocation,
  onLocate,
  onSearch,
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

        <div className="flex shrink-0 gap-2">
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
    </header>
  );
}
