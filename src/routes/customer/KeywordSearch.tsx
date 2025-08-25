// KeywordSearch.tsx
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import api from '@lib/api/api';
import Header from '@components/Header';
import InterestNudge from '@components/customer/InterestNudge';
import * as K from '@styles/customer/KeywordSearchStyle';
import SelectToggle, { type Select } from '@components/customer/SelectToggle';
import StoreResults, { type Store } from '@components/customer/StoreResults';
import ProductResults, { type ProductGroup } from '@components/customer/ProductResults';
import GreenCheck from '@assets/GreenCheck.svg?react';
import styled from 'styled-components';

/* ===================== API 타입 ===================== */
type ApiStore = {
  id: number;
  name: string;
  market: string;
  marketLabel: string;
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
const MARKET_LABEL_TO_KEY: Record<string, string> = {
  신도봉시장: 'SINDOBONG',
  창동골목시장: 'CHANGDONG',
  방학동도깨비시장: 'BANGHAKDONG',
  신창시장: 'SINCHANG',
  쌍문시장: 'SSANGMUN',
  백운시장: 'BAEGUN',
};
const MARKET_OPTIONS = Object.keys(MARKET_LABEL_TO_KEY);

export default function KeywordSearch() {
  const [searchParams, setSearchParams] = useSearchParams();
  const urlQuery = (searchParams.get('query') ?? '').trim();
  const navigate = useNavigate();

  const [q, setQ] = useState(urlQuery);
  const [mode, setMode] = useState<Select>('store');

  const [stores, setStores] = useState<Store[]>([]);
  const [groups, setGroups] = useState<ProductGroup[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorText, setErrorText] = useState<string | null>(null);

  // 인풋 포커스 상태 + ref (배지 숨길 때 포커스 복구에 사용)
  const [inputFocused, setInputFocused] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);
  const blurTimerRef = useRef<number | null>(null);

  // 정렬/필터
  const [sort, setSort] = useState<SortKey>('nearest');
  const [filter, setFilter] = useState<{ dealsOnly: boolean; markets: string[] }>({
    dealsOnly: false, // ← '전체'
    markets: [], // ← '전체' (아무 것도 선택 안 함)
  });
  const isFilterActive = filter.dealsOnly || filter.markets.length > 0;

  // 모달 상태/드래프트
  const [sortOpen, setSortOpen] = useState(false);
  const [filterOpen, setFilterOpen] = useState(false);
  const [sortDraft, setSortDraft] = useState<SortKey>('nearest');
  const [dealsOnlyDraft, setDealsOnlyDraft] = useState(false); // '전체'
  const [selectedMarketDraft, setSelectedMarketDraft] = useState<string[]>([]); // '전체'
  const abortRef = useRef<AbortController | null>(null);

  // URL 입력 동기화
  useEffect(() => {
    setQ(urlQuery);
  }, [urlQuery]);

  // 검색 API
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
        onlyDeal: String(onlyDeal),
      };
      if (markets.length > 0) params.markets = markets.join(',');

      const { data } = await api.get<ApiItem[]>(`/api/consumer/search`, {
        params,
        signal: controller.signal,
      });

      if (!Array.isArray(data)) {
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

  // URL 쿼리 변경 시 자동 검색
  useEffect(() => {
    const marketKeys =
      filter.markets.length === 0
        ? []
        : filter.markets.map((label) => MARKET_LABEL_TO_KEY[label] || '').filter(Boolean);

    fetchSearch({ query: urlQuery, markets: marketKeys, onlyDeal: filter.dealsOnly });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [urlQuery]);

  // 핸들러
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
    setSelectedMarketDraft(filter.markets);
    setFilterOpen(true);
  };

  const CheckIcon = styled(GreenCheck)`
    width: 16px;
    height: 16px;
    flex: 0 0 auto;
    display: inline-block;
  `;

  // 언마운트 시 blur 타이머 정리
  useEffect(() => {
    return () => {
      if (blurTimerRef.current) {
        clearTimeout(blurTimerRef.current);
        blurTimerRef.current = null;
      }
    };
  }, []);

  /* ===================== 렌더 ===================== */
  return (
    <>
      <Header />

      <K.KeywordSearch>
        {/* 검색바 */}
        <K.SearchForm onSubmit={onSearchSubmit}>
          <K.SearchInput
            ref={inputRef}
            placeholder="검색어를 입력해주세요"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onFocus={() => {
              if (blurTimerRef.current) {
                clearTimeout(blurTimerRef.current);
                blurTimerRef.current = null;
              }
              setInputFocused(true);
            }}
            onBlur={() => {
              // 배지 클릭 동작을 보장하기 위해 약간 지연 후 hide
              blurTimerRef.current = window.setTimeout(() => {
                setInputFocused(false);
              }, 120);
            }}
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
          <StoreResults
            stores={stores}
            onStoreClick={(s) => navigate(`/marketDetail/${s.id}`)} // ✅ 여기!
          />
        ) : (
          <ProductResults
            groups={groups}
            onStoreClick={(s) => navigate(`/marketDetail/${s.id}`)} // ✅ 상품쪽에서도 상점 이동
          />
        )}

        <InterestNudge
          show={inputFocused && q.trim().length > 0}
          keyword={q}
          restoreFocusTo={() => inputRef.current}
        />
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
              <K.PillRow>
                <K.Pill $big $selected={!dealsOnlyDraft} onClick={() => setDealsOnlyDraft(false)}>
                  {!dealsOnlyDraft && <CheckIcon aria-hidden />}
                  전체
                </K.Pill>
                <K.Pill $big $selected={dealsOnlyDraft} onClick={() => setDealsOnlyDraft(true)}>
                  {dealsOnlyDraft && <CheckIcon aria-hidden />}
                  특가만
                </K.Pill>
              </K.PillRow>

              <K.SectionTitle>시장</K.SectionTitle>
              <K.PillRow>
                {/* 전체 = 아무 것도 선택 안 된 상태 */}
                <K.Pill
                  $big
                  $selected={selectedMarketDraft.length === 0}
                  onClick={() => setSelectedMarketDraft([])} // ✅ 전체(초기화)
                >
                  {selectedMarketDraft.length === 0 && <CheckIcon aria-hidden />}
                  전체
                </K.Pill>

                {MARKET_OPTIONS.map((label) => {
                  const isSelected = selectedMarketDraft.includes(label);
                  return (
                    <K.Pill
                      key={label}
                      $selected={isSelected}
                      onClick={() =>
                        setSelectedMarketDraft(
                          (prev) =>
                            isSelected ? prev.filter((l) => l !== label) : [...prev, label] // ✅ 토글
                        )
                      }
                    >
                      {isSelected && <CheckIcon aria-hidden />}
                      {label}
                    </K.Pill>
                  );
                })}
              </K.PillRow>
            </K.ModalBody>

            <K.ModalActions>
              <K.Secondary onClick={() => setFilterOpen(false)}>취소</K.Secondary>
              <K.Primary
                onClick={() => {
                  const next = {
                    dealsOnly: dealsOnlyDraft,
                    markets: selectedMarketDraft,
                  };
                  setFilter(next);
                  setFilterOpen(false);

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
