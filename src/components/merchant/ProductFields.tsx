import React from 'react';
import * as S from '@styles/merchant/component/ProductFieldsStyle';

import StockButtonGroup from '@components/merchant/StockButtonGroup';

export type StockState = '충분함' | '적음' | '없음';

export interface ProductDraft {
  name: string;
  price: number | null;
  unit: string;
  stock: StockState;
}

export type ProductFieldKey = 'name' | 'price' | 'unit' | 'stock';

export interface ProductFieldsProps {
  value: ProductDraft;
  onChange: (next: ProductDraft) => void;
  disabled?: boolean; // 음성 모드일 땐 입력 잠금 등
  isVoice?: boolean;
  onVoiceAsk?: (field: ProductFieldKey) => void;
  /** 품명 인풋에만 적용할 추가 클래스 (스타일 분기용) */
  nameClassName?: string;
  /** 품명 락 규칙: true = 항상 잠금, 'auto' = 자동 잠금(가격/단위 채워지면) */
  lockName?: boolean | 'auto';
}

export default function ProductFields({
  value,
  onChange,
  disabled,
  isVoice,
  onVoiceAsk,
  nameClassName,
  lockName,
}: ProductFieldsProps) {
  const { name, price, unit } = value;

  // 음성 모드시 전체 입력 잠금 플래그(기존 정책)
  const voiceLock = !!disabled && !!isVoice;

  // 'special' 컨텍스트에서 이름 자동 잠금 규칙: 가격과 단위가 채워지면 잠금
  const filledForAutoLock = value.price !== null && value.unit.trim().length > 0;
  const isSpecial = nameClassName === 'special';
  const autoNameLock = lockName === 'auto' && filledForAutoLock;
  const nameLocked = lockName === true || (isSpecial && autoNameLock);

  const set = <K extends keyof ProductDraft>(key: K, v: ProductDraft[K]) =>
    onChange({ ...value, [key]: v });

  const onPriceInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/[^0-9]/g, '');
    set('price', raw ? Number(raw) : null);
  };

  return (
    <S.Wrap aria-label="상품 입력 필드">
      <S.Field>
        <S.Label>품명</S.Label>
        <S.Input
          value={name}
          placeholder="사과"
          onChange={(e) => {
            if (!nameLocked) set('name', e.target.value);
          }}
          // 텍스트 입력 비활성: 일반 잠금 규칙 + (음성 모드에서만 전체 잠금은 적용하지 않음)
          disabled={(disabled && !isVoice) || nameLocked}
          // 읽기 전용: special이면 자동잠금만 적용, 아니면 기존 voiceLock 규칙 적용
          readOnly={isSpecial ? nameLocked : voiceLock}
          onFocus={() => {
            // 음성 모드에서만, 그리고 이름이 잠겨있지 않을 때만 호출
            if (isVoice && !nameLocked) onVoiceAsk?.('name');
          }}
          onClick={() => {
            if (isVoice && !nameLocked) onVoiceAsk?.('name');
          }}
          className={nameClassName}
          data-locked={nameLocked ? 'true' : undefined}
        />
      </S.Field>

      <S.Field>
        <S.Label>가격</S.Label>
        <S.Input
          value={price ? price.toLocaleString() : ''}
          placeholder="1,000원"
          onChange={onPriceInput}
          inputMode="numeric"
          disabled={disabled && !isVoice}
          readOnly={voiceLock}
          onFocus={() => voiceLock && onVoiceAsk?.('price')}
          onClick={() => voiceLock && onVoiceAsk?.('price')}
        />
      </S.Field>

      <S.Field>
        <S.Label>단위</S.Label>
        <S.Input
          value={unit}
          placeholder="1개 / 1송이 / 100g 등"
          onChange={(e) => set('unit', e.target.value)}
          disabled={disabled && !isVoice}
          readOnly={voiceLock}
          onFocus={() => voiceLock && onVoiceAsk?.('unit')}
          onClick={() => voiceLock && onVoiceAsk?.('unit')}
        />
      </S.Field>

      <S.Field>
        <S.Label>재고</S.Label>
        {disabled ? (
          <S.Input
            value={value.stock}
            placeholder="충분함 / 적음 / 없음"
            disabled={!isVoice && !!disabled}
            readOnly={voiceLock}
            onFocus={() => voiceLock && onVoiceAsk?.('stock')}
            onClick={() => voiceLock && onVoiceAsk?.('stock')}
          />
        ) : (
          <StockButtonGroup
            options={['충분함', '적음', '없음']}
            value={value.stock}
            onChange={(next) => set('stock', next as StockState)}
          />
        )}
      </S.Field>
    </S.Wrap>
  );
}
