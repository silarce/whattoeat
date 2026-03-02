/** 距離帶定義 */
export const DISTANCE_BANDS = [
  { key: "near", label: "近", maxMeters: 300 },
  { key: "mid", label: "有點遠", maxMeters: 800 },
  { key: "far", label: "遠", maxMeters: 1200 },
] as const;

export type DistanceBandKey = (typeof DISTANCE_BANDS)[number]["key"];

/** API 搜尋固定半徑 — 一次抓完最大距離帶的候選 */
export const API_SEARCH_RADIUS = 1200;

/** 轉盤最大項目數 */
export const MAX_WHEEL_ITEMS = 10;

/** 轉盤動畫總 tick 數 */
export const WHEEL_TOTAL_TICKS = 26;

/** 轉盤動畫每 tick 間隔 (ms) */
export const WHEEL_TICK_INTERVAL = 120;

/** 自動執行轉盤延遲 (ms) */
export const AUTO_SPIN_DELAY = 800;

/** Places API endpoint (searchText 支援 pageToken 分頁，每頁最多 20 筆) */
export const PLACES_API_URL =
  "https://places.googleapis.com/v1/places:searchText";

/** Places API 回傳欄位 */
export const PLACES_FIELD_MASK =
  "places.id,places.displayName,places.formattedAddress,places.photos,places.location";
