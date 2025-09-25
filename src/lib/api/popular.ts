// src/lib/api/popular.ts
import api from '@lib/api/api';

export type PopularKeyword = {
  id: number;
  word: string;
  count: number;
};

/** 인기 상품 키워드 조회: GET /api/keyword/popular */
export async function getPopularKeywords(): Promise<PopularKeyword[]> {
  try {
    const response = await api.get<PopularKeyword[]>('/api/keyword/popular');
    return response.data;
  } catch (error) {
    console.error('인기 키워드 조회 실패:', error);
    throw error;
  }
}
