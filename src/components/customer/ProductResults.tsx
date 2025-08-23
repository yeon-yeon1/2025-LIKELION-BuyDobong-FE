import React, { useEffect, useState } from 'react';
import * as K from '@styles/customer/KeywordSearchStyle';
import type { Store } from './StoreResults';
import MoreBtnGreen from '@assets/MoreButton.svg?react';
export type Product = {
  id: number;
  name: string;
  price: string;
  unit: string;
  storeId: number;
};

export type ProductGroup = {
  store: Store;
  products: Product[];
};

type Props = {
  groups: ProductGroup[]; // 스토어별 상품 묶음
  initial?: number; // 최초 노출 개수 (기본 3)
  step?: number; // 더보기당 추가 개수 (기본 3)
  onStoreClick?: (store: Store) => void;
};

const ChevronRight = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const ProductResults: React.FC<Props> = ({ groups, initial = 3, step = 3, onStoreClick }) => {
  const [visible, setVisible] = useState<Record<number, number>>({});

  // groups가 바뀌면 보이는 개수 초기화
  useEffect(() => {
    const init = Object.fromEntries(
      groups.map((g) => [g.store.id, Math.min(initial, g.products.length)])
    );
    setVisible(init);
  }, [groups, initial]);

  const onMore = (storeId: number, total: number) => {
    setVisible((v) => ({
      ...v,
      [storeId]: Math.min((v[storeId] ?? 0) + step, total),
    }));
  };

  return (
    <K.List>
      {groups.map(({ store, products }) => {
        const count = visible[store.id] ?? 0;
        const showMore = products.length >= 4 && count < products.length;

        return (
          <K.PCard key={store.id}>
            <K.StoreBar onClick={() => onStoreClick?.(store)}>
              <K.Thumb small src={store.thumb} alt="" />
              <K.StoreName>{store.name}</K.StoreName>
              <K.Chevron aria-hidden>
                <ChevronRight width={18} height={18} />
              </K.Chevron>
            </K.StoreBar>

            <K.ProductList>
              {products.slice(0, count).map((p) => (
                <K.ProductRow key={p.id}>
                  <K.PName>{p.name}</K.PName>
                  <K.PPrice>
                    {p.price} <K.Slash>/</K.Slash> {p.unit}
                  </K.PPrice>
                </K.ProductRow>
              ))}
            </K.ProductList>

            {showMore && (
              <K.MoreBtn type="button" onClick={() => onMore(store.id, products.length)}>
                <K.DownIcon>
                  <MoreBtnGreen />
                </K.DownIcon>{' '}
                더보기
              </K.MoreBtn>
            )}
          </K.PCard>
        );
      })}
    </K.List>
  );
};

export default ProductResults;
