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
//  Internal helpers - API 搜尋 (Nearby Search)
// ---------------------------------------------------------------------------

/**
 * 分批搜尋的 type 組合 — 每次 API 呼叫最多回傳 20 筆，
 * 用多組 type 並行搜尋再去重，可取得更多候選。
 */
const SEARCH_TYPE_GROUPS: string[][] = [
  // 每組獨立呼叫 API，各取最多 20 筆，並行後合併去重
  // 同組內多個 type 為 OR 關係（符合任一即回傳）
  ["restaurant"],
  ["meal_takeaway", "meal_delivery"],
  ["cafe", "bakery"],
  ["taiwanese_restaurant", "dim_sum_restaurant"],
  ["japanese_restaurant", "korean_restaurant"],
  ["breakfast_restaurant", "brunch_restaurant"],
];

/**
 * 用 Nearby Search (New) 以 place type 搜尋，
 * locationRestriction 嚴格限制半徑、rankPreference=DISTANCE 確保穩定排序。
 */
async function searchByTypes(
  types: string[],
  lat: number,
  lng: number,
  apiKey: string,
): Promise<Restaurant[]> {
  const body = {
    includedTypes: types,
    maxResultCount: 20,
    rankPreference: "DISTANCE" as const,
    locationRestriction: {
      circle: {
        center: { latitude: lat, longitude: lng },
        radius: API_SEARCH_RADIUS,
      },
    },
  };

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
    console.warn(`Failed to searchNearby [${types.join(", ")}]: ${response.status}`);
    return [];
  }

  const data = (await response.json()) as PlaceResponse;
  return parsePlaces(data.places ?? [], apiKey);
}

// ---------------------------------------------------------------------------
//  Public API
// ---------------------------------------------------------------------------

/**
 * 用多組 place type 並行搜尋所有餐廳，合併去重結果。
 * Nearby Search 已用 locationRestriction 嚴格限制半徑，
 * 這裡再用 Haversine 做最終確認過濾。
 */
export async function searchAllNearby(
  lat: number,
  lng: number,
  apiKey: string,
): Promise<Restaurant[]> {
  const searchPromises = SEARCH_TYPE_GROUPS.map((types) =>
    searchByTypes(types, lat, lng, apiKey),
  );

  const resultsArray = await Promise.all(searchPromises);
  const allRestaurants = resultsArray.flat();

  // 去重 + Haversine 雙重確認
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
  // 使用確定性偏移（基於 index），確保每次產生相同的座標與距離
  return Array.from({ length: count }).map((_, index) => {
    const angle = (index / count) * 2 * Math.PI;
    const radiusDeg = 0.0004 * ((index % 2) + 1); // 約 45m / 90m（近）與 180m / 360m（遠），都在 400m 內
    return {
      id: `mock-${index + 1}`,
      name: `附近餐廳 ${index + 1}`,
      address: `模擬地址 ${index + 1}`,
      lat: lat + radiusDeg * Math.cos(angle),
      lng: lng + radiusDeg * Math.sin(angle),
    };
  });
}
