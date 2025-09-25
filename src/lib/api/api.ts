// src/lib/api/api.ts
import axios from 'axios';

const base = (import.meta.env.VITE_API_BASE_URL ?? 'https://n0t4u.shop').replace(/\/+$/, '');

const api = axios.create({
  baseURL: base, // .env가 있으면 그걸, 없으면 n0t4u.shop
  headers: { Accept: '*/*' },
  // 쿠키 세션을 쓰는 백엔드가 아니라면 withCredentials는 불필요
  // withCredentials: true,
});

// 토큰을 여러 저장소에서 읽기
const getToken = () =>
  (typeof window !== 'undefined' &&
    (sessionStorage.getItem('auth:token') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken'))) ||
  null;

// (선택) 로그인/로그아웃 시 편하게 쓰라고 내보내는 헬퍼
export const setSessionToken = (token?: string) => {
  try {
    if (token) sessionStorage.setItem('auth:token', token);
    else sessionStorage.removeItem('auth:token');
  } catch {}
};

api.interceptors.request.use((config) => {
  // Authorization: Bearer <token>
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  // FormData 전송 시 Content-Type은 브라우저가 자동 세팅하도록 제거
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (isFormData && config.headers) {
    delete (config.headers as any)['Content-Type'];
  }

  if (import.meta.env.DEV) {
    console.log('[api req]', config.method?.toUpperCase(), config.url, {
      hasAuth: !!token,
      isFormData,
      baseURL: config.baseURL,
    });
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if (import.meta.env.DEV) console.log('[api res]', res.status, res.config.url);
    return res;
  },
  (error) => {
    if (import.meta.env.DEV) {
      console.warn('[api err]', error?.response?.status, error?.config?.url, error?.response?.data);
    }
    // 401 처리: 세션 토큰 제거 후 로그인으로 이동
    if (
      error?.response?.status === 401 &&
      typeof window !== 'undefined' &&
      window.location.pathname !== '/login'
    ) {
      try {
        sessionStorage.removeItem('auth:token');
      } catch {}
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
