"use client";

import { useEffect, useMemo, useState } from "react";
import RestaurantMap from "@/components/RestaurantMap";
import type { Restaurant } from "@/types/restaurant";
import {
  addFavorite,
  getFavorites,
  removeFavorite,
  type FavoriteRestaurant,
} from "@/lib/favorites-db";

const SEARCH_RADII = [100, 300, 500];
const MAX_WHEEL_ITEMS = 10;

function pickRandomItems(items: Restaurant[], limit: number) {
  return [...items].sort(() => Math.random() - 0.5).slice(0, limit);
}

function toFavorite(restaurant: Restaurant): FavoriteRestaurant {
  return {
    id: restaurant.id,
    name: restaurant.name,
    photoUrl: restaurant.photoUrl,
    address: restaurant.address,
    lat: restaurant.lat,
    lng: restaurant.lng,
  };
}

export default function Home() {
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(
    null,
  );
  const [status, setStatus] = useState("請先取得定位，開始找餐廳");
  const [restaurants, setRestaurants] = useState<Restaurant[]>([]);
  const [wheelItems, setWheelItems] = useState<Restaurant[]>([]);
  const [selectedWheelIndex, setSelectedWheelIndex] = useState(0);
  const [isSpinning, setIsSpinning] = useState(false);
  const [winner, setWinner] = useState<Restaurant | null>(null);
  const [favorites, setFavorites] = useState<FavoriteRestaurant[]>([]);
  const [manualWheelIds, setManualWheelIds] = useState<string[]>([]);
  const [mapTarget, setMapTarget] = useState<Restaurant | null>(null);

  const googleMapsApiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;



  const favoriteIds = useMemo(() => new Set(favorites.map((item) => item.id)), [favorites]);

  useEffect(() => {
    getFavorites().then(setFavorites).catch(() => {
      setStatus("收藏讀取失敗，請稍後再試");
    });
  }, []);

  const syncManualWheel = (sourceRestaurants: Restaurant[], ids: string[]) => {
    const selected = sourceRestaurants
      .filter((item) => ids.includes(item.id))
      .slice(0, MAX_WHEEL_ITEMS);
    setWheelItems(selected);
  };

  const pickAsWinner = (restaurant: Restaurant) => {
    setWinner(restaurant);
    setMapTarget(restaurant);
    setStatus(`你選擇了：${restaurant.name}`);
  };

  const handleLocate = () => {
    if (!navigator.geolocation) {
      setStatus("此裝置不支援定位功能");
      return;
    }

    setStatus("定位中...");
    navigator.geolocation.getCurrentPosition(
      (position) => {
        const nextLocation = {
          lat: position.coords.latitude,
          lng: position.coords.longitude,
        };
        setLocation(nextLocation);
        setMapTarget({
          id: "current-location",
          name: "目前位置",
          lat: nextLocation.lat,
          lng: nextLocation.lng,
        });
        setStatus("定位成功，可開始搜尋附近餐廳");
      },
      () => {
        setStatus("定位失敗，請確認瀏覽器定位權限");
      },
      { enableHighAccuracy: true, timeout: 10000 },
    );
  };

  const fetchByRadius = async (radius: number, lat: number, lng: number) => {
    const apiKey = process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY;
    if (!apiKey) {
      throw new Error("MISSING_API_KEY");
    }

    const response = await fetch("https://places.googleapis.com/v1/places:searchNearby", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "X-Goog-Api-Key": apiKey,
        "X-Goog-FieldMask":
          "places.id,places.displayName,places.formattedAddress,places.photos,places.location",
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

    const data = (await response.json()) as {
      places?: Array<{
        id?: string;
        displayName?: { text?: string };
        formattedAddress?: string;
        photos?: Array<{ name: string }>;
        location?: { latitude?: number; longitude?: number };
      }>;
    };

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
  };

  const createMockRestaurants = () => {
    return Array.from({ length: 12 }).map((_, index) => ({
      id: `mock-${index + 1}`,
      name: `附近餐廳 ${index + 1}`,
      address: `模擬地址 ${index + 1}`,
      lat: location ? location.lat + (Math.random() - 0.5) * 0.01 : undefined,
      lng: location ? location.lng + (Math.random() - 0.5) * 0.01 : undefined,
    }));
  };

  const handleSearch = async () => {
    if (!location) {
      setStatus("請先完成定位");
      return;
    }

    setStatus("搜尋附近餐廳中...");
    setWinner(null);

    try {
      const allResults = await Promise.all(
        SEARCH_RADII.map((radius) => fetchByRadius(radius, location.lat, location.lng)),
      );
      const merged = allResults.flat();
      const uniqueMap = new Map(merged.map((item) => [item.id, item]));
      const uniqueRestaurants = Array.from(uniqueMap.values());

      if (uniqueRestaurants.length === 0) {
        throw new Error("EMPTY_RESULTS");
      }

      setRestaurants(uniqueRestaurants);
      setManualWheelIds([]);
      const selectedWheel = pickRandomItems(uniqueRestaurants, MAX_WHEEL_ITEMS);
      setWheelItems(selectedWheel);
      setMapTarget(uniqueRestaurants[0]);
      
      // 調試：檢查取得的餐廳資料
      console.log("Search results - Total restaurants:", uniqueRestaurants.length);
      console.log("Search results - Sample data:", uniqueRestaurants.slice(0, 3));
      console.log(
        "Search results - Restaurants with coords:",
        uniqueRestaurants.filter((r) => r.lat && r.lng).length,
      );

      setStatus(`已找到 ${uniqueRestaurants.length} 家餐廳，正在轉盤抽選...`);
      
      // 自動執行轉盤抽選
      setTimeout(() => {
        const finalIndex = Math.floor(Math.random() * selectedWheel.length);
        const selected = selectedWheel[finalIndex];
        setSelectedWheelIndex(finalIndex);
        setWinner(selected);
        setMapTarget(selected);
        setStatus(`推薦：${selected.name}`);
      }, 800);
    } catch {
      const fallback = createMockRestaurants();
      setRestaurants(fallback);
      setManualWheelIds([]);
      const selectedWheel = pickRandomItems(fallback, MAX_WHEEL_ITEMS);
      setWheelItems(selectedWheel);
      setMapTarget(fallback[0]);
      setStatus("Google API 暫時不可用，已切換為本地模擬資料，正在轉盤抽選...");
      
      // 自動執行轉盤抽選
      setTimeout(() => {
        const finalIndex = Math.floor(Math.random() * selectedWheel.length);
        const selected = selectedWheel[finalIndex];
        setSelectedWheelIndex(finalIndex);
        setWinner(selected);
        setMapTarget(selected);
        setStatus(`推薦：${selected.name}`);
      }, 800);
    }
  };

  const toggleManualWheel = (id: string) => {
    const exists = manualWheelIds.includes(id);
    let nextIds = manualWheelIds;

    if (exists) {
      nextIds = manualWheelIds.filter((item) => item !== id);
    } else if (manualWheelIds.length < MAX_WHEEL_ITEMS) {
      nextIds = [...manualWheelIds, id];
    }

    setManualWheelIds(nextIds);
    syncManualWheel(restaurants, nextIds);
  };

  const randomizeWheel = () => {
    if (restaurants.length === 0) {
      setStatus("目前沒有餐廳資料，請先搜尋");
      return;
    }

    setManualWheelIds([]);
    setWheelItems(pickRandomItems(restaurants, MAX_WHEEL_ITEMS));
    setStatus("已由系統重新隨機產生轉盤內容");
  };

  const handleSpin = () => {
    if (wheelItems.length === 0 || isSpinning) {
      return;
    }

    setIsSpinning(true);
    setWinner(null);
    setStatus("轉盤旋轉中...");

    const totalTicks = 26;
    let ticks = 0;
    let current = 0;

    const timer = window.setInterval(() => {
      current = (current + 1) % wheelItems.length;
      setSelectedWheelIndex(current);
      ticks += 1;

      if (ticks >= totalTicks) {
        window.clearInterval(timer);
        const finalIndex = Math.floor(Math.random() * wheelItems.length);
        const selected = wheelItems[finalIndex];
        setSelectedWheelIndex(finalIndex);
        setWinner(selected);
        setMapTarget(selected);
        setIsSpinning(false);
        setStatus(`今天吃：${selected.name}`);
      }
    }, 120);
  };

  const handleAddFavorite = async (restaurant: Restaurant) => {
    await addFavorite(toFavorite(restaurant));
    const next = await getFavorites();
    setFavorites(next);
  };

  const handleRemoveFavorite = async (id: string) => {
    await removeFavorite(id);
    const next = await getFavorites();
    setFavorites(next);
  };

  const addFavoriteToWheel = (favorite: FavoriteRestaurant) => {
    if (wheelItems.length >= MAX_WHEEL_ITEMS || wheelItems.some((item) => item.id === favorite.id)) {
      return;
    }

    setWheelItems((prev) => [...prev, favorite]);
  };

  const openMapUrl = useMemo(() => {
    if (mapTarget?.lat && mapTarget?.lng) {
      return `https://www.google.com/maps/search/?api=1&query=${mapTarget.lat},${mapTarget.lng}`;
    }

    return "https://www.google.com/maps";
  }, [mapTarget]);

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-6xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <h1 className="text-2xl font-bold text-black">What To Eat</h1>
        <p className="mt-2 text-sm text-black">{status}</p>
        <div className="mt-4 flex flex-wrap gap-3">
          <button
            onClick={handleLocate}
            className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white"
          >
            取得定位
          </button>
          <button
            onClick={handleSearch}
            className="rounded-full border border-black px-4 py-2 text-sm font-semibold"
          >
            搜尋附近餐廳
          </button>
          <button
            onClick={randomizeWheel}
            className="rounded-full border border-black px-4 py-2 text-sm font-semibold"
          >
            系統隨機產生轉盤（最多 10）
          </button>
        </div>
        {location && (
          <p className="mt-3 text-xs text-black/80">
            目前位置：{location.lat.toFixed(5)}, {location.lng.toFixed(5)}
          </p>
        )}
      </section>

      <section className="grid gap-6 lg:grid-cols-2">
        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <div className="mb-3 flex items-center justify-between">
            <h2 className="text-lg font-semibold text-black">轉盤</h2>
            <button
              onClick={handleSpin}
              disabled={isSpinning || wheelItems.length === 0}
              className="rounded-full bg-black px-4 py-2 text-sm font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {isSpinning ? "旋轉中..." : "開始抽選"}
            </button>
          </div>

          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
            {wheelItems.map((item, index) => (
              <div
                key={item.id}
                className={`rounded-xl border p-3 text-sm transition ${index === selectedWheelIndex
                  ? "border-black bg-black text-white"
                  : "border-black/20 bg-white"
                  }`}
              >
                <p className="line-clamp-2 font-medium">{item.name}</p>
              </div>
            ))}
          </div>

          {winner && (
            <div className="mt-4 rounded-xl border border-black/20 bg-black/5 p-4">
              <p className="text-sm text-black">推薦結果</p>
              <p className="text-xl font-bold">{winner.name}</p>
              {winner.address && <p className="mt-1 text-sm text-black/90">{winner.address}</p>}
              <button
                onClick={() => handleAddFavorite(winner)}
                disabled={favoriteIds.has(winner.id)}
                className="mt-3 rounded-full border border-black px-4 py-2 text-sm font-semibold disabled:opacity-40"
              >
                {favoriteIds.has(winner.id) ? "已在收藏" : "加入收藏"}
              </button>
            </div>
          )}
        </div>

        <div className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
          <h2 className="text-lg font-semibold text-black">附近餐廳（可手動加入轉盤，最多 10 家）</h2>
          <div className="mt-3 max-h-96 space-y-2 overflow-auto pr-1">
            {restaurants.map((restaurant) => {
              const checked = manualWheelIds.includes(restaurant.id);
              return (
                <div
                  key={restaurant.id}
                  className="rounded-xl border border-black/15 p-3"
                >
                  <div className="flex items-start gap-3">
                    <input
                      type="checkbox"
                      checked={checked}
                      onChange={() => toggleManualWheel(restaurant.id)}
                      className="mt-1"
                    />
                    <div className="min-w-0 flex-1">
                      <p className="truncate font-medium">{restaurant.name}</p>
                      {restaurant.address && (
                        <p className="truncate text-xs text-black/80">{restaurant.address}</p>
                      )}
                    </div>
                  </div>
                  <div className="mt-3 flex flex-wrap gap-2">
                    <button
                      onClick={() => setMapTarget(restaurant)}
                      className="rounded-full border border-black px-3 py-1 text-xs font-semibold"
                    >
                      地圖查看
                    </button>
                    <button
                      onClick={() => pickAsWinner(restaurant)}
                      className="rounded-full border border-black px-3 py-1 text-xs font-semibold"
                    >
                      直接選這家
                    </button>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">附近餐廳地圖</h2>
          <a
            href={openMapUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="rounded-full border border-black px-3 py-1 text-xs font-semibold"
          >
            在 Google 地圖開啟
          </a>
        </div>

        {googleMapsApiKey && location ? (
          <RestaurantMap
            apiKey={googleMapsApiKey}
            location={location}
            restaurants={restaurants}
            onSelectRestaurant={pickAsWinner}
          />
        ) : (
          <div className="rounded-xl border border-dashed border-black/20 p-4 text-sm text-black">
            {!googleMapsApiKey
              ? "尚未設定 NEXT_PUBLIC_GOOGLE_MAPS_API_KEY"
              : "請先完成定位"}
          </div>
        )}

        {mapTarget && (
          <p className="mt-3 text-sm text-black/80">
            目前地圖目標：<span className="font-semibold text-black">{mapTarget.name}</span>
          </p>
        )}
      </section>

      <section className="rounded-2xl border border-black/10 bg-white p-5 shadow-sm">
        <div className="mb-3 flex items-center justify-between">
          <h2 className="text-lg font-semibold text-black">我的收藏</h2>
          <span className="text-sm text-black/80">{favorites.length} 筆</span>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {favorites.map((item) => (
            <article key={item.id} className="rounded-xl border border-black/15 p-3">
              <p className="font-medium">{item.name}</p>
              {item.address && <p className="mt-1 text-xs text-black/80">{item.address}</p>}
              <div className="mt-3 flex gap-2">
                <button
                  onClick={() => addFavoriteToWheel(item)}
                  className="rounded-full border border-black px-3 py-1 text-xs font-semibold"
                >
                  加入轉盤
                </button>
                <button
                  onClick={() => setMapTarget(item)}
                  className="rounded-full border border-black px-3 py-1 text-xs font-semibold"
                >
                  地圖查看
                </button>
                <button
                  onClick={() => handleRemoveFavorite(item.id)}
                  className="rounded-full border border-black px-3 py-1 text-xs font-semibold"
                >
                  移除
                </button>
              </div>
            </article>
          ))}
        </div>
      </section>
    </main>
  );
}
