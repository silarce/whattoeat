"use client";

import { CardContainer, CardBody, CardHeader } from "@/components/ui/card";
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
    <CardContainer>
      <CardBody>
        {apiKey && location ? (
          <RestaurantMap
            apiKey={apiKey}
            location={location}
            restaurants={restaurants}
            selectedRestaurant={mapTarget}
            onSelectRestaurant={onSelectRestaurant}
          />
        ) : (
          <div className="flex h-48 sm:h-64 items-center justify-center rounded-xl border-2 border-dashed border-gray-200 bg-gray-50">
            <p className="text-sm text-gray-500">
              {!apiKey ? "尚未設定 API Key" : "請先完成定位"}
            </p>
          </div>
        )}
      </CardBody>
    </CardContainer>
  );
}
