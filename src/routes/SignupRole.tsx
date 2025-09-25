import React from 'react';
import axios from 'axios';
import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@components/Header';
import * as R from '@styles/SignupRoleStyle';
import * as S from '@styles/SignupStyle';

import checkUrl from '@assets/GreenCheck.svg';

type Role = 'merchant' | 'consumer';

const api = axios.create({
  baseURL: 'https://n0t4u.shop',
  headers: { 'Content-Type': 'application/json', Accept: '*/*' },
});

type PartialSignup = {
  phone: string;
  verifiedPhoneToken: string;
  password: string;
  passwordConfirm: string;
};

function SignupRole() {
  const [role, setRole] = useState<Role | null>(null);
  const [partial, setPartial] = useState<PartialSignup | null>(null);
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    const raw = sessionStorage.getItem('signup:partial');
    if (!raw) return setErr('이전 단계 정보가 없습니다. 처음부터 진행해주세요.');
    try {
      const p = JSON.parse(raw) as PartialSignup;
      if (!p.phone || !p.verifiedPhoneToken || !p.password || !p.passwordConfirm) {
        setErr('이전 단계 정보가 올바르지 않습니다.');
        return;
      }
      setPartial(p);
    } catch {
      setErr('저장된 정보 파싱에 실패했습니다.');
    }
  }, []);

  const handleSubmit = async () => {
    if (!partial) {
      setErr('이전 단계 정보가 없습니다.');
      return;
    }
    if (!role) {
      setErr('역할을 선택해주세요.');
      return;
    }
    try {
      setSubmitting(true);
      setErr('');
      const payload = {
        phone: partial.phone,
        verifiedPhoneToken: partial.verifiedPhoneToken,
        password: partial.password,
        passwordConfirm: partial.passwordConfirm,
        role: role.toUpperCase() as 'MERCHANT' | 'CONSUMER',
      };
      const { data, status } = await api.post('/api/auth/register', payload, {
        validateStatus: () => true,
      });
      console.log('[signup status]', status, data);
      if (status === 200 && data?.accessToken) {
        sessionStorage.removeItem('signup:partial');
        // TODO: accessToken을 전역/메모리에 저장하고 싶다면 여기서 처리
        navigate('/', { replace: true });
        return;
      }
      const msg =
        typeof data === 'string'
          ? data
          : data?.message || '회원가입에 실패했습니다. 입력값을 확인해주세요.';
      setErr(msg);
    } catch (e) {
      console.error('[signup error]', e);
      setErr('서버 오류로 회원가입에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Header />
      <R.Page>
        <R.Head>회원가입</R.Head>
        <R.Caption htmlFor="role">서비스를 이용하실 역할을 선택해주세요</R.Caption>

        <R.List id="role">
          {/* 상인 카드 */}
          <R.Card
            type="button"
            selected={role === 'merchant'}
            onClick={() => setRole('merchant')}
            aria-pressed={role === 'merchant'}
          >
            <R.Row>
              {role === 'merchant' && <R.CheckImg src={checkUrl} alt="" />}
              <R.Title selected={role === 'merchant'}>상인</R.Title>
            </R.Row>
            <R.Desc>내 상점을 똑똑하게 관리할래요</R.Desc>
          </R.Card>

          {/* 소비자 카드 */}
          <R.Card
            type="button"
            selected={role === 'consumer'}
            onClick={() => setRole('consumer')}
            aria-pressed={role === 'consumer'}
          >
            <R.Row>
              {role === 'consumer' && <R.CheckImg src={checkUrl} alt="" />}
              <R.Title selected={role === 'consumer'}>소비자</R.Title>
            </R.Row>
            <R.Desc>특가 정보를 받으며 똑똑하게 소비할래요</R.Desc>
          </R.Card>
        </R.List>
        {err && <S.ErrorMessage>❗ {err}</S.ErrorMessage>}
        {/* 하단 제출 버튼 */}
        <S.BottomBar>
          <S.PrimaryCTA
            type="button"
            onClick={handleSubmit}
            disabled={!partial || !role || submitting}
            aria-disabled={!partial || !role || submitting}
          >
            {submitting ? '처리중…' : <span>✓</span>}
          </S.PrimaryCTA>
        </S.BottomBar>
      </R.Page>
    </>
  );
}

export default SignupRole;
