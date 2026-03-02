import type { Restaurant } from "@/types/restaurant";
import {
  PLACES_API_URL,
  PLACES_FIELD_MASK,
  SEARCH_RADII,
} from "@/lib/constants";

type PlaceResponse = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    photos?: Array<{ name: string }>;
    location?: { latitude?: number; longitude?: number };
  }>;
};

/**
 * 透過 Google Places API 搜尋指定半徑內的餐廳
 */
async function fetchByRadius(
  radius: number,
  lat: number,
  lng: number,
  apiKey: string,
): Promise<Restaurant[]> {
  const response = await fetch(PLACES_API_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": apiKey,
      "X-Goog-FieldMask": PLACES_FIELD_MASK,
    },
    body: JSON.stringify({
      includedTypes: ["restaurant"],
      maxResultCount: 20,
      locationRestriction: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius,
        },
      },
    }),
  });

  if (!response.ok) {
    throw new Error(`API_ERROR_${response.status}`);
  }

  const data = (await response.json()) as PlaceResponse;
  const places = data.places ?? [];

  return places
    .filter((place) => place.id && place.displayName?.text)
    .map((place) => {
      const firstPhotoName = place.photos?.[0]?.name;
      const photoUrl = firstPhotoName
        ? `https://places.googleapis.com/v1/${firstPhotoName}/media?maxHeightPx=240&maxWidthPx=240&key=${apiKey}`
        : undefined;

      return {
        id: place.id as string,
        name: place.displayName?.text as string,
        address: place.formattedAddress,
        photoUrl,
        lat: place.location?.latitude,
        lng: place.location?.longitude,
      } satisfies Restaurant;
    });
}

/**
 * 搜尋附近餐廳 (多半徑合併，去重)
 */
export async function searchNearbyRestaurants(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<Restaurant[]> {
  const allResults = await Promise.all(
    SEARCH_RADII.map((radius) => fetchByRadius(radius, lat, lng, apiKey)),
  );

  const merged = allResults.flat();
  const uniqueMap = new Map(merged.map((item) => [item.id, item]));
  return Array.from(uniqueMap.values());
}

/**
 * 產生模擬餐廳資料 (API 不可用時的 fallback)
 */
export function createMockRestaurants(
  lat: number,
  lng: number,
  count = 12,
): Restaurant[] {
  return Array.from({ length: count }).map((_, index) => ({
    id: `mock-${index + 1}`,
    name: `附近餐廳 ${index + 1}`,
    address: `模擬地址 ${index + 1}`,
    lat: lat + (Math.random() - 0.5) * 0.01,
    lng: lng + (Math.random() - 0.5) * 0.01,
  }));
}
