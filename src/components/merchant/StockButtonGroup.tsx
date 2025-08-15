/**
 * StockButtonGroup (공통)
 * - 여러 개의 재고 상태 버튼을 그룹으로 렌더링하고, 하나만 선택 가능하게 관리하는 컨테이너
 * - 내부적으로 `StockButton` 컴포넌트를 사용
 *
 * @example
 * import StockButtonGroup from '@components/merchant/StockButtonGroup';
 * import { useState } from 'react';
 *
 * const [stock, setStock] = useState('충분함');
 *
 * <StockButtonGroup
 *     options={['충분함', '적음', '없음']}
 *     value={stock}
 *     onChange={setStock} />
 *
 * @prop {Array<string|{label:string,value:string}>} options - 버튼 목록 (텍스트 배열 또는 {label, value} 객체 배열)
 * @prop {string} value - 현재 선택된 버튼의 value
 * @prop {(next:string) => void} onChange - 선택 변경 시 호출되는 콜백
 * @prop {string} [className] - 외부 스타일 확장용 (선택)
 */

import React from 'react';
import * as G from '@styles/merchant/component/StockButtonGroupStyle';
import StockButton from '@components/merchant/StockButton';

export type StockOption = { label: string; value: string } | string;

function normalize(opt: StockOption): { label: string; value: string } {
  return typeof opt === 'string' ? { label: opt, value: opt } : opt;
}

export interface StockButtonGroupProps {
  options: StockOption[]; // e.g., ['충분함','적음','없음'] 또는 [{label,value}]
  value: string; // 현재 선택된 value
  onChange: (next: string) => void; // 선택 변경 콜백
  className?: string;
}

export default function StockButtonGroup({
  options,
  value,
  onChange,
  className,
}: StockButtonGroupProps) {
  return (
    <G.Container className={className}>
      {options.map((o) => {
        const { label, value: v } = normalize(o);
        return (
          <StockButton key={v} label={label} selected={value === v} onClick={() => onChange(v)} />
        );
      })}
    </G.Container>
  );
}
