import api from './api';

export interface RandomStore {
  id: number;
  name: string;
  market: string;
  imageUrl: string;
  open: boolean;
}

export const getRandomStores = async (): Promise<RandomStore[]> => {
  try {
    const response = await api.get<RandomStore[]>('/api/store/random');
    return response.data;
  } catch (error) {
    console.error('랜덤 상점 조회 실패:', error);
    throw error;
  }
};
