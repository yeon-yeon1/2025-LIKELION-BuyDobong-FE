import api from './index';

export interface ProductPayload {
  name: string;
  regularPrice: number;
  regularUnit: string;
  stockLevel: 'ENOUGH' | 'LOW' | 'NONE';
}

// 상품 등록
export const createProduct = (payload: ProductPayload) => api.post('/api/product', payload);
