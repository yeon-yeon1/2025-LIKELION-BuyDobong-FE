// src/lib/api/recent.ts
import api from '@lib/api/api';

export type RecentStore = {
  id: number;
  name: string;
  market: string;
  marketLabel?: string;
  imageUrl?: string;
  open: boolean;
  createdAt?: string;
};

export async function listRecentStores(): Promise<RecentStore[]> {
  try {
    const { data } = await api.get('/api/consumer/recent');

    const items = Array.isArray(data)
      ? data
      : Array.isArray((data as any)?.items)
      ? (data as any).items
      : [];

    return (items as any[]).map((it) => ({
      id: it.id,
      name: it.name,
      market: it.marketLabel ?? it.market,
      marketLabel: it.marketLabel,
      imageUrl: it.imageUrl,
      open: !!it.open,
      createdAt: it.createdAt,
    }));
  } catch (e: any) {
    console.warn('[recent] listRecentStores error', e?.response?.status, e?.response?.data);
    return []; // ← 실패 시 화면은 비어 보이게
  }
}

export async function removeRecentStore(storeId: number): Promise<void> {
  try {
    await api.delete(`/api/consumer/recent/${storeId}`);
  } catch (e: any) {
    console.warn(
      '[recent] removeRecentStore error',
      storeId,
      e?.response?.status,
      e?.response?.data
    );
    throw e; // 편집 완료 시 Promise.allSettled로 이미 방어 중이면 그대로 둬도 OK
  }
}
