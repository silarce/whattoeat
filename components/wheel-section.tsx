"use client";

import { cn } from "@/lib/utils";
import { CardContainer, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/types/restaurant";

type WheelSectionProps = {
  items: Restaurant[];
  selectedIndex: number;
  isSpinning: boolean;
  onSpin: () => void;
  onRandomize: () => void;
};

export function WheelSection({
  items,
  selectedIndex,
  isSpinning,
  onSpin,
  onRandomize,
}: WheelSectionProps) {
  return (
    <CardContainer>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">🎰 轉盤抽選</h2>
          <div className="flex gap-2">
            <Button variant="ghost" size="sm" onClick={onRandomize}>
              🔀 重新隨機
            </Button>
            <Button
              variant="primary"
              size="sm"
              onClick={onSpin}
              disabled={isSpinning || items.length === 0}
            >
              {isSpinning ? "旋轉中…" : "🎲 開始抽選"}
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {items.length === 0 ? (
          <div className="flex h-40 items-center justify-center rounded-xl border-2 border-dashed border-gray-200">
            <p className="text-sm text-gray-500">搜尋餐廳後，會自動填入轉盤</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
            {items.map((item, index) => (
              <div
                key={item.id}
                className={cn(
                  "relative overflow-hidden rounded-xl border-2 px-3 py-3 text-center transition-all duration-150",
                  index === selectedIndex
                    ? "border-orange-500 bg-orange-50 shadow-lg shadow-orange-100 scale-105"
                    : "border-gray-100 bg-gray-50 hover:border-gray-200",
                )}
              >
                <p
                  className={cn(
                    "line-clamp-2 text-xs font-medium leading-tight",
                    index === selectedIndex
                      ? "text-orange-900"
                      : "text-gray-700",
                  )}
                >
                  {item.name}
                </p>
              </div>
            ))}
          </div>
        )}
      </CardBody>
    </CardContainer>
  );
}
