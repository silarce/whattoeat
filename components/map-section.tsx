"use client";

import { Card, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LatLng, Restaurant } from "@/types/restaurant";
import RestaurantMap from "@/components/RestaurantMap";

type MapSectionProps = {
  apiKey: string | undefined;
  location: LatLng | null;
  restaurants: Restaurant[];
  mapTarget: Restaurant | null;
  onSelectRestaurant: (restaurant: Restaurant) => void;
};

export function MapSection({
  apiKey,
  location,
  restaurants,
  mapTarget,
  onSelectRestaurant,
}: MapSectionProps) {
  const openMapUrl =
    mapTarget?.lat && mapTarget?.lng
      ? `https://www.google.com/maps/search/?api=1&query=${mapTarget.lat},${mapTarget.lng}`
      : "https://www.google.com/maps";

  return (
    <Card>
      <CardHeader>
        <div className="flex items-center justify-between">
          <h2 className="text-lg font-semibold text-gray-900">🗺️ 地圖</h2>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => window.open(openMapUrl, "_blank")}
          >
            在 Google 地圖開啟 ↗
          </Button>
        </div>
        {mapTarget && (
          <p className="mt-1 text-xs text-gray-500">
            目前目標：
            <span className="font-medium text-gray-900">{mapTarget.name}</span>
          </p>
        )}
      </CardHeader>
      <CardBody>
        {apiKey && location ? (
          <RestaurantMap
            apiKey={apiKey}
            location={location}
            restaurants={restaurants}
            onSelectRestaurant={onSelectRestaurant}
          />
        ) : (
          <div className="flex h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              {!apiKey ? "尚未設定 API Key" : "請先完成定位"}
            </p>
          </div>
        )}
      </CardBody>
    </Card>
  );
}
