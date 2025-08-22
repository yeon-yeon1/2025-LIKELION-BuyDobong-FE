import axios from 'axios';

const api = axios.create({
  baseURL: 'https://n0t4u.shop',
  headers: {
    // NOTE: 전역으로 'Content-Type: application/json'을 강제하지 않습니다.
    // JSON 요청은 각 POST에서 자동/명시로 붙이고,
    // FormData(파일 업로드)는 브라우저가 boundary 포함해서 설정하도록 둡니다.
    Accept: '*/*',
  },
});

// 세션/로컬 어디에 저장되어 있든 토큰을 읽습니다.
const getToken = () =>
  (typeof window !== 'undefined' &&
    (sessionStorage.getItem('auth:token') || localStorage.getItem('accessToken'))) ||
  null;

api.interceptors.request.use((config) => {
  // 1) Authorization 자동 첨부
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${token}`;
  }

  // 2) FormData일 경우 Content-Type을 삭제해 브라우저가 boundary를 세팅하도록 함
  const isFormData = typeof FormData !== 'undefined' && config.data instanceof FormData;
  if (isFormData && config.headers) {
    delete (config.headers as any)['Content-Type'];
  }

  // 3) 개발 중 간단 로그
  if ((import.meta as any)?.env?.DEV) {
    const auth = (config.headers as any)?.Authorization as string | undefined;
    const masked = auth ? auth.slice(0, 16) + '…' : 'none';
    console.log(
      '[api req]',
      config.method?.toUpperCase(),
      config.url,
      'auth=',
      masked,
      'formData=',
      isFormData
    );
  }
  return config;
});

api.interceptors.response.use(
  (res) => {
    if ((import.meta as any)?.env?.DEV) {
      console.log('[api res]', res.status, res.config.url);
    }
    return res;
  },
  (error) => {
    const status = error?.response?.status;
    if ((import.meta as any)?.env?.DEV) {
      console.warn('[api err]', status, error?.config?.url);
    }
    if (status === 401 && typeof window !== 'undefined' && window.location.pathname !== '/login') {
      try {
        sessionStorage.removeItem('auth:token');
      } catch {}
      try {
        localStorage.removeItem('accessToken');
      } catch {}
      window.location.replace('/login');
    }
    return Promise.reject(error);
  }
);

export default api;
