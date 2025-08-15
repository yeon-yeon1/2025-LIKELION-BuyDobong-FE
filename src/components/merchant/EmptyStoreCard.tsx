/**
 * EmptyStoreCard
 * - 상점 데이터가 없을 때 노출되는 빈 상태 카드
 * - “등록하기” 버튼 클릭 시 onRegister 호출, 미지정 시 기본 라우팅 수행
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as S from '@styles/merchant/component/EmptyStoreCardStyle';
import StoreIcon from '@assets/NoMarket.svg?react';
import PlusButton from '@assets/BlackPlus.svg?react';

export interface EmptyStoreCardProps {
  /** 외부에서 등록 버튼 클릭 동작을 주입하고 싶을 때 */
  onRegister?: () => void;
  className?: string;
}

export default function EmptyStoreCard({ onRegister, className }: EmptyStoreCardProps) {
  const navigate = useNavigate();

  const handleRegister = () => {
    if (onRegister) return onRegister();
    navigate('/productRegister');
  };

  return (
    <S.Card className={className} role="region" aria-label="등록된 상점이 없음">
      <S.Left>
        <S.IconWrap aria-hidden>
          <StoreIcon />
        </S.IconWrap>
      </S.Left>

      <S.Body>등록된 상점이 없어요</S.Body>

      <S.Action type="button" onClick={handleRegister}>
        <PlusButton /> 등록하기
      </S.Action>
    </S.Card>
  );
}
