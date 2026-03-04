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
  onClear: () => void;
  onRemoveItem: (id: string) => void;
  onSelect?: (restaurant: Restaurant) => void;
};

export function WheelSection({
  items,
  selectedIndex,
  isSpinning,
  onSpin,
  onRandomize,
  onClear,
  onRemoveItem,
  onSelect,
}: WheelSectionProps) {
  return (
    <CardContainer>
      <CardHeader>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">🎰 餐廳抽選</h2>
          <div className="flex  gap-2 flex-row "
          >
            <Button
              variant="primary"
              size="lg"
              onClick={onSpin}
              disabled={isSpinning || items.length === 0}
            >
              {isSpinning ? "旋轉中…" : "🎲 開始抽選"}
            </Button>
            <Button variant="secondary" size="lg" onClick={onRandomize}>
              🔀 抽十個
            </Button>
            <Button
              variant="ghost"
              size="lg"
              onClick={onClear}
              disabled={items.length === 0}
            >
              🗑️ 清空
            </Button>
          </div>
        </div>
      </CardHeader>
      <CardBody>
        {items.length === 0 ? (
          <div className="flex h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">搜尋餐廳後，會自動填入轉盤</p>
          </div>
        ) : (
          <div className="h-32 grid grid-cols-2 gap-2 auto-rows-[60px] sm:grid-cols-5">
            {items.map((item, index) => (
              <Card
                key={item.id}
                name={item.name}
                isSelected={index === selectedIndex}
                onRemove={() => onRemoveItem(item.id)}
                onClick={() => onSelect?.(item)}
              />
            ))}
          </div>
        )}
      </CardBody>
    </CardContainer>
  );
}
