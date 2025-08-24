// src/lib/api/keywords.ts
import api from '@lib/api/api';

const CONSUMER_ID = 2 as const; // 고정

export type KeywordItem = {
  id: number;
  word: string;
  createdAt?: string;
};

export type CreateKeywordRes = {
  id: number;
  consumerId: number;
  word: string;
  createdAt: string;
  success: boolean;
};

/** 관심 키워드 목록 조회: GET /api/consumer/2/keyword */
export async function listKeywords(): Promise<KeywordItem[]> {
  const { data } = await api.get(`/api/consumer/${CONSUMER_ID}/keyword`);
  // 서버가 {items:[...]} 형태로 줄 가능성 방어
  if (Array.isArray(data)) return data as KeywordItem[];
  if (Array.isArray((data as any)?.items)) return data.items as KeywordItem[];
  return [];
}

/** 관심 키워드 등록: POST /api/consumer/2/keyword { word } */
export async function createKeyword(word: string) {
  const payload = { word: String(word ?? '').trim() };
  if (!payload.word) throw new Error('word is empty');
  const { data } = await api.post<CreateKeywordRes>(
    `/api/consumer/${CONSUMER_ID}/keyword`,
    payload,
    { headers: { 'Content-Type': 'application/json' } }
  );
  return data;
}

/** 🔥 권장: id로 삭제 */
export async function deleteKeywordById(keywordId: number) {
  if (typeof keywordId !== 'number') throw new Error('keywordId is required');
  await api.delete(`/api/consumer/${CONSUMER_ID}/keyword/${keywordId}`);
}

/** ✅ 호환용: word로 들어오면 id를 찾아서 삭제 (추후 제거 권장) */
export async function deleteKeyword(word: string) {
  const w = String(word ?? '').trim();
  if (!w) return;
  const item = (await listKeywords()).find((k) => k.word === w);
  if (!item) return;
  await deleteKeywordById(item.id);
}
