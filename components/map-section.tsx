"use client";

import { CardContainer, CardBody, CardHeader } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import type { LatLng, Restaurant } from "@/types/restaurant";
import RestaurantMap from "@/components/RestaurantMap";

type MapSectionProps = {
  apiKey: string | undefined;
  location: LatLng | null;
  restaurants: Restaurant[];
  extraRestaurant?: Restaurant | null;
  mapTarget: Restaurant | null;
  isDark?: boolean;
  onSelectRestaurant: (restaurant: Restaurant) => void;
};

export function MapSection({
  apiKey,
  location,
  restaurants,
  extraRestaurant,
  mapTarget,
  isDark = false,
  onSelectRestaurant,
}: MapSectionProps) {
  const openMapUrl =
    mapTarget?.lat && mapTarget?.lng
      ? `https://www.google.com/maps/search/?api=1&query=${mapTarget.lat},${mapTarget.lng}`
      : "https://www.google.com/maps";

  return (
    <CardContainer>
      <CardBody>
        {apiKey && location ? (
          <RestaurantMap
            key={isDark ? "dark" : "light"}
            apiKey={apiKey}
            location={location}
            restaurants={restaurants}
            extraRestaurant={extraRestaurant}
            selectedRestaurant={mapTarget}
            isDark={isDark}
            onSelectRestaurant={onSelectRestaurant}
          />
        ) : (
          <div className="flex h-48 sm:h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">
            <p className="text-sm text-gray-500 dark:text-gray-400">
              {!apiKey ? "尚未設定 API Key" : "請先完成定位"}
            </p>
          </div>
        )}
      </CardBody>
    </CardContainer>
  );
}
