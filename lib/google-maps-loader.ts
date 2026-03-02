import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let isInitialized = false;

export async function loadGoogleMaps(apiKey: string): Promise<typeof google.maps> {
  // 只在第一次呼叫時初始化
  if (!isInitialized) {
    setOptions({ key: apiKey, libraries: ["places", "marker"] });
    isInitialized = true;
  }

  // 並行載入 maps、places 和 marker 庫
  await importLibrary("maps");
  await importLibrary("places");
  await importLibrary("marker");

  // 回傳 google.maps
  return google.maps;
}
