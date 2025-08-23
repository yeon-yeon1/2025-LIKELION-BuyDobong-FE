import React from 'react';
import * as K from '@styles/customer/KeywordSearchStyle';

export type Store = {
  id: number;
  name: string;
  market: string;
  thumb: string;
  open: boolean;
};

type Props = {
  stores: Store[];
  onStoreClick?: (store: Store) => void;
};

const ChevronRight = (p: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...p}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

const StoreResults: React.FC<Props> = ({ stores, onStoreClick }) => {
  return (
    <K.List>
      {stores.map((s) => (
        <K.Card key={s.id} onClick={() => onStoreClick?.(s)}>
          <K.Thumb src={s.thumb} alt="" />
          <K.Info>
            <K.Title>{s.name}</K.Title>
            <K.MetaRow>
              <K.Chip>{s.market}</K.Chip>
              <K.Chip $green>
                <K.Dot /> {s.open ? '영업중' : '준비중'}
              </K.Chip>
            </K.MetaRow>
          </K.Info>
          <K.Chevron aria-hidden>
            <ChevronRight width={20} height={20} />
          </K.Chevron>
        </K.Card>
      ))}
    </K.List>
  );
};

export default StoreResults;
