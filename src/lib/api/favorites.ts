// src/lib/api/favorites.ts
import api from '@lib/api/api';

export const FAVORITES_BASE = `/api/consumer/favorite`;

export type FavStore = {
  id: number;
  name: string;
  market: string; // 서버 키 (예: SINDOBONG)
  open: boolean;
  imageUrl?: string;
  marketLabel?: string;
  createdAt?: string;
};

/** 관심 상점 목록 조회: GET /api/consumer/favorite */
export async function listFavoriteStores(): Promise<FavStore[]> {
  const { data } = await api.get(FAVORITES_BASE);
  if (Array.isArray(data)) return data as FavStore[];
  if (Array.isArray((data as any)?.items)) return data.items as FavStore[];
  return [];
}

/** 관심 상점 등록: POST /api/consumer/favorite { storeId } */
export async function favoriteStore(storeId: number): Promise<FavStore> {
  const { data } = await api.post<FavStore>(
    FAVORITES_BASE,
    { storeId },
    { headers: { 'Content-Type': 'application/json' } }
  );
  return data;
}

/** 관심 상점 해제: DELETE /api/consumer/2/favorite-stores/{storeId} */
export async function unfavoriteStore(storeId: number): Promise<void> {
  await api.delete(`${FAVORITES_BASE}/${storeId}`);
}
