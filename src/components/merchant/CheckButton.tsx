/****
 * 하단 기본 체크 버튼 (체크 아이콘)
 *
 * 외부 SVG 아이콘을 사용합니다. 활성 시 `WhiteCheck`, 비활성 시 `GrayCheck` 아이콘을 표시합니다.
 *
 * @example
 * import CheckButton, { type CheckButtonProps } from '@components/merchant/CheckButton';
 * // 활성 버튼
 * <CheckButton onClick={() => console.log('확인')} />
 * // 비활성 버튼
 * <CheckButton disabled />
 *
 * @prop {boolean} [disabled=false] - 비활성화 여부 (선택)
 * @prop {() => void} onClick     - 클릭 핸들러 (필수)
 */
import React from 'react';
import * as S from '@styles/merchant/component/CheckButtonStyle';
import WhiteCheck from '@assets/WhiteCheck.svg?react';
import GrayCheck from '@assets/GrayCheck.svg?react';

export interface CheckButtonProps {
  disabled?: boolean;
  onClick?: () => void;
  className?: string;
}

export default function CheckButton({ disabled = false, onClick, className }: CheckButtonProps) {
  return (
    <S.Button type="button" disabled={disabled} onClick={onClick} className={className}>
      {disabled ? <GrayCheck /> : <WhiteCheck />}
    </S.Button>
  );
}
