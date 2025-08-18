import React, { useState } from 'react';
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

  const canSubmit = phone.trim() !== '' && pw.trim() !== '';

  const submit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit) return;
    // TODO: 로그인 API (phone, pw, autoLogin)
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
              placeholder="010-2127-7693"
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
              {showPw ? <EyeClosed /> : <EyeOpen />}
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

          <L.PrimaryCTA type="submit" disabled={!canSubmit}>
            <span>✓</span>
          </L.PrimaryCTA>
        </L.BottomBar>
      </L.Page>
    </>
  );
}
