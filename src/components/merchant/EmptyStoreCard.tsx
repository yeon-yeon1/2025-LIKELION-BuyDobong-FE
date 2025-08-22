/**
 * EmptyStoreCard
 *
 * - 상점 데이터가 없을 때 보여지는 빈 상태 카드입니다.
 * - “등록하기” 버튼을 클릭하면 onRegister가 호출되며, 지정하지 않으면 기본적으로 /storeRegister 경로로 이동합니다.
 *
 * // import
 * import EmptyStoreCard from '@components/merchant/EmptyStoreCard';
 *
 * // 1. onRegister 없이 사용 시 (자동으로 /storeRegister로 이동):
 * <EmptyStoreCard />
 *
 * // 2. onRegister 콜백을 사용하여 등록을 직접 처리할 때:
 * <EmptyStoreCard onRegister={() => {
 *   // 여기에 사용자 등록 로직 작성
 *   alert('등록 버튼이 클릭되었습니다!');
 * }} />
 */

import React from 'react';
import { useNavigate } from 'react-router-dom';
import * as S from '@styles/merchant/component/EmptyStoreCardStyle';
import StoreIcon from '@assets/NoMarket.svg?react';
import PlusButton from '@assets/BlackPlus.svg?react';

export interface EmptyStoreCardProps {
  onRegister?: () => void;
  className?: string;
}

export default function EmptyStoreCard({ onRegister, className }: EmptyStoreCardProps) {
  const navigate = useNavigate();

  const handleRegister = () => {
    if (onRegister) return onRegister();
    navigate('/storeRegister');
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
