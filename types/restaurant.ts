export type LatLng = {
  lat: number;
  lng: number;
};

export type Restaurant = {
  id: string;
  name: string;
  address?: string;
  phone?: string;
  lat?: number;
  lng?: number;
  rating?: number;
  openNow?: boolean;
  isFavorite?: boolean;
};

export type FavoriteRestaurant = Restaurant;

export function toFavorite(restaurant: Restaurant): FavoriteRestaurant {
  return {
    id: restaurant.id,
    name: restaurant.name,
    address: restaurant.address,
    lat: restaurant.lat,
    lng: restaurant.lng,
    rating: restaurant.rating,
    openNow: restaurant.openNow,
  };
}
