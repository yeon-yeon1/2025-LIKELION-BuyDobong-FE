import React, { memo } from 'react';
import * as S from '@styles/customer/component/ProductGridStyle';

export type ProductItem = {
  id: number;
  title: string;
  price: number;
  unit: string;
  footer?: string; // 예) "재고 충분함" / "품절"
  disabled?: boolean; // 품절 등
};

type Props = {
  items: ProductItem[];
};

export const ProductGrid = memo(function ProductGrid({ items }: Props) {
  return (
    <S.Grid>
      {items.map((it) => (
        <S.Card key={it.id} aria-disabled={it.disabled ? true : undefined}>
          <S.Title>{it.title}</S.Title>
          <S.Price>
            {it.price.toLocaleString()}원 <S.Unit>{it.unit}</S.Unit>
          </S.Price>
          {it.footer && (
            <S.Footer data-variant={it.disabled ? 'muted' : 'ok'}>{it.footer}</S.Footer>
          )}
        </S.Card>
      ))}
    </S.Grid>
  );
});
