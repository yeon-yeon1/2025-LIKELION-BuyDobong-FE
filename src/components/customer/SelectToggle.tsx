/**
 * SelectToggle
 *
 * 검색 결과(상점 / 상품)를 토글하는 UI 컴포넌트입니다.
 *
 * @example
 * import SelectToggle, { type Select } from '@components/customer/SelectToggle';
 *
 * const [mode, setMode] = useState<Select>('store');
 *
 *   <SelectToggle
 *     value={mode} // 현재 모드 ('store' | 'product')
 *     onChange={(next) => setMode(next)} // 모드 변경 핸들러
 *   />
 *
 * @prop value - 현재 모드 값 ('store' | 'product')
 * @prop onChange - 모드 변경 콜백 함수
 */

import React from 'react';
import * as S from '@styles/merchant/component/InputModeToggleStyle';

export type Select = 'store' | 'product';

export interface SelectToggleProps {
  value: Select;
  onChange: (next: Select) => void;
  disabled?: boolean;
  className?: string;
  labels?: { store: string; product: string };
}

export default function SelectToggle({
  value,
  onChange,
  disabled = false,
  className,
  labels = { store: '상점', product: '상품' },
}: SelectToggleProps) {
  const isStore = value === 'store';

  return (
    <S.Wrap
      role="switch"
      aria-checked={isStore}
      tabIndex={disabled ? -1 : 0}
      $disabled={disabled}
      className={className}
    >
      <S.Knob $pos={isStore ? 'left' : 'right'} />
      <S.Segment
        type="button"
        onClick={() => !disabled && onChange('store')}
        $active={isStore}
        disabled={disabled}
      >
        {labels.store}
      </S.Segment>
      <S.Segment
        type="button"
        onClick={() => !disabled && onChange('product')}
        $active={!isStore}
        disabled={disabled}
      >
        {labels.product}
      </S.Segment>
    </S.Wrap>
  );
}
