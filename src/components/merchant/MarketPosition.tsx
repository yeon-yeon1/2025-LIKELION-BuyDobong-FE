/**
 * MarketPosition
 * - 커스텀 셀렉트: 클릭 시 드롭다운이 열리고 시장을 선택하면 닫힘
 * - 두 번째 스크린샷의 드롭다운 스타일은 MarketPositionStyle.ts에서 조정
 *
 * 사용 예시:
 *
 * 1. 기본 사용: 선택된 값 관리 및 onChange로 시장 객체 받기
 *
 * ```jsx
 * import MarketPosition from './MarketPosition';
 * import { useState } from 'react';
 *
 * function Example() {
 *   const [selectedId, setSelectedId] = useState();
 *
 *   return (
 *     <MarketPosition
 *       value={selectedId}
 *       onChange={(market) => setSelectedId(market.id)}
 *     />
 *   );
 * }
 * ```
 *
 * 2. 옵션을 외부에서 주입하는 사용법
 *
 * ```jsx
 * import MarketPosition from './MarketPosition';
 *
 * const myMarkets = [
 *   { id: 'A', name: '나의시장A', lat: 37.1, lng: 127.1 },
 *   { id: 'B', name: '나의시장B', lat: 37.2, lng: 127.2 },
 * ];
 *
 * function Example() {
 *   return (
 *     <MarketPosition
 *       options={myMarkets}
 *       onChange={(market) => alert(market.name)}
 *     />
 *   );
 * }
 * ```
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as S from '@styles/merchant/component/MarketPositionStyle';

export interface MarketOption {
  id: string;
  name: string;
  lat: number;
  lng: number;
}

export interface MarketPositionProps {
  /** 선택된 시장 id */
  value?: string;
  /** 선택 시 상위로 옵션 전체를 전달 */
  onChange?: (market: MarketOption) => void;
  /** 비어 있을 때 표시할 텍스트 */
  placeholder?: string;
  /** 외부에서 옵션 주입 (미지정 시 기본 리스트 사용) */
  options?: MarketOption[];
  className?: string;
}

export default function MarketPosition({
  value,
  onChange,
  placeholder = '시장 선택',
  options,
  className,
}: MarketPositionProps) {
  const defaultOptions: MarketOption[] = useMemo(
    () =>
      options ?? [
        { id: 'SINDOBONG', name: '신도봉시장', lat: 37.66654, lng: 127.0453 },
        { id: 'BANGHAKDONG', name: '방학동도깨비시장', lat: 37.66971, lng: 127.0437 },
        { id: 'SINCHANG', name: '신창시장', lat: 37.651, lng: 127.041 },
        { id: 'CHANDONG', name: '창동골목시장', lat: 37.6539, lng: 127.0478 },
        { id: 'SSANGMUN', name: '쌍문시장', lat: 37.6486, lng: 127.0343 },
        { id: 'BAEGUN', name: '백운시장', lat: 37.6471, lng: 127.0255 },
      ],
    [options]
  );

  const selected = defaultOptions.find((m) => m.id === value) ?? null;
  const [open, setOpen] = useState(false);
  const rootRef = useRef<HTMLDivElement>(null);

  // 외부 클릭 시 닫기
  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!rootRef.current) return;
      if (!rootRef.current.contains(e.target as Node)) setOpen(false);
    };
    document.addEventListener('mousedown', onDown);
    return () => document.removeEventListener('mousedown', onDown);
  }, [open]);

  const handlePick = (m: MarketOption) => {
    onChange?.(m);
    setOpen(false);
  };

  return (
    <S.Wrap ref={rootRef} className={className}>
      <S.SelectButton type="button" onClick={() => setOpen((v) => !v)} aria-expanded={open}>
        <span>{selected ? selected.name : placeholder}</span>
        {open ? <S.DropUpImg /> : <S.DropDownImg />}
      </S.SelectButton>

      {open && (
        <S.Dropdown role="listbox">
          {defaultOptions
            .filter((m) => m.id !== value)
            .map((m) => (
              <S.Option
                key={m.id}
                role="option"
                aria-selected={false}
                onClick={() => handlePick(m)}
              >
                {m.name}
              </S.Option>
            ))}
        </S.Dropdown>
      )}
    </S.Wrap>
  );
}
