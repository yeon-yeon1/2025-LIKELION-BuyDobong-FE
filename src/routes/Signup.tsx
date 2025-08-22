import React, { useEffect, useRef, useState } from 'react';
import Header from '@components/Header';
import * as S from '@styles/SignupStyle';
import EyeOpen from '@assets/EyeOpen.svg?react';
import EyeClosed from '@assets/EyeClosed.svg?react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const api = axios.create({ baseURL: 'https://n0t4u.shop' });

function Signup() {
  const [phone, setPhone] = useState('');
  const [authNumber, setAuthNumber] = useState('');
  const [timeLeft, setTimeLeft] = useState(0); // 초
  const [error, setError] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);
  const [verifying, setVerifying] = useState(false);
  const [verifiedPhoneToken, setVerifiedPhoneToken] = useState<string | null>(null);

  const timerRef = useRef<number | null>(null);
  const navigate = useNavigate();

  const startTimer = () => {
    setTimeLeft(180);
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((s) => s - 1);
    }, 1000);
  };

  useEffect(() => {
    if (timeLeft <= 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      if (authNumber.length === 0) {
        setError('인증시간이 만료되었습니다');
      }
    }
  }, [timeLeft, authNumber.length]);

  useEffect(() => {
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  useEffect(() => {
    const run = async () => {
      if (authNumber.length !== 6) return;
      if (timeLeft <= 0) return;
      if (!phone.trim()) return;
      if (verifiedPhoneToken) return;
      try {
        setVerifying(true);
        const { data } = await api.post('/api/sms/confirm', {
          phone: phone.trim(),
          certificationNumber: authNumber,
        });
        if (data?.verifiedPhoneToken) {
          setVerifiedPhoneToken(data.verifiedPhoneToken);
          setError('');
          if (timerRef.current) {
            clearInterval(timerRef.current);
            timerRef.current = null;
          }
          setTimeLeft(0);
        } else {
          setVerifiedPhoneToken(null);
          setError('인증번호가 올바르지 않습니다');
        }
      } catch {
        setVerifiedPhoneToken(null);
        setError('인증번호가 올바르지 않습니다');
      } finally {
        setVerifying(false);
      }
    };
    run();
  }, [authNumber, timeLeft, phone, verifiedPhoneToken]);

  const fmt = (sec: number) => {
    const m = String(Math.max(0, Math.floor(sec / 60))).padStart(2, '0');
    const s = String(Math.max(0, sec % 60)).padStart(2, '0');
    return `${m}:${s}`;
  };

  const requestCode = async () => {
    if (!phone.trim()) {
      setError('전화번호를 입력해주세요');
      return;
    }
    try {
      setError('');
      await api.post('/api/sms/send', { phone: phone.trim() });
      startTimer();
      setVerifiedPhoneToken(null);
      setAuthNumber('');
    } catch (e) {
      setError('인증번호 요청에 실패했습니다. 잠시 후 다시 시도해주세요.');
    }
  };

  const onAuthBlur = () => {
    if (!authNumber.trim()) {
      setError('인증번호를 다시 입력해주세요');
    } else if (authNumber.trim().length < 6) {
      setError('6자리 인증번호를 입력해주세요');
    } else {
      setError('');
    }
  };

  const authHasError = !!error;

  const passwordInvalid = pw.length > 0 && pw.length < 8;
  const passwordMismatch = pw2.length > 0 && pw !== pw2;

  const canSubmit =
    phone.trim().length > 0 &&
    !!verifiedPhoneToken &&
    authNumber.trim().length === 6 &&
    !authHasError &&
    pw.length >= 8 &&
    pw === pw2;

  const submitSignup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !verifiedPhoneToken) return;
    const partial = {
      verifiedPhoneToken,
      password: pw,
      passwordConfirm: pw2,
    };
    sessionStorage.setItem('signup:partial', JSON.stringify(partial));
    navigate('/signupRole', { replace: true });
  };

  return (
    <>
      <Header />
      <S.Signup as="form" onSubmit={submitSignup}>
        <S.SignupHead>회원가입</S.SignupHead>

        {/* 전화번호 */}
        <S.Wrapper>
          <label htmlFor="phone">전화번호</label>
          <S.InputBox>
            <S.InputRow>
              <S.Input
                id="phone"
                type="tel"
                inputMode="tel"
                placeholder="010-0000-0000"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
              />
            </S.InputRow>
            <S.Button
              type="button"
              onClick={requestCode}
              disabled={timeLeft > 0 || !!verifiedPhoneToken}
            >
              {timeLeft > 0 ? '재요청' : '인증번호 요청'}
            </S.Button>
          </S.InputBox>
        </S.Wrapper>

        {/* 인증번호 */}
        <S.Wrapper>
          <label htmlFor="authNumber">인증번호</label>
          <S.InputRow $hasError={authHasError}>
            <S.Input
              id="authNumber"
              type="text"
              inputMode="numeric"
              placeholder="인증번호 입력"
              value={authNumber}
              onChange={(e) => setAuthNumber(e.target.value.replace(/\D/g, '').slice(0, 6))}
              onBlur={onAuthBlur}
            />
            <S.Timer>{fmt(timeLeft)}</S.Timer>
            {/* 체크 아이콘 (유효 길이일 때만 표시) */}
            {authNumber.length === 6 && !authHasError && (
              <S.Check
                style={{ color: verifiedPhoneToken ? 'green' : undefined }}
                aria-live="polite"
              >
                {verifying ? '…' : '✓'}
              </S.Check>
            )}
          </S.InputRow>
          {authHasError && <S.ErrorMessage>❗ {error}</S.ErrorMessage>}
        </S.Wrapper>

        {/* 비밀번호 */}
        <S.Wrapper>
          <label htmlFor="password">비밀번호</label>
          <S.InputRow $hasError={passwordInvalid}>
            <S.Input
              id="password"
              type={showPw ? 'text' : 'password'}
              placeholder="8자 이상 입력"
              value={pw}
              onChange={(e) => setPw(e.target.value)}
            />
            <S.IconButton
              type="button"
              onClick={() => setShowPw((v) => !v)}
              aria-label="비밀번호 보기 전환"
            >
              {showPw ? <EyeOpen /> : <EyeClosed />}
            </S.IconButton>
            {pw && (
              <S.IconButton type="button" onClick={() => setPw('')} aria-label="비밀번호 지우기">
                ×
              </S.IconButton>
            )}
          </S.InputRow>
          {passwordInvalid && <S.ErrorMessage>❗ 비밀번호는 8자 이상이어야 합니다</S.ErrorMessage>}
        </S.Wrapper>

        {/* 비밀번호 확인 */}
        <S.Wrapper>
          <label htmlFor="passwordConfirm">비밀번호 확인</label>
          <S.InputRow $hasError={passwordMismatch}>
            <S.Input
              id="passwordConfirm"
              type={showPw2 ? 'text' : 'password'}
              placeholder="비밀번호 재입력"
              value={pw2}
              onChange={(e) => setPw2(e.target.value)}
            />
            <S.IconButton
              type="button"
              onClick={() => setShowPw2((v) => !v)}
              aria-label="비밀번호 보기 전환"
            >
              {showPw2 ? <EyeOpen /> : <EyeClosed />}
            </S.IconButton>
            {pw2 && (
              <S.IconButton type="button" onClick={() => setPw2('')} aria-label="비밀번호 지우기">
                ×
              </S.IconButton>
            )}
          </S.InputRow>
          {passwordMismatch && <S.ErrorMessage>❗ 비밀번호가 일치하지 않습니다</S.ErrorMessage>}
        </S.Wrapper>

        {/* 하단 제출 버튼 */}
        <S.BottomBar>
          <S.PrimaryCTA type="submit" disabled={!canSubmit}>
            <span>✓</span>
          </S.PrimaryCTA>
        </S.BottomBar>
      </S.Signup>
    </>
  );
}

export default Signup;
