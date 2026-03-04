/**
 * Google Maps AdvancedMarkerElement 需要 innerHTML 字串注入，
 * 無法使用 React 元件，因此在此集中管理地圖用的 SVG 字串。
 */

/** 餐廳 pin 圖示（可傳入顏色） */
export function makePinSvg(color: string): string {
  return `<svg width="32" height="44" viewBox="0 0 32 44" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M16 2C9.37 2 4 7.37 4 14c0 7 12 28 12 28s12-21 12-28c0-6.63-5.37-12-12-12z" fill="${color}" stroke="white" stroke-width="1.5"/><circle cx="16" cy="13" r="4" fill="white"/></svg>`;
}

/** 使用者目前位置圓點圖示 */
export const locationDotSvg =
  '<svg width="32" height="32" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg"><circle cx="16" cy="16" r="14" fill="#4A90E2" stroke="white" stroke-width="2"/><circle cx="16" cy="16" r="6" fill="white"/></svg>';
