import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let isInitialized = false;

export async function loadGoogleMaps(apiKey: string): Promise<typeof google.maps> {
  // 只在第一次呼叫時初始化
  if (!isInitialized) {
    setOptions({ key: apiKey, libraries: ["places"] });
    isInitialized = true;
  }

  // 並行載入 maps 和 places 庫
  await importLibrary("maps");
  await importLibrary("places");

  // 回傳 google.maps
  return google.maps;
}
