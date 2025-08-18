import React, { useState } from 'react';
import Header from '@components/Header';
import * as R from '@styles/SignupRoleStyle';
import * as S from '@styles/SignupStyle';

// 체크 이미지는 URL import (이미지 방식)
import checkUrl from '@assets/GreenCheck.svg';

type Role = 'merchant' | 'consumer';

function SignupRole() {
  const [role, setRole] = useState<Role | null>(null);

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
        {/* 하단 제출 버튼 */}
        <S.BottomBar>
          <S.PrimaryCTA type="submit">
            <span>✓</span>
          </S.PrimaryCTA>
        </S.BottomBar>
      </R.Page>
    </>
  );
}

export default SignupRole;
