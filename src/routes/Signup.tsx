import React, { useEffect, useRef, useState } from 'react';
import Header from '@components/Header';
import * as S from '@styles/SignupStyle';
import EyeOpen from '@assets/EyeOpen.svg?react';
import EyeClosed from '@assets/EyeClosed.svg?react';

function Signup() {
  const [phone, setPhone] = useState('');
  const [authNumber, setAuthNumber] = useState('');
  const [timeLeft, setTimeLeft] = useState(0); // 초
  const [error, setError] = useState('');
  const [pw, setPw] = useState('');
  const [pw2, setPw2] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [showPw2, setShowPw2] = useState(false);

  const timerRef = useRef<number | null>(null);

  // --- 타이머 ---
  const startTimer = () => {
    setTimeLeft(180); // 3분
    if (timerRef.current) clearInterval(timerRef.current);
    timerRef.current = window.setInterval(() => {
      setTimeLeft((s) => s - 1);
    }, 1000);
  };

  useEffect(() => {
    if (timeLeft <= 0 && timerRef.current) {
      clearInterval(timerRef.current);
      timerRef.current = null;
      // 시간 만료 메시지 (인증 진행 중일 때만)
      if (authNumber.length === 0) {
        setError('인증시간이 만료되었습니다');
      }
    }
  }, [timeLeft, authNumber.length]);

  useEffect(() => {
    // 언마운트 클린업
    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, []);

  // --- 유틸 ---
  const fmt = (sec: number) => {
    const m = String(Math.max(0, Math.floor(sec / 60))).padStart(2, '0');
    const s = String(Math.max(0, sec % 60)).padStart(2, '0');
    return `${m}:${s}`;
  };

  const requestCode = () => {
    if (!phone.trim()) {
      setError('전화번호를 입력해주세요');
      return;
    }
    setError('');
    startTimer();
    // TODO: 인증번호 요청 API
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

  const authHasError = !!error; // 간단히 표시 제어

  const passwordInvalid = pw.length > 0 && pw.length < 8;
  const passwordMismatch = pw2.length > 0 && pw !== pw2;

  const canSubmit =
    phone.trim().length > 0 &&
    authNumber.trim().length === 6 &&
    timeLeft > 0 &&
    !authHasError &&
    pw.length >= 8 &&
    pw === pw2;

  const submitSignup = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // TODO: 회원가입 API
    // phone, authNumber, pw
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
            <S.Button type="button" onClick={requestCode} disabled={timeLeft > 0}>
              {timeLeft > 0 ? '재요청' : '인증번호 요청'}
            </S.Button>
          </S.InputBox>
        </S.Wrapper>

        {/* 인증번호 */}
        <S.Wrapper>
          <label htmlFor="authNumber">인증번호</label>
          <S.InputRow hasError={authHasError}>
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
            {authNumber.length === 6 && !authHasError && <S.Check>✓</S.Check>}
          </S.InputRow>
          {authHasError && <S.ErrorMessage>❗ {error}</S.ErrorMessage>}
        </S.Wrapper>

        {/* 비밀번호 */}
        <S.Wrapper>
          <label htmlFor="password">비밀번호</label>
          <S.InputRow hasError={passwordInvalid}>
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
              {showPw2 ? <EyeClosed /> : <EyeOpen />}
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
          <S.InputRow hasError={passwordMismatch}>
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
              {showPw2 ? <EyeClosed /> : <EyeOpen />}
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
