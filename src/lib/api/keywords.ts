import { api } from '@lib/api/api';

const CONSUMER_ID = 2 as const;

export type CreateKeywordRes = {
  id: number;
  consumerId: number;
  word: string;
  createdAt: string;
  success: boolean;
};

export type KeywordItem = {
  id: number;
  word: string;
  createdAt?: string;
};

// 관심 키워드 목록 조회
export async function listKeywords(): Promise<KeywordItem[]> {
  const { data } = await api.get(`/api/consumer/${CONSUMER_ID}/keyword`);
  // 서버가 {items:[...]}로 줄 수도 있어 방어
  if (Array.isArray(data)) return data;
  if (Array.isArray((data as any)?.items)) return (data as any).items;
  return [];
}

// 등록
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

// 해제 (서버가 DELETE body를 안 받으면 params로 재시도)
export async function deleteKeyword(word: string) {
  const payload = { word: String(word ?? '').trim() };
  try {
    await api.delete(`/api/consumer/${CONSUMER_ID}/keyword`, {
      data: payload,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    const s = e?.response?.status;
    if (s === 400 || s === 415) {
      await api.delete(`/api/consumer/${CONSUMER_ID}/keyword`, { params: payload });
      return;
    }
    throw e;
  }
}
