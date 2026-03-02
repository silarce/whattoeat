/** 搜尋半徑組 (公尺) */
export const SEARCH_RADII = [100, 300, 500] as const;

/** 轉盤最大項目數 */
export const MAX_WHEEL_ITEMS = 10;

/** 轉盤動畫總 tick 數 */
export const WHEEL_TOTAL_TICKS = 26;

/** 轉盤動畫每 tick 間隔 (ms) */
export const WHEEL_TICK_INTERVAL = 120;

/** 自動執行轉盤延遲 (ms) */
export const AUTO_SPIN_DELAY = 800;

/** Places API endpoint */
export const PLACES_API_URL =
  "https://places.googleapis.com/v1/places:searchNearby";

/** Places API 回傳欄位 */
export const PLACES_FIELD_MASK =
  "places.id,places.displayName,places.formattedAddress,places.photos,places.location";
