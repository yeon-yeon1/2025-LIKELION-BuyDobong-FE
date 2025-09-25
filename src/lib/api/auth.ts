// src/lib/api/auth.ts
import api from '@lib/api/api';

/** 로그아웃: POST /api/auth/logout */
export async function logout(): Promise<void> {
  try {
    await api.post('/api/auth/logout');
  } catch (error) {
    console.error('로그아웃 실패:', error);
    throw error;
  }
}

/** 회원탈퇴: DELETE /api/auth/me */
export async function withdraw(): Promise<void> {
  try {
    console.log('회원탈퇴 API 요청 시작');
    const response = await api.delete('/api/auth/withdraw');
    console.log('회원탈퇴 API 응답:', response.status, response.data);
  } catch (error: unknown) {
    console.error('회원탈퇴 실패:', error);
    if (error && typeof error === 'object' && 'response' in error) {
      const axiosError = error as { response: { data: unknown; status: number } };
      console.error('응답 데이터:', axiosError.response.data);
      console.error('응답 상태:', axiosError.response.status);
    }
    throw error;
  }
}
