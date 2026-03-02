import { setOptions, importLibrary } from "@googlemaps/js-api-loader";

let isInitialized = false;

export async function loadGoogleMaps(apiKey: string): Promise<typeof google.maps> {
  // 只在第一次呼叫時初始化
  if (!isInitialized) {
    setOptions({ key: apiKey, libraries: ["places"] });
    isInitialized = true;
  }

  // 先載入基本 maps 和 places
  await importLibrary("maps");
  await importLibrary("places");

  // 然後動態載入 marker 庫
  try {
    await importLibrary("marker");
  } catch (error) {
    console.warn("Failed to load marker library:", error);
  }

  // 回傳 google.maps
  return google.maps;
}
