"use client";

import Container from "@/components/ui/container";
import Top from "@/components/ui/top";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { RestaurantList } from "@/components/restaurant-list";
import { FavoritesSection } from "@/components/favorites-section";
import type { RestaurantData, FavoriteRestaurant } from "@/types/restaurant";
import type { DistanceBandKey } from "@/lib/constants";

type SidePanelProps = {
  manualWheelIds: string[];

  restaurantList: {
    totalCount: number;
    pagedRestaurants: RestaurantData[];
    page: number;
    totalPages: number;
    onPageChange: (page: number) => void;
    favoriteIds: string[];
    band: DistanceBandKey;
    hasLocation: boolean;
    isSearching: boolean;
    onToggleWheel: (id: string) => void;
    onSelect: (restaurant: RestaurantData) => void;
    onViewOnMap: (restaurant: RestaurantData | FavoriteRestaurant) => void;
    onBandChange: (band: DistanceBandKey) => void;
  },
  favoriteList: {
    favorites: FavoriteRestaurant[];
    pagedFavorites: FavoriteRestaurant[];
    favPage: number;
    favTotalPages: number;
    onFavPageChange: (page: number) => void;
    onToggleFavWheel: (id: string) => void;
    onSelectFav: (fav: FavoriteRestaurant) => void;
    onRemoveFavorite: (id: string) => void;
  }
};

export function SidePanel({
  manualWheelIds,
  restaurantList: {
    totalCount,
    pagedRestaurants,
    page,
    totalPages,
    onPageChange,
    favoriteIds,
    band,
    hasLocation,
    isSearching,
    onToggleWheel,
    onSelect,
    onViewOnMap,
    onBandChange,
  },
  favoriteList: {
    favorites,
    pagedFavorites,
    favPage,
    favTotalPages,
    onFavPageChange,
    onToggleFavWheel,
    onSelectFav,
    onRemoveFavorite,
  },
}: SidePanelProps) {
  return (
    <Container className="relative h-full flex flex-col">
      <LoadingOverlay isLoading={isSearching} message="正在取得店家資料…" />
      <Tabs defaultValue="restaurants" className="flex-1 min-h-0 flex flex-col">
        <Top>
          <TabsList>
            <TabsTrigger value="restaurants" className="cursor-pointer">
              📋 附近餐廳
              {totalCount > 0 && (
                <Badge variant="info" className="ml-1.5">
                  {totalCount}
                </Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="favorites" className="cursor-pointer">
              ❤️ 我的收藏
              {favorites.length > 0 && (
                <Badge className="ml-1.5">{favorites.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
        </Top>


        <TabsContent value="restaurants" className="flex-1 min-h-0 flex flex-col">
          <RestaurantList
            manualWheelIds={manualWheelIds}
            totalCount={totalCount}
            pagedRestaurants={pagedRestaurants}
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            favoriteIds={favoriteIds}
            band={band}
            hasLocation={hasLocation}
            isSearching={isSearching}
            onToggleWheel={onToggleWheel}
            onSelect={onSelect}
            onViewOnMap={onViewOnMap}
            onBandChange={onBandChange}
          />
        </TabsContent>

        <TabsContent value="favorites" className="flex-1 min-h-0 flex flex-col">
          <FavoritesSection
            manualWheelIds={manualWheelIds}
            favorites={favorites}
            pagedFavorites={pagedFavorites}
            page={favPage}
            totalPages={favTotalPages}
            onPageChange={onFavPageChange}
            onToggleWheel={onToggleFavWheel}
            onSelect={onSelectFav}
            onRemove={onRemoveFavorite}
          />
        </TabsContent>

      </Tabs>
    </Container>
  );
}
