"use client";

import { CardContainer, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { LoadingOverlay } from "@/components/ui/loading-overlay";
import { RestaurantList } from "@/components/restaurant-list";
import { FavoritesSection } from "@/components/favorites-section";
import type { Restaurant, FavoriteRestaurant } from "@/types/restaurant";
import type { DistanceBandKey } from "@/lib/constants";

type SidePanelProps = {
  // RestaurantList props
  totalCount: number;
  pagedRestaurants: Restaurant[];
  page: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  manualWheelIds: string[];
  favoriteIds: string[];
  band: DistanceBandKey;
  hasLocation: boolean;
  isSearching: boolean;
  onToggleWheel: (id: string) => void;
  onSelect: (restaurant: Restaurant) => void;
  onViewOnMap: (restaurant: Restaurant | FavoriteRestaurant) => void;
  onBandChange: (band: DistanceBandKey) => void;

  // FavoritesSection props
  favorites: FavoriteRestaurant[];
  onAddToWheel: (fav: FavoriteRestaurant) => void;
  onRemoveFavorite: (id: string) => void;
};

export function SidePanel({
  totalCount,
  pagedRestaurants,
  page,
  totalPages,
  onPageChange,
  manualWheelIds,
  favoriteIds,
  band,
  hasLocation,
  isSearching,
  onToggleWheel,
  onSelect,
  onViewOnMap,
  onBandChange,
  favorites,
  onAddToWheel,
  onRemoveFavorite,
}: SidePanelProps) {
  return (
    <CardContainer className="relative">
      <LoadingOverlay isLoading={isSearching} message="正在取得店家資料…" />
      <Tabs defaultValue="restaurants">
        <CardHeader>
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
        </CardHeader>

        <TabsContent value="restaurants">
          <RestaurantList
            totalCount={totalCount}
            pagedRestaurants={pagedRestaurants}
            page={page}
            totalPages={totalPages}
            onPageChange={onPageChange}
            manualWheelIds={manualWheelIds}
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

        <TabsContent value="favorites">
          <FavoritesSection
            favorites={favorites}
            onAddToWheel={onAddToWheel}
            onViewOnMap={onViewOnMap}
            onRemove={onRemoveFavorite}
          />
        </TabsContent>
      </Tabs>
    </CardContainer>
  );
}
