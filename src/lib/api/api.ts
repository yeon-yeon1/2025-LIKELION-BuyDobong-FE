import axios from 'axios';

const base = (import.meta.env.VITE_API_BASE_URL || '').replace(/\/+$/, ''); // 끝 슬래시 제거

export const api = axios.create({
  baseURL: base, // https://n0t4u.shop
  withCredentials: true,
  timeout: 10000,
});

// 선택: 환경 변수 누락 경고
if (!base) {
  console.warn('[api] VITE_API_BASE_URL is empty. Set it in .env');
}
