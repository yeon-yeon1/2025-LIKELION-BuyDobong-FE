// src/lib/api/stores.ts
import api from '@lib/api/api';

export type StockLevel = 'ENOUGH' | 'LOW' | 'NONE';

export type StoreDeal = {
  id: number;
  name: string;
  displayPrice: number;
  unit: string;
  stockLevel: StockLevel;
  dealActive: boolean;
  dealStartAt: string | null; // ISO
  dealEndAt: string | null; // ISO
};

export type StoreProduct = StoreDeal; // 동일 필드 구조 사용

export type StoreDetail = {
  id: number;
  name: string;
  market: string; // 예: SINDOBONG
  marketLabel: string; // 예: 신도봉시장
  open: boolean;
  favorite: boolean;
  imageUrl: string;
  deals: StoreDeal[];
  products: StoreProduct[];
};

// GET /api/store/{storeId}/detail
// export async function getStoreDetail(storeId: number) {
//   const { data } = await api.get(`/api/store/${storeId}/detail`);
//   return data;
// }

export async function getStoreDetail(storeId: number) {
  const res = await fetch(`https://n0t4u.shop/api/store/${storeId}/detail`, {
    method: 'GET',
    headers: { Accept: '*/*' },
    mode: 'cors',
    credentials: 'omit',
  });
  if (!res.ok) throw new Error('상점 정보를 불러오지 못했어요.');
  return res.json();
}
