import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import React, { useState, useEffect } from 'react';
import Header from '@components/Header';
import * as L from '@styles/LoginStyle';
import EyeOpen from '@assets/EyeOpen.svg?react';
import EyeClosed from '@assets/EyeClosed.svg?react';
import CheckOn from '@assets/GreenCheckBox.svg?react';
import CheckOff from '@assets/WhiteCheckBox.svg?react';

export default function Login() {
  const [phone, setPhone] = useState('');
  const [pw, setPw] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [autoLogin, setAutoLogin] = useState(true);

  const navigate = useNavigate();
  const api = axios.create({
    baseURL: 'https://n0t4u.shop',
    headers: { 'Content-Type': 'application/json', Accept: '*/*' },
  });

  // 로그인 페이지 진입 시 axios 인스턴스 헤더 정리
  useEffect(() => {
    // 로컬 axios 인스턴스 헤더 정리
    delete api.defaults.headers.common.Authorization;
    // 전역 axios 헤더도 정리
    delete axios.defaults.headers.common.Authorization;
  }, []);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');

  const canSubmit = phone.trim() !== '' && pw.trim() !== '';

  // 로그인 상태 확인 - 이미 로그인되어 있으면 해당 홈으로 리다이렉트
  useEffect(() => {
    const token =
      sessionStorage.getItem('auth:token') ||
      localStorage.getItem('accessToken') ||
      sessionStorage.getItem('accessToken');
    const role = sessionStorage.getItem('auth:role') as 'MERCHANT' | 'CUSTOMER' | null;

    if (token && role) {
      navigate('/keywordSearch', { replace: true });
    } else {
      // 토큰이 없으면 axios 기본 헤더 정리
      delete axios.defaults.headers.common.Authorization;
    }
  }, [navigate]);

  const submit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    try {
      setSubmitting(true);
      setErr('');
      const payload = { phone: phone.trim(), password: pw.trim() };
      const { data, status } = await api.post('/api/auth/login', payload, {
        validateStatus: () => true,
      });
      console.log('[login status]', status, data);
      if (status === 200 && data?.accessToken) {
        const token: string = data.accessToken;

        // ✅ 1) 토큰은 항상 같은 키에도 저장 (기존 코드들과의 호환)
        // - 새 코드: 'accessToken' (auto-login에 따라 local/session)
        // - 구 코드: 'auth:token' (일관성 위해 항상 세션에도 보관)
        if (autoLogin) {
          localStorage.setItem('accessToken', token);
          sessionStorage.removeItem('accessToken');
        } else {
          sessionStorage.setItem('accessToken', token);
          localStorage.removeItem('accessToken');
        }
        // 구 키와의 호환성 유지(merchant/consumer 어디서든 동일하게 읽히도록)
        sessionStorage.setItem('auth:token', token);

        // ✅ 2) 즉시 axios 기본 헤더에도 반영
        axios.defaults.headers.common.Authorization = `Bearer ${token}`;

        // ✅ 3) 역할 저장(기존 키 유지)
        if (data.role) {
          sessionStorage.setItem('auth:role', data.role);
        }

        // ✅ 4) 라우팅
        if (data.role === 'MERCHANT' || data.role === 'CONSUMER') {
          navigate('/keywordSearch', { replace: true });
        } else {
          navigate('/', { replace: true });
        }
        return;
      }
      const msg = typeof data === 'string' ? data : data?.message || '로그인에 실패했습니다.';
      setErr(msg);
    } catch (e) {
      console.error('[login error]', e);
      setErr('서버 오류로 로그인에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <L.Page as="form" onSubmit={submit}>
        <L.Head>로그인</L.Head>

        <L.Field>
          <label htmlFor="phone">전화번호</label>
          <L.InputRow>
            <L.Input
              id="phone"
              type="tel"
              inputMode="tel"
              placeholder="010 0000 0000"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </L.InputRow>
        </L.Field>

        <L.Field>
          <label htmlFor="password">비밀번호</label>
          <L.InputRow>
            <L.Input
              id="password"
              type={showPw ? 'text' : 'password'}
              placeholder="비밀번호"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            <L.IconButton
              type="button"
              aria-label="비밀번호 보기 전환"
              onClick={() => setShowPw((v) => !v)}
            >
              {showPw ? <EyeOpen /> : <EyeClosed />}
            </L.IconButton>
            {pw && (
              <L.IconButton type="button" aria-label="비밀번호 지우기" onClick={() => setPw('')}>
                ×
              </L.IconButton>
            )}
          </L.InputRow>
        </L.Field>

        <L.BottomBar>
          <L.AutoRow>
            <L.CheckImgButton
              type="button"
              aria-label="자동 로그인"
              aria-pressed={autoLogin}
              onClick={() => setAutoLogin((v) => !v)}
            >
              {autoLogin ? <CheckOn /> : <CheckOff />}
            </L.CheckImgButton>
            <L.AutoText>자동 로그인</L.AutoText>
          </L.AutoRow>

          <L.PrimaryCTA type="submit" disabled={!canSubmit || submitting}>
            {submitting ? '...' : <span>✓</span>}
          </L.PrimaryCTA>
        </L.BottomBar>
      </L.Page>
    </>
  );
}
