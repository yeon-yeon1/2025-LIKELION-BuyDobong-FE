// KeywordSearch.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import axios from 'axios';
import { api } from '@lib/api/api';
import Header from '@components/Header';
import * as K from '@styles/customer/KeywordSearchStyle';
import SelectToggle, { type Select } from '@components/customer/SelectToggle';
import StoreResults, { type Store } from '@components/customer/StoreResults';
import ProductResults, {
  type Product,
  type ProductGroup,
} from '@components/customer/ProductResults';

/* ===================== API 타입 ===================== */

type ApiStore = {
  id: number;
  name: string;
  market: string; // 예: "SINDOBONG"
  marketLabel: string; // 예: "신도봉시장"
  imageUrl: string;
  open: boolean;
};
type ApiProduct = {
  id: number;
  name: string;
  displayPrice: number;
  displayUnit: string;
  dealActive: boolean;
  dealStartAt: string | null;
  dealEndAt: string | null;
};
type ApiItem = {
  store: ApiStore;
  products: ApiProduct[];
  interested: boolean;
};

/* ===================== 정렬 ===================== */
type SortKey = 'nearest' | 'recent' | 'old';
const SORT_LABEL: Record<SortKey, string> = {
  nearest: '가까운 순',
  recent: '최근 등록한 순',
  old: '오래된 순',
};
const SORT_ITEMS: Array<{ value: SortKey; label: string }> = [
  { value: 'nearest', label: '가까운 순' },
  { value: 'recent', label: '최근 등록한 순' },
  { value: 'old', label: '오래된 순' },
];

/* ===================== 시장 라벨 → 서버 키 매핑 ===================== */
/* 실제 서버 키에 맞게 보정하세요 */
const MARKET_LABEL_TO_KEY: Record<string, string> = {
  신도봉시장: 'SINDOBONG',
  창동골목시장: 'CHANGDONG',
  방학동도깨비시장: 'BANGHAKDONG_DOKKEBI',
  신창시장: 'SINCHANG',
  쌍문시장: 'SSANGMUN',
  백운시장: 'BAEGUN',
};
const MARKET_OPTIONS = Object.keys(MARKET_LABEL_TO_KEY);

/* ===================== 유틸 ===================== */
const fmtPrice = (n: number) => `${n.toLocaleString()}원`;
const CONSUMER_ID = 2; // TODO: 실제 로그인/컨텍스트에서 가져오기

export default function KeywordSearch() {
  /* ---------- URL 쿼리 ---------- */
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = (searchParams.get('query') ?? '').trim();

  /* ---------- 상태 ---------- */
  const [q, setQ] = useState(urlQuery);
  const [mode, setMode] = useState<Select>('store');

  const [stores, setStores] = useState<Store[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);

  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // 정렬/필터
  const [sort, setSort] = useState<SortKey>('nearest');
  const [filter, setFilter] = useState<{ dealsOnly: boolean; markets: string[] }>({
    dealsOnly: false,
    markets: [],
  });
  const isFilterActive = filter.dealsOnly || filter.markets.length > 0;

  // 모달 상태/드래프트
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortDraft, setSortDraft] = useState<SortKey>('nearest');
  const [dealsOnlyDraft, setDealsOnlyDraft] = useState(false);
  const [selectedMarketDraft, setSelectedMarketDraft] = useState<string | null>(null);

  const abortRef = useRef<AbortController | null>(null);

  /* ---------- 쿼리와 입력 동기화 ---------- */
  useEffect(() => {
    setQ(urlQuery);
  }, [urlQuery]);

  /* ---------- API 호출 ---------- */
  const fetchSearch = async ({
    query,
    markets,
    onlyDeal,
  }: {
    query: string;
    markets: string[];
    onlyDeal: boolean;
  }) => {
    if (!query) {
      setStores([]);
      setGroups([]);
      return;
    }

    abortRef.current?.abort();
    const controller = new AbortController();
    abortRef.current = controller;

    setLoading(true);
    setErrorText(null);

    try {
      const params: Record<string, any> = {
        query,
        onlyDeal: String(onlyDeal), // ← "true"/"false"로
      };
      if (markets.length > 0) {
        params.markets = markets.join(','); // ← 빈 배열이면 아예 안 보냄
      }

      console.log('GET /api/consumer', { url: `/api/consumer/${CONSUMER_ID}/search`, params });

      const { data } = await api.get<ApiItem[]>(`/api/consumer/${CONSUMER_ID}/search`, {
        params,
        signal: controller.signal,
      });

      // 방어: 응답 형태 확인
      if (!Array.isArray(data)) {
        console.warn('Unexpected response shape:', data);
        setStores([]);
        setGroups([]);
        return;
      }

      const nextStores: Store[] = data.map((it) => ({
        id: it.store.id,
        name: it.store.name,
        market: it.store.marketLabel,
        open: it.store.open,
        thumb: it.store.imageUrl,
      }));

      const nextGroups: ProductGroup[] = data.map((it) => ({
        store: {
          id: it.store.id,
          name: it.store.name,
          market: it.store.marketLabel,
          open: it.store.open,
          thumb: it.store.imageUrl,
        },
        products: it.products.map((p) => ({
          id: p.id,
          name: p.name,
          price: `${p.displayPrice.toLocaleString()}원`,
          unit: p.displayUnit,
          storeId: it.store.id,
        })),
      }));

      setStores(nextStores);
      setGroups(nextGroups);
    } catch (err: any) {
      if (!axios.isCancel(err)) {
        setErrorText(err?.response?.data?.message || '검색 중 오류가 발생했습니다.');
      }
    } finally {
      setLoading(false);
    }
  };

  /* ---------- URL 쿼리 변경 시 자동 검색 ---------- */
  useEffect(() => {
    const marketKeys =
      filter.markets.length === 0
        ? []
        : filter.markets.map((label) => MARKET_LABEL_TO_KEY[label] || '').filter(Boolean);

    fetchSearch({ query: urlQuery, markets: marketKeys, onlyDeal: filter.dealsOnly });
  }, [urlQuery]);

  /* ---------- 핸들러 ---------- */
  const onSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = q.trim();

    setSearchParams((prev) => {
      const p = new URLSearchParams(prev);
      if (keyword) p.set('query', keyword);
      else p.delete('query');
      return p;
    });
  };

  const openSort = () => {
    setSortDraft(sort);
    setSortOpen(true);
  };
  const openFilter = () => {
    setDealsOnlyDraft(filter.dealsOnly);
    setSelectedMarketDraft(filter.markets[0] ?? null);
    setFilterOpen(true);
  };

  /* ===================== 렌더 ===================== */
  return (
    <>
      <Header />

      <K.KeywordSearch>
        {/* 검색바 */}
        <K.SearchForm onSubmit={onSearchSubmit}>
          <K.SearchInput
            placeholder="검색어를 입력해주세요"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <K.SearchButton type="submit" aria-label="검색">
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

        {/* 결과 상단 바 */}
        <K.ResultBar>
          <K.Query>
            {urlQuery ? (
              <>
                <K.Em>‘{urlQuery}’</K.Em> 검색 결과
              </>
            ) : (
              '키워드를 입력해 검색하세요'
            )}
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

        {/* 상점/상품 토글 */}
        <K.ToggleWrap>
          <SelectToggle value={mode} onChange={setMode} />
        </K.ToggleWrap>

        {/* 메시지/로딩/결과 */}
        {errorText && (
          <K.ErrorText role="alert" style={{ margin: '8px 12px' }}>
            {errorText}
          </K.ErrorText>
        )}

        {loading ? (
          <K.Loading style={{ margin: '24px 12px' }}>불러오는 중…</K.Loading>
        ) : mode === 'store' ? (
          <StoreResults stores={stores} onStoreClick={(s) => console.log('go store', s.id)} />
        ) : (
          <ProductResults groups={groups} onStoreClick={(s) => console.log('go store', s.id)} />
        )}
      </K.KeywordSearch>

      {/* ============ 정렬 모달 ============ */}
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
                    onClick={() => setSortDraft(it.value)}
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
                  // 서버 정렬 파라미터가 없으면 여기서 클라 정렬 구현 or 필요 시 재검색:
                  // fetchSearch({ query: urlQuery, markets: ..., onlyDeal: ... });
                }}
              >
                저장
              </K.Primary>
            </K.ModalActions>
          </K.Modal>
        </K.Backdrop>
      )}

      {/* ============ 필터 모달 ============ */}
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
              <K.PillRow>
                <K.Pill
                  $big
                  $selected={selectedMarketDraft === null}
                  onClick={() => setSelectedMarketDraft(null)}
                >
                  전체
                </K.Pill>
                {MARKET_OPTIONS.map((label) => (
                  <K.Pill
                    key={label}
                    $selected={selectedMarketDraft === label}
                    onClick={() => setSelectedMarketDraft(label)}
                  >
                    {label}
                  </K.Pill>
                ))}
              </K.PillRow>
            </K.ModalBody>

            <K.ModalActions>
              <K.Secondary onClick={() => setFilterOpen(false)}>취소</K.Secondary>
              <K.Primary
                onClick={() => {
                  // 필터 저장
                  const next = {
                    dealsOnly: dealsOnlyDraft,
                    markets: selectedMarketDraft ? [selectedMarketDraft] : [],
                  };
                  setFilter(next);
                  setFilterOpen(false);

                  // 저장 즉시 재검색
                  const marketKeys =
                    next.markets.length === 0
                      ? []
                      : next.markets
                          .map((label) => MARKET_LABEL_TO_KEY[label] || '')
                          .filter(Boolean);
                  fetchSearch({
                    query: (searchParams.get('query') ?? '').trim(),
                    markets: marketKeys,
                    onlyDeal: next.dealsOnly,
                  });
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
