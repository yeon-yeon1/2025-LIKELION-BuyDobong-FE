import React from 'react';
import * as S from '@styles/merchant/StoreRegisterStyle';
import DownArrow from '@assets/DownArrow.svg?react';
import CheckButton from '@components/merchant/CheckButton';

export interface PreviewPanelProps {
  title?: string;
  onConfirm?: () => void;
  confirmDisabled?: boolean;
  className?: string;
  children: React.ReactNode;
}

export default function PreviewPanel({
  title = '이렇게 등록할게요',
  onConfirm,
  confirmDisabled,
  className,
  children,
}: PreviewPanelProps) {
  return (
    <S.PreviewCardWrap aria-label={title} className={className}>
      <S.RegistWrapper>
        <DownArrow />
        <S.RegistLabel>{title}</S.RegistLabel>
      </S.RegistWrapper>

      {/* 슬롯: 카드/프리뷰 등 자유 배치 */}
      {children}

      <S.Bottom>
        <CheckButton disabled={!!confirmDisabled} onClick={onConfirm} />
      </S.Bottom>
    </S.PreviewCardWrap>
  );
}
