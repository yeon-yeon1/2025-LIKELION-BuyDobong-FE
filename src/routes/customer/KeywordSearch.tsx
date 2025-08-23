import React, { useMemo, useState } from 'react';
import Header from '@components/Header';
import * as K from '@styles/customer/KeywordSearchStyle';
import SelectToggle, { type Select } from '@components/customer/SelectToggle';
import StoreResults, { type Store } from '@components/customer/StoreResults';

import ProductResults, {
  type Product,
  type ProductGroup,
} from '@components/customer/ProductResults';

// --- mock data ---
const STORES: Store[] = [
  {
    id: 1,
    name: '은지네 과일 가게',
    market: '신도봉시장',
    open: true,
    thumb: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=256&q=80',
  },
  {
    id: 2,
    name: '은지네 과일 가게',
    market: '신도봉시장',
    open: true,
    thumb: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=256&q=80',
  },
  {
    id: 3,
    name: '은지네 과일 가게',
    market: '신도봉시장',
    open: true,
    thumb: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=256&q=80',
  },
  {
    id: 4,
    name: '은지네 과일 가게',
    market: '신도봉시장',
    open: true,
    thumb: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=256&q=80',
  },
];

const PRODUCTS: Product[] = [
  // store 1 — 7개(더보기 보이게)
  { id: 11, name: '사과', price: '1,000원', unit: '100g', storeId: 1 },
  { id: 12, name: '맛있는 사과', price: '1,000원', unit: '100g', storeId: 1 },
  {
    id: 13,
    name: '진짜맛있는사과바구니(병문안용)',
    price: '30,000원',
    unit: '1바구니',
    storeId: 1,
  },
  { id: 14, name: '부사', price: '1,200원', unit: '100g', storeId: 1 },
  { id: 15, name: '홍로', price: '900원', unit: '100g', storeId: 1 },
  { id: 16, name: '사과 주스', price: '2,500원', unit: '1병', storeId: 1 },
  { id: 17, name: '가을 사과', price: '1,300원', unit: '100g', storeId: 1 },
  // store 2 — 2개(더보기 안 보임)
  { id: 21, name: '사과', price: '1,000원', unit: '100g', storeId: 2 },
  { id: 22, name: '사과', price: '1,000원', unit: '100g', storeId: 2 },
];

//필터링
type SortKey = 'nearest' | 'recent' | 'old';
const SORT_LABEL: Record<SortKey, string> = {
  nearest: '가까운 순',
  recent: '최근 등록한 순',
  old: '오래된 순',
};

// 스크롤 픽커 항목(전부 선택 가능)
const SORT_ITEMS: Array<{ value: SortKey; label: string }> = [
  { value: 'nearest', label: '가까운 순' },
  { value: 'recent', label: '최근 등록한 순' },
  { value: 'old', label: '오래된 순' },
];

const MARKET_OPTIONS = [
  '신도봉시장',
  '방학동도깨비시장',
  '신창시장',
  '창동골목시장',
  '쌍문시장',
  '백운시장',
] as const;

export default function KeywordSearch() {
  const [q, setQ] = useState('');
  const [mode, setMode] = useState<Select>('store');

  const groups: ProductGroup[] = useMemo(() => {
    return STORES.map((s) => ({
      store: s,
      products: PRODUCTS.filter((p) => p.storeId === s.id),
    })).filter((g) => g.products.length > 0);
  }, []);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    // TODO: 검색 실행
  };

  // 정렬/필터 본 상태
  const [sort, setSort] = useState<SortKey>('nearest');
  const [filter, setFilter] = useState<{ dealsOnly: boolean; markets: string[] }>({
    dealsOnly: false,
    markets: [], // 빈 배열 = 전체
  });

  // 팝업 오픈 상태
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);

  // 팝업 내 임시 값들 (드래프트)
  const [sortDraft, setSortDraft] = useState<SortKey>('nearest');
  const [dealsOnlyDraft, setDealsOnlyDraft] = useState(false);
  const [selectedMarketDraft, setSelectedMarketDraft] = useState<string | null>(null); // 단일 선택

  const openSort = () => {
    setSortDraft(sort);
    setSortOpen(true);
  };
  const openFilter = () => {
    setDealsOnlyDraft(filter.dealsOnly);
    setSelectedMarketDraft(filter.markets[0] ?? null); // 하나만 선택
    setFilterOpen(true);
  };

  const isFilterActive = filter.dealsOnly || filter.markets.length > 0;

  return (
    <>
      <Header />
      <K.KeywordSearch>
        {/* 검색바/정렬/토글 - 기존 그대로 */}
        <K.SearchForm onSubmit={onSearch}>
          <K.SearchInput
            placeholder="검색어를 입력해주세요"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <K.SearchButton type="submit" aria-label="검색">
            {/* 네가 쓰는 검색 아이콘으로 교체 가능 */}
            <svg
              viewBox="0 0 24 24"
              width="22"
              height="22"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <circle cx="11" cy="11" r="7" />
              <line x1="21" y1="21" x2="16.65" y2="16.65" />
            </svg>
          </K.SearchButton>
        </K.SearchForm>

        <K.ResultBar>
          <K.Query>
            <K.Em>‘사과’</K.Em> 검색 결과
          </K.Query>
          <K.SortGroup>
            <K.SortBtn type="button" onClick={openSort}>
              {SORT_LABEL[sort]}
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </K.SortBtn>
            <K.FilterButton $active={isFilterActive} onClick={openFilter} aria-label="필터">
              <K.FilterIcon $active={isFilterActive} aria-hidden />
            </K.FilterButton>
          </K.SortGroup>
        </K.ResultBar>

        <K.ToggleWrap>
          <SelectToggle value={mode} onChange={setMode} />
        </K.ToggleWrap>

        {/* 토글에 따라 다른 컴포넌트 렌더 -> 상점 / 상품 */}
        {mode === 'store' ? (
          <StoreResults stores={STORES} onStoreClick={(s) => console.log('go store', s.id)} />
        ) : (
          <ProductResults groups={groups} onStoreClick={(s) => console.log('go store', s.id)} />
        )}
      </K.KeywordSearch>

      {/* 정렬 모달 */}
      {sortOpen && (
        <K.Backdrop onClick={() => setSortOpen(false)}>
          <K.Modal onClick={(e) => e.stopPropagation()}>
            <K.ModalBody>
              <K.ScrollPicker role="listbox" tabIndex={0}>
                {SORT_ITEMS.map((it) => (
                  <K.PickItem
                    key={it.value}
                    role="option"
                    aria-selected={sortDraft === it.value}
                    $selected={sortDraft === it.value}
                    onClick={() => setSortDraft(it.value)} // ✅ 언제나 선택 가능
                  >
                    {it.label}
                  </K.PickItem>
                ))}
              </K.ScrollPicker>
            </K.ModalBody>

            <K.ModalActions>
              <K.Secondary onClick={() => setSortOpen(false)}>취소</K.Secondary>
              <K.Primary
                onClick={() => {
                  setSort(sortDraft);
                  setSortOpen(false);
                }}
              >
                저장
              </K.Primary>
            </K.ModalActions>
          </K.Modal>
        </K.Backdrop>
      )}

      {filterOpen && (
        <K.Backdrop onClick={() => setFilterOpen(false)}>
          <K.Modal onClick={(e) => e.stopPropagation()}>
            <K.ModalBody>
              {/* 전체 / 특가만 */}
              <K.PillRow>
                <K.Pill $big $selected={!dealsOnlyDraft} onClick={() => setDealsOnlyDraft(false)}>
                  전체
                </K.Pill>
                <K.Pill $big $selected={dealsOnlyDraft} onClick={() => setDealsOnlyDraft(true)}>
                  특가만
                </K.Pill>
              </K.PillRow>

              <K.SectionTitle>시장</K.SectionTitle>

              {/* 시장 전체 (단일 선택) */}
              <K.PillRow>
                <K.Pill
                  $big
                  $selected={selectedMarketDraft === null}
                  onClick={() => setSelectedMarketDraft(null)}
                >
                  전체
                </K.Pill>
                {MARKET_OPTIONS.map((m) => (
                  <K.Pill
                    key={m}
                    $selected={selectedMarketDraft === m}
                    onClick={() => setSelectedMarketDraft(m)}
                  >
                    {m}
                  </K.Pill>
                ))}
              </K.PillRow>
            </K.ModalBody>

            <K.ModalActions>
              <K.Secondary onClick={() => setFilterOpen(false)}>취소</K.Secondary>
              <K.Primary
                onClick={() => {
                  setFilter({
                    dealsOnly: dealsOnlyDraft,
                    markets: selectedMarketDraft ? [selectedMarketDraft] : [], // 단일 선택 반영
                  });
                  setFilterOpen(false);
                }}
              >
                저장
              </K.Primary>
            </K.ModalActions>
          </K.Modal>
        </K.Backdrop>
      )}
    </>
  );
}
