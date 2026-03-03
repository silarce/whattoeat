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
  phone?: string;
  rating?: number;
  openNow?: boolean;
};

export type FavoriteRestaurant = {
  id: string;
  name: string;
  photoUrl?: string;
  address?: string;
  lat?: number;
  lng?: number;
  phone?: string;
  rating?: number;
  openNow?: boolean;
};

export function toFavorite(restaurant: Restaurant): FavoriteRestaurant {
  return {
    id: restaurant.id,
    name: restaurant.name,
    photoUrl: restaurant.photoUrl,
    address: restaurant.address,
    lat: restaurant.lat,
    lng: restaurant.lng,
    phone: restaurant.phone,
    rating: restaurant.rating,
    openNow: restaurant.openNow,
  };
}
