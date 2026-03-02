"use client";

import { CardContainer, CardBody, CardHeader, Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { Restaurant } from "@/types/restaurant";

type WheelSectionProps = {
  items: Restaurant[];
  selectedIndex: number;
  isSpinning: boolean;
  onSpin: () => void;
  onRandomize: () => void;
  onSelect?: (restaurant: Restaurant) => void;
};

export function WheelSection({
  items,
  selectedIndex,
  isSpinning,
  onSpin,
  onRandomize,
  onSelect,
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
              <Card
                key={item.id}
                name={item.name}
                isSelected={index === selectedIndex}
                onClick={() => onSelect?.(item)}
              />
            ))}
          </div>
        )}
      </CardBody>
    </CardContainer>
  );
}
