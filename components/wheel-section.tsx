"use client";

// import { Container, SubContainer, Top, Card } from "@/components/ui/card";
import Card from "@/components/ui/card";
import Container from "@/components/ui/container";
import SubContainer from "@/components/ui/subContainer";
import Top from "@/components/ui/top";

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
    <Container>
      <Top>
        <div className="flex flex-col items-start gap-2 sm:flex-row sm:items-center sm:justify-between">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-gray-100">🎰 餐廳抽選</h2>
          <div className="grid grid-cols-2 gap-2 w-full sm:flex sm:w-auto">
            <Button
              variant="primary"
              size="md"
              onClick={onSpin}
              disabled={isSpinning || items.length === 0}
              className="col-span-2 sm:col-auto"
            >
              {isSpinning ? "旋轉中…" : "🎲 開始抽選"}
            </Button>
            <Button variant="secondary" size="md" onClick={onRandomize}>
              🔀 抽備選餐廳
            </Button>
            <Button
              variant="secondary"
              size="md"
              onClick={onClear}
              disabled={items.length === 0}
            >
              🗑️ 清空
            </Button>
          </div>
        </div>
      </Top>
      <SubContainer>
        {items.length === 0 ? (
          <div className="flex h-[332px] sm:h-32 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 dark:border-gray-700">
            <p className="text-sm text-gray-500 dark:text-gray-400">搜尋餐廳後，會自動填入轉盤</p>
          </div>
        ) : (
          <div className="h-[332px] sm:h-32 grid grid-cols-2 gap-2 auto-rows-[60px] sm:grid-cols-5 overflow-hidden">
            {items.map((item) => (
              <Card
                key={item.id}
                name={item.name}
                isSelected={item.id === items[selectedIndex]?.id}
                disabled={isSpinning}
                onRemove={() => onRemoveItem(item.id)}
                onClick={() => onSelect?.(item)}
              />
            ))}
          </div>
        )}
      </SubContainer>
    </Container>
  );
}
