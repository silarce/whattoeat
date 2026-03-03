import type { Restaurant } from "@/types/restaurant";
import {
  PLACES_API_URL,
  PLACES_FIELD_MASK,
  API_SEARCH_RADIUS,
} from "@/lib/constants";

// ---------------------------------------------------------------------------
//  Haversine
// ---------------------------------------------------------------------------

/** Haversine 公式：計算兩個座標之間的距離（公尺）*/
export function distanceInMeters(
  lat1: number,
  lng1: number,
  lat2: number,
  lng2: number,
): number {
  const R = 6_371_000;
  const toRad = (deg: number) => (deg * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLng = toRad(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) ** 2 +
    Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLng / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

// ---------------------------------------------------------------------------
//  API Types
// ---------------------------------------------------------------------------

type PlaceResponse = {
  places?: Array<{
    id?: string;
    displayName?: { text?: string };
    formattedAddress?: string;
    photos?: Array<{ name: string }>;
    location?: { latitude?: number; longitude?: number };
    nationalPhoneNumber?: string;
    rating?: number;
    currentOpeningHours?: { openNow?: boolean };
  }>;
  nextPageToken?: string;
};

// ---------------------------------------------------------------------------
//  Internal helpers
// ---------------------------------------------------------------------------

function parsePlaces(
  places: NonNullable<PlaceResponse["places"]>,
  apiKey: string,
): Restaurant[] {
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
        phone: place.nationalPhoneNumber,
        rating: place.rating,
        openNow: place.currentOpeningHours?.openNow,
      } satisfies Restaurant;
    });
}

// ---------------------------------------------------------------------------
//  Internal helpers - API 搜尋
// ---------------------------------------------------------------------------

const SEARCH_QUERIES = ["餐廳", "飯", "麵"];

/**
 * 用單一關鍵字搜尋，支援多頁分頁
 */
async function searchByQuery(
  query: string,
  lat: number,
  lng: number,
  apiKey: string,
  maxPages: number,
): Promise<Restaurant[]> {
  const results: Restaurant[] = [];
  let pageToken: string | undefined;

  for (let page = 0; page < maxPages; page++) {
    const body: Record<string, unknown> = {
      textQuery: query,
      maxResultCount: 20,
      locationBias: {
        circle: {
          center: { latitude: lat, longitude: lng },
          radius: 5000,
        },
      },
    };

    if (pageToken) body.pageToken = pageToken;

    const response = await fetch(PLACES_API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask": PLACES_FIELD_MASK,
      },
      body: JSON.stringify(body),
    });

    if (!response.ok) {
      console.warn(`Failed to search "${query}": ${response.status}`);
      break;
    }

    const data = (await response.json()) as PlaceResponse;
    results.push(...parsePlaces(data.places ?? [], apiKey));

    if (!data.nextPageToken) break;
    pageToken = data.nextPageToken;
  }

  return results;
}

// ---------------------------------------------------------------------------
//  Public API
// ---------------------------------------------------------------------------

/**
 * 用多個關鍵字並行搜尋所有餐廳（每個關鍵字最多 5 頁），合併去重結果。
 * 搜尋結果會以 Haversine 過濾掉超出 API_SEARCH_RADIUS（1200m）的項目。
 */
export async function searchAllNearby(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<Restaurant[]> {
  // 並行搜尋所有關鍵字，加快速度
  const searchPromises = SEARCH_QUERIES.map((query) =>
    searchByQuery(query, lat, lng, apiKey, 5)
  );

  const resultsArray = await Promise.all(searchPromises);
  const allRestaurants = resultsArray.flat();

  // 去重 + 過濾到最大距離帶以內
  const uniqueMap = new Map(allRestaurants.map((r) => [r.id, r]));
  return Array.from(uniqueMap.values()).filter((r) => {
    if (r.lat == null || r.lng == null) return false;
    return distanceInMeters(lat, lng, r.lat, r.lng) <= API_SEARCH_RADIUS;
  });
}

/**
 * 從完整列表中挑出距離 <= maxMeters 的餐廳（client 端過濾）
 */
export function filterByDistance(
  restaurants: Restaurant[],
  lat: number,
  lng: number,
  maxMeters: number,
): Restaurant[] {
  return restaurants.filter((r) => {
    if (r.lat == null || r.lng == null) return false;
    return distanceInMeters(lat, lng, r.lat, r.lng) <= maxMeters;
  });
}

/**
 * 依距離由近到遠排序（無座標的項目排到最後）
 */
export function sortByDistance(
  restaurants: Restaurant[],
  lat: number,
  lng: number,
): Restaurant[] {
  return [...restaurants].sort((a, b) => {
    const da =
      a.lat != null && a.lng != null
        ? distanceInMeters(lat, lng, a.lat, a.lng)
        : Infinity;
    const db =
      b.lat != null && b.lng != null
        ? distanceInMeters(lat, lng, b.lat, b.lng)
        : Infinity;
    return da - db;
  });
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
