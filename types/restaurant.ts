export type LatLng = {
  lat: number;
  lng: number;
};

export type Restaurant = {
  id: string;
  name: string;
  photoUrl?: string;
  address?: string;
  lat?: number;
  lng?: number;
};

export type FavoriteRestaurant = {
  id: string;
  name: string;
  photoUrl?: string;
  address?: string;
  lat?: number;
  lng?: number;
};

export function toFavorite(restaurant: Restaurant): FavoriteRestaurant {
  return {
    id: restaurant.id,
    name: restaurant.name,
    photoUrl: restaurant.photoUrl,
    address: restaurant.address,
    lat: restaurant.lat,
    lng: restaurant.lng,
  };
}
