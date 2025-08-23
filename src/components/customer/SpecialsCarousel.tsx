import React, { memo } from 'react';
import * as S from '@styles/customer/component/SpecialsCarouselStyle';

export type SpecialItem = {
  id: number;
  title: string;
  price: number;
  unit: string; // 예) "/100g"
  time: string; // 예) "17:03 - 20:03"
  stockBadge: string;
  soldOut?: boolean;
};

type Props = {
  items: SpecialItem[];
};

export const SpecialsCarousel = memo(function SpecialsCarousel({ items }: Props) {
  return (
    <S.Row>
      {items.map((it) => (
        <S.Card key={it.id} data-soldout={it.soldOut ? 'y' : undefined}>
          <S.Title>{it.title}</S.Title>
          <S.Price>
            {it.price.toLocaleString()}원 <S.Unit>{it.unit}</S.Unit>
          </S.Price>
          <S.TimeBadge>{it.time}</S.TimeBadge>
          <S.StockBadge data-variant={it.soldOut ? 'muted' : 'default'}>
            {it.stockBadge}
          </S.StockBadge>
        </S.Card>
      ))}
    </S.Row>
  );
});
