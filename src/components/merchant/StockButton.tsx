/**
 * StockButton (공통 재고 선택 버튼)
 *
 * - 클릭 전: 배경 = brandBackground, 테두리 연한 회색, 텍스트 기본색
 * - 클릭 후: 왼쪽 GreenCheck 아이콘, 배경 = card, 테두리/텍스트 = brandPrimary
 * - 내부 상태 없음(Controlled). 선택 여부는 부모가 `selected`로 내려주고, 클릭 시 `onClick` 호출
 *
 * @example
 * <StockButton label="충분함" selected={value==='enough'} onClick={() => setValue('enough')} />
 *
 * @prop {string}  label                 - 버튼 텍스트 (필수)
 * @prop {boolean} [selected=false]      - 선택 여부 (선택)
 * @prop {() => void} [onClick]          - 클릭 핸들러 (선택)
 * @prop {string}  [className]           - 외부 스타일 확장용 (선택)
 */
import React from 'react';
import * as S from '@styles/merchant/component/StockButtonStyle';
import GreenCheck from '@assets/GreenCheck.svg?react';

export interface StockButtonProps {
  label: string;
  selected?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function StockButton({
  label,
  selected = false,
  onClick,
  className,
}: StockButtonProps) {
  return (
    <S.Button type="button" $selected={selected} onClick={onClick} className={className}>
      {selected && <GreenCheck />}
      <S.Label>{label}</S.Label>
    </S.Button>
  );
}
