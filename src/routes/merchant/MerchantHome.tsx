import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import Header from '@components/Header';
import EmptyStoreCard from '@components/merchant/EmptyStoreCard';
import MarketCard from '@components/merchant/MarketCard';
import * as M from '@styles/merchant/MerchantHomeStyle';

import BusinessStatusToggle, {
  type BusinessStatus,
} from '@components/merchant/BusinessStatusToggle';

import RightArrow from '@assets/RightArrow.svg?react';
import Mic from '@assets/Mic.svg?react';
import Text from '@assets/Text.svg?react';

const DEBUG = import.meta.env.DEV;
const dbg = (...args: any[]) => {
  if (DEBUG) console.log('[MerchantHome]', ...args);
};

type StoredStore = {
  name: string;
  market: string;
  imageUrl?: string | null;
};

type Product = {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: number;
  updatedAt?: number;
};

const api = axios.create({
  baseURL: 'https://n0t4u.shop',
  headers: { 'Content-Type': 'application/json', Accept: '*/*' },
});
api.interceptors.request.use((config) => {
  const t = sessionStorage.getItem('auth:token');
  if (t) {
    config.headers = config.headers ?? {};
    (config.headers as any).Authorization = `Bearer ${t}`;
    if (DEBUG) {
      const short = t ? t.slice(0, 12) + '...' : '(none)';
      dbg('attach token', short);
    }
  }
  return config;
});

const marketDisplayName = (market: string) => {
  switch (market) {
    case 'SINDOBONG':
      return '신도봉시장';
    case 'BANGHAKDONG':
      return '방학동도깨비시장';
    case 'SINCHANG':
      return '신창시장';
    case 'CHANDONG':
      return '창동골목시장';
    case 'SSANGMUN':
      return '쌍문시장';
    case 'BAEGUN':
      return '백운시장';
    default:
      return market;
  }
};

// Local fallback components (do not mutate imported namespace)
const Loading: React.FC<React.PropsWithChildren> =
  // @ts-ignore
  (M as any).Loading || ((props) => <div style={{ padding: 12, color: '#666' }} {...props} />);
const ErrorText: React.FC<React.PropsWithChildren> =
  // @ts-ignore
  (M as any).ErrorText || ((props) => <div style={{ padding: 12, color: 'crimson' }} {...props} />);

function MerchantHome() {
  const [stores, setStores] = useState<StoredStore[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetchErr, setFetchErr] = useState('');
  const [status, setStatus] = useState<BusinessStatus>(() => {
    const saved = localStorage.getItem('merchantHome:status');
    return saved === 'open' || saved === 'closed' ? (saved as BusinessStatus) : 'open';
  });
  const navigate = useNavigate();
  const [registerMode, setRegisterMode] = useState<'voice' | 'text'>(() => {
    const saved = localStorage.getItem('registerMode:default');
    return saved === 'text' ? 'text' : 'voice';
  });

  useEffect(() => {
    let mounted = true;
    const url = '/api/store/me';
    dbg('fetch', url);
    (async () => {
      try {
        setLoading(true);
        setFetchErr('');
        const res = await api.get(url, { validateStatus: () => true });
        console.log('Response status:', res.status, 'data:', res.data);
        if (!mounted) return;
        if (res.status === 200 && res.data) {
          setStores([res.data]);
          if (typeof res.data.open === 'boolean') {
            setStatus(res.data.open ? 'open' : 'closed');
          }
        } else if (res.status === 204 || res.status === 404) {
          setStores([]);
        } else if (res.status === 401) {
          dbg('unauthorized (401) -> redirect /login');
          navigate('/login', { replace: true });
        } else {
          dbg('error response', res.status, res.data);
          setStores([]);
          setFetchErr(
            typeof res.data === 'string'
              ? res.data
              : res.data?.message || '상점 정보를 불러오지 못했습니다.'
          );
        }
      } catch (e) {
        dbg('network error', e);
        if (mounted) {
          setStores([]);
          setFetchErr('네트워크 오류로 상점 정보를 불러오지 못했습니다.');
        }
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [navigate]);

  useEffect(() => {
    localStorage.setItem('merchantHome:status', status);
  }, [status]);

  useEffect(() => {
    try {
      localStorage.setItem('registerMode:default', registerMode);
    } catch {}
  }, [registerMode]);

  // Retrieve current and original product lists
  const productListStr = localStorage.getItem('product:list');
  const originalProductListStr = localStorage.getItem('product:originalList');
  let productList: Product[] = [];
  let originalProductList: Product[] = [];

  try {
    if (productListStr) productList = JSON.parse(productListStr);
  } catch {}
  try {
    if (originalProductListStr) originalProductList = JSON.parse(originalProductListStr);
  } catch {}

  // Helper to find original product by id
  const findOriginalProduct = (id: string) => originalProductList.find((p) => p.id === id);

  // 변경 로그 로드 (생성/수정/삭제 이력)
  type ChangeEntry = {
    id: string;
    updatedAt: number;
    before: { name: string; price: number; unit: string; stock: any } | null;
    after: { name: string; price: number; unit: string; stock: any } | null;
  };
  const changesRaw = localStorage.getItem('product:changes');
  let changeLog: ChangeEntry[] = [];
  try {
    if (changesRaw) changeLog = JSON.parse(changesRaw);
  } catch {}
  const hasChanges = changeLog.length > 0;

  // 최신 수정 시각 (updatedAt) 집계
  const latestUpdatedAt = productList.reduce((m, p) => Math.max(m, p.updatedAt ?? 0), 0);

  // 변경 감지 후, 첫 렌더 직후 원본으로 자동 확정
  useEffect(() => {
    if (!hasChanges) return;
    try {
      const lastCommitted = Number(localStorage.getItem('product:lastCommittedAt') || '0');
      // 새 변경분이 있을 때만 확정(중복 확정 방지)
      if (latestUpdatedAt > lastCommitted) {
        // 페인트 이후에 실행되어, 이번 렌더에선 변경 내역이 한 번 보이고 다음 렌더부터 사라지도록 함
        requestAnimationFrame(() => {
          const current = localStorage.getItem('product:list');
          localStorage.setItem('product:originalList', current ?? '[]');
          localStorage.setItem('product:lastCommittedAt', String(latestUpdatedAt));
        });
      }
    } catch {}
  }, [hasChanges, latestUpdatedAt]);

  // Special 리스트 전체 불러오기 (최근 저장 순 정렬) + 동일 품명은 최신 1개만 노출
  type SpecialEntry = {
    id: string;
    name: string;
    price: number;
    unit: string;
    stock: any;
    startTime: string;
    endTime: string;
    createdAt: number;
  };
  let specials: SpecialEntry[] = [];
  try {
    const raw = localStorage.getItem('product:specials');
    if (raw) specials = JSON.parse(raw);
  } catch {}
  // 동일 name에 대해 createdAt이 가장 최신인 항목만 남기기
  const latestByName = new Map<string, SpecialEntry>();
  for (const sp of specials) {
    const prev = latestByName.get(sp.name);
    if (!prev || (sp.createdAt ?? 0) < (sp.createdAt ?? 0)) {
      latestByName.set(sp.name, sp);
    } else if (!prev) {
      latestByName.set(sp.name, sp);
    }
  }
  // 위 루프의 비교 버그 수정: 올바른 비교로 재계산
  latestByName.clear();
  for (const sp of specials) {
    const prev = latestByName.get(sp.name);
    if (!prev || (sp.createdAt ?? 0) > (prev.createdAt ?? 0)) {
      latestByName.set(sp.name, sp);
    }
  }
  const specialsUnique = Array.from(latestByName.values()).sort(
    (a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0)
  );

  useEffect(() => {
    const token = sessionStorage.getItem('auth:token');
    if (import.meta.env.DEV && token) {
      try {
        const payload = JSON.parse(atob(token.split('.')[1]));
        console.log('[DEV token payload]', payload);
      } catch (e) {
        console.warn('token payload decode fail', e);
      }
    }
  }, []);

  return (
    <>
      <Header />

      <M.MerchantHome>
        {loading ? (
          <Loading>불러오는 중…</Loading>
        ) : stores.length === 0 ? (
          <>
            {fetchErr && <ErrorText>❗ {fetchErr}</ErrorText>}
            <EmptyStoreCard />
          </>
        ) : (
          <>
            <BusinessStatusToggle
              value={status}
              onChange={(next) => setStatus(next)}
              labels={{ open: '영업중', closed: '영업종료' }}
            />
            <M.Space />
            <M.MarketCardWrapper
              onClick={() =>
                navigate('/storeRegister', {
                  state: { ...stores[0], status },
                })
              }
            >
              <MarketCard
                name={stores[0].name}
                marketName={marketDisplayName(stores[0].market)}
                status={status}
                imageUrl={stores[0].imageUrl}
                showArrow={true}
              />
            </M.MarketCardWrapper>
            <M.SmallSpace />

            <M.ProductRegistCardWrapper
              onClick={() =>
                navigate('/productRegister', {
                  state: { defaultMode: registerMode },
                })
              }
            >
              <M.Wrapper>
                <M.ProductRegistCard>지금 이런 걸 팔고 있어요</M.ProductRegistCard>
                <RightArrow />
              </M.Wrapper>
            </M.ProductRegistCardWrapper>

            <M.SmallSpace />

            {/* 상품 변경 */}
            <M.ProductRegistCardWrapper
              onClick={() =>
                navigate('/product/edit', { state: { source: 'home', defaultMode: registerMode } })
              }
            >
              <M.Wrapper>
                <M.ProductRegistCard>상품 정보를 변경할래요</M.ProductRegistCard>
                <RightArrow />
              </M.Wrapper>
              {hasChanges &&
                changeLog
                  .slice() // 안전 복사
                  .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0)) // 최신 우선 정렬
                  .filter((entry, idx, arr) => arr.findIndex((e) => e.id === entry.id) === idx) // 같은 id는 최신 것만 남기기
                  .slice(0, 3)
                  .map((entry) => {
                    const nameChanged = entry.before?.name !== entry.after?.name;
                    const priceChanged = entry.before?.price !== entry.after?.price;
                    const unitChanged = entry.before?.unit !== entry.after?.unit;
                    const stockChanged = entry.before?.stock !== entry.after?.stock;

                    // after 기준으로 표시 (삭제의 경우 after=null 이므로 before 기준 표시)
                    const show = entry.after ?? entry.before!;
                    return (
                      <M.ChangeRow key={`${entry.id}-${entry.updatedAt}`}>
                        <M.ChangeText $first $changed={!!nameChanged}>
                          {show.name}
                        </M.ChangeText>
                        <M.ChangeCol>
                          <M.ChangeText $changed={!!priceChanged}>
                            {show.price.toLocaleString()}원
                          </M.ChangeText>
                          <M.ChangeLabel>/</M.ChangeLabel>
                          <M.ChangeText $changed={!!unitChanged}>{show.unit}</M.ChangeText>
                        </M.ChangeCol>
                        <M.ChangeCol>
                          <M.ChangeText $changed={!!stockChanged}>{show.stock}</M.ChangeText>
                        </M.ChangeCol>
                      </M.ChangeRow>
                    );
                  })}
            </M.ProductRegistCardWrapper>
            <M.SmallSpace />

            {/* 특가 */}
            <M.ProductRegistCardWrapper
              onClick={() =>
                navigate('/specialRegister', {
                  state: { source: 'home', defaultMode: registerMode },
                })
              }
            >
              <M.Wrapper>
                <M.ProductRegistCard>이거 특가로 팔래요</M.ProductRegistCard>
                <RightArrow />
              </M.Wrapper>
              {specialsUnique.length > 0 && (
                <>
                  {specialsUnique.map((sp) => {
                    // 기존 상품과 비교해 변경 사항만 강조
                    const base = productList.find((p) => p.name === sp.name);
                    const priceChanged = base ? base.price !== sp.price : true;
                    const unitChanged = base ? base.unit !== sp.unit : true;
                    return (
                      <M.SpPreview key={sp.id}>
                        <M.SpName>{sp.name}</M.SpName>
                        <M.SpPriceWrap>
                          <M.Em $changed={priceChanged}>{sp.price.toLocaleString()}원</M.Em>
                          <M.Slash>/</M.Slash>
                          <M.Em $changed={unitChanged}>{sp.unit}</M.Em>
                        </M.SpPriceWrap>
                        <M.TimeBadge>
                          {sp.startTime} - {sp.endTime}
                        </M.TimeBadge>
                      </M.SpPreview>
                    );
                  })}
                </>
              )}
            </M.ProductRegistCardWrapper>

            {/* 등록 방식 */}
            <M.SmallSpace />

            <M.ProductRegistCardWrapper>
              <M.Wrapper>
                <M.ProductRegistCard>상품 등록, 이렇게 할래요</M.ProductRegistCard>
              </M.Wrapper>

              {/* 음성 선택 */}
              <M.ModeRow>
                <M.RadioLabel>
                  <M.HiddenRadio
                    type="radio"
                    name="registerMode"
                    value="voice"
                    checked={registerMode === 'voice'}
                    onChange={() => setRegisterMode('voice')}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                  />
                  <M.RadioCircle $checked={registerMode === 'voice'}>
                    <M.RadioDot $checked={registerMode === 'voice'} />
                  </M.RadioCircle>
                  <M.MicWrapper>
                    <Mic />
                    음성<M.MicText>말로 빠르게 등록해요</M.MicText>
                  </M.MicWrapper>
                </M.RadioLabel>
              </M.ModeRow>

              {/* 텍스트 선택 */}
              <M.ModeRow>
                <M.RadioLabel>
                  <M.HiddenRadio
                    type="radio"
                    name="registerMode"
                    value="text"
                    checked={registerMode === 'text'}
                    onChange={() => setRegisterMode('text')}
                    style={{ position: 'absolute', opacity: 0, pointerEvents: 'none' }}
                  />
                  <M.RadioCircle $checked={registerMode === 'text'}>
                    <M.RadioDot $checked={registerMode === 'text'} />
                  </M.RadioCircle>
                  <M.MicWrapper>
                    <Text />
                    텍스트<M.TextText>직접 정확히 눌러서 등록해요</M.TextText>
                  </M.MicWrapper>
                </M.RadioLabel>
              </M.ModeRow>
            </M.ProductRegistCardWrapper>
          </>
        )}
      </M.MerchantHome>
    </>
  );
}

export default MerchantHome;
