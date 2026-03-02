import { openDB } from "idb";

export type FavoriteRestaurant = {
  id: string;
  name: string;
  photoUrl?: string;
  address?: string;
};

type WhatToEatDB = {
  favorites: {
    key: string;
    value: FavoriteRestaurant;
  };
};

const DB_NAME = "whattoeat-db";
const STORE_NAME = "favorites";

async function getDB() {
  return openDB<WhatToEatDB>(DB_NAME, 1, {
    upgrade(db) {
      if (!db.objectStoreNames.contains(STORE_NAME)) {
        db.createObjectStore(STORE_NAME, { keyPath: "id" });
      }
    },
  });
}

export async function getFavorites() {
  const db = await getDB();
  return db.getAll(STORE_NAME);
}

export async function addFavorite(item: FavoriteRestaurant) {
  const db = await getDB();
  await db.put(STORE_NAME, item);
}

export async function removeFavorite(id: string) {
  const db = await getDB();
  await db.delete(STORE_NAME, id);
}
