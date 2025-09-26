import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@components/Header';
import EmptyStoreCard from '@components/merchant/EmptyStoreCard';
import MarketCard from '@components/merchant/MarketCard';
import * as M from '@styles/merchant/MerchantHomeStyle';
import Modal from '@components/Modal';

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

const CHANGE_TTL = 12 * 60 * 60 * 1000; // 12시간 동안 변경 내역 유지 (새로고침 보호)

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

// 서버 응답 타입(필요 필드만)
type ApiProduct = {
  id: number;
  name: string;
  regularPrice: number;
  regularUnit: string;
  stockLevel: 'ENOUGH' | 'LOW' | 'NONE';
  dealPrice?: number;
  dealUnit?: string;
  dealStartAt?: string; // ISO
  dealEndAt?: string; // ISO
  hidden?: boolean;
};

// 홈에서 표시할 변경 로그 항목 타입
type ChangeEntry = {
  id: string;
  updatedAt: number;
  before: { name: string; price: number; unit: string; stock: any } | null;
  after: { name: string; price: number; unit: string; stock: any } | null;
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
    case 'CHANGDONG':
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
  const location = useLocation();
  const [registerMode, setRegisterMode] = useState<'voice' | 'text'>(() => {
    const saved = localStorage.getItem('registerMode:default');
    return saved === 'text' ? 'text' : 'voice';
  });
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [toggling, setToggling] = useState(false);
  const [changeLog, setChangeLog] = useState<ChangeEntry[]>(() => {
    try {
      const raw = localStorage.getItem('merchantHome:changeLog');
      if (!raw) return [];
      const arr = JSON.parse(raw) as ChangeEntry[];
      const now = Date.now();
      // TTL 적용 및 최대 3개만 즉시 노출
      return arr
        .filter((c) => now - (c.updatedAt ?? 0) <= CHANGE_TTL)
        .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
        .slice(0, 3);
    } catch {
      return [] as ChangeEntry[];
    }
  });

  // 특가(서버) 표시용
  type SpecialEntry = {
    id: string;
    name: string;
    price: number;
    unit: string;
    startTime: string; // HH:MM
    endTime: string; // HH:MM
    createdAt: number; // 정렬용
  };
  const [specialsServer, setSpecialsServer] = useState<SpecialEntry[]>([]);
  const fmtHM = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };
  // 특가 설정된 상품을 서버에서 가져와 표시
  const fetchSpecials = async () => {
    try {
      const res = await api.get('/api/product/me', { validateStatus: () => true });
      if (res.status === 200 && Array.isArray(res.data)) {
        const now = Date.now();
        const list = (res.data as ApiProduct[])
          .filter((p) => (p.dealPrice ?? 0) > 0 && p.dealStartAt && p.dealEndAt && !p.hidden)
          .map((p) => {
            const startMs = new Date(p.dealStartAt as string).getTime();
            const endMs = new Date(p.dealEndAt as string).getTime();
            return {
              id: String(p.id),
              name: p.name,
              price: Number(p.dealPrice!),
              unit: String(p.dealUnit || ''),
              startTime: fmtHM(p.dealStartAt),
              endTime: fmtHM(p.dealEndAt),
              createdAt: startMs,
              endMs,
            } as SpecialEntry & { endMs: number };
          })
          .filter((sp) => sp.endMs > now)
          .sort((a, b) => (b.createdAt ?? 0) - (a.createdAt ?? 0));
        setSpecialsServer(list);
      } else if (res.status === 401) {
        navigate('/login', { replace: true });
      } else {
        setSpecialsServer([]);
      }
    } catch (e) {
      if (DEBUG) console.warn('[MerchantHome] specials fetch error', e);
      setSpecialsServer([]);
    }
  };
  // 주기적으로 특가 만료를 반영 (30초마다)
  useEffect(() => {
    const timer = setInterval(() => fetchSpecials(), 30 * 1000);
    return () => clearInterval(timer);
  }, []);

  useEffect(() => {
    let alive = true;
    (async () => {
      await fetchSpecials();
    })();
    return () => {
      alive = false;
    };
  }, [navigate]);

  useEffect(() => {
    const st = (location.state || {}) as any;
    if (st && st.refresh === 'special') {
      if (DEBUG) dbg('special refresh signal received');
      fetchSpecials();
      // state 초기화 (뒤로가기 등에서 중복 트리거 방지)
      navigate(location.pathname, { replace: true, state: {} });
    }
  }, [location, navigate]);

  useEffect(() => {
    const onFocus = () => fetchSpecials();
    window.addEventListener('focus', onFocus);
    return () => window.removeEventListener('focus', onFocus);
  }, []);

  // 특가 종료/갱신 이벤트 수신 시 즉시 재조회 (ProductList 등에서 dispatch 가능)
  useEffect(() => {
    const onSpecialRefresh = () => {
      if (DEBUG) dbg('special event received -> refetch');
      fetchSpecials();
    };
    window.addEventListener('special:ended', onSpecialRefresh);
    window.addEventListener('special:updated', onSpecialRefresh);
    window.addEventListener('special:refresh', onSpecialRefresh);
    return () => {
      window.removeEventListener('special:ended', onSpecialRefresh);
      window.removeEventListener('special:updated', onSpecialRefresh);
      window.removeEventListener('special:refresh', onSpecialRefresh);
    };
  }, []);

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

  // 서버 상품 목록을 불러와 이전 스냅샷과 비교하여 변경 로그 구성
  useEffect(() => {
    let alive = true;
    const changeKey = 'merchantHome:changeLog';
    const readPersisted = () => {
      try {
        const raw = localStorage.getItem(changeKey);
        const arr = raw ? (JSON.parse(raw) as ChangeEntry[]) : [];
        const now = Date.now();
        return arr.filter((c) => now - (c.updatedAt ?? 0) <= CHANGE_TTL);
      } catch {
        return [] as ChangeEntry[];
      }
    };
    // 먼저 저장된 변경 내역을 즉시 반영해 깜빡임/유실 느낌을 줄임
    setChangeLog(readPersisted().slice(0, 3));
    (async () => {
      try {
        const res = await api.get('/api/product/me', { validateStatus: () => true });
        if (!alive) return;
        const persisted = readPersisted();
        if (res.status !== 200 || !Array.isArray(res.data)) {
          // API 실패/비정상 시에도 최근 변경 내역은 유지해서 새로고침에 날아가지 않게 함
          setChangeLog(persisted);
          return;
        }
        const nowList: ApiProduct[] = res.data as ApiProduct[];

        // 이전 스냅샷을 로컬에 저장/불러오기
        const snapKey = 'merchantHome:productSnapshot';
        const prevRaw = localStorage.getItem(snapKey);
        const prevList: ApiProduct[] = prevRaw ? JSON.parse(prevRaw) : [];

        // 비교: id 기준으로 before/after 생성
        const prevMap = new Map<number, ApiProduct>(prevList.map((p) => [p.id, p]));
        const nextMap = new Map<number, ApiProduct>(nowList.map((p) => [p.id, p]));

        const entries: ChangeEntry[] = [];
        const toUiStock = (s: ApiProduct['stockLevel']) =>
          s === 'ENOUGH' ? '충분함' : s === 'LOW' ? '적음' : '없음';

        // 추가/변경 감지
        for (const cur of nowList) {
          const prev = prevMap.get(cur.id);
          if (!prev) {
            // 신규 등록
            entries.push({
              id: String(cur.id),
              updatedAt: Date.now(),
              before: null,
              after: {
                name: cur.name,
                price: cur.regularPrice,
                unit: cur.regularUnit,
                stock: toUiStock(cur.stockLevel),
              },
            });
          } else {
            const changed =
              prev.name !== cur.name ||
              prev.regularPrice !== cur.regularPrice ||
              prev.regularUnit !== cur.regularUnit ||
              prev.stockLevel !== cur.stockLevel;
            if (changed) {
              entries.push({
                id: String(cur.id),
                updatedAt: Date.now(),
                before: {
                  name: prev.name,
                  price: prev.regularPrice,
                  unit: prev.regularUnit,
                  stock: toUiStock(prev.stockLevel),
                },
                after: {
                  name: cur.name,
                  price: cur.regularPrice,
                  unit: cur.regularUnit,
                  stock: toUiStock(cur.stockLevel),
                },
              });
            }
          }
        }
        // 삭제 감지
        for (const prev of prevList) {
          if (!nextMap.has(prev.id)) {
            entries.push({
              id: String(prev.id),
              updatedAt: Date.now(),
              before: {
                name: prev.name,
                price: prev.regularPrice,
                unit: prev.regularUnit,
                stock: toUiStock(prev.stockLevel),
              },
              after: null,
            });
          }
        }

        // 최신 변경 내역과 persisted를 합쳐서 중복은 제거, TTL 내 항목만 남김
        const nowTs = Date.now();
        const merged = [...entries, ...persisted]
          .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
          .filter(
            (item, idx, arr) =>
              idx === arr.findIndex((x) => x.id === item.id && x.updatedAt === item.updatedAt)
          )
          .filter((c) => nowTs - (c.updatedAt ?? 0) <= CHANGE_TTL)
          .slice(0, 10); // 저장은 여유롭게 10개까지

        // 화면엔 3개만 노출
        setChangeLog(merged.slice(0, 3));
        try {
          localStorage.setItem(changeKey, JSON.stringify(merged));
        } catch {}

        // 스냅샷 갱신
        localStorage.setItem(snapKey, JSON.stringify(nowList));
      } catch (e) {
        if (DEBUG) console.warn('[MerchantHome] product diff error', e);
        setChangeLog(readPersisted());
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // Special 리스트 전체 불러오기 (최근 저장 순 정렬) + 동일 품명은 최신 1개만 노출
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

  const handleToggle = async (next: BusinessStatus) => {
    const prev = status;
    // Optimistic UI update
    setStatus(next);
    try {
      setToggling(true);
      const body = { open: next === 'open' };
      dbg('toggle open ->', body);
      const res = await api.post('/api/store/open', body, { validateStatus: () => true });
      dbg('toggle result', res.status, res.data);

      if (res.status === 200 && res.data) {
        if (typeof res.data.open === 'boolean') {
          setStatus(res.data.open ? 'open' : 'closed');
        }
        // 서버가 최신 상점 정보를 돌려줄 수 있으므로 합쳐서 반영
        setStores((cur) => {
          if (!cur || cur.length === 0) return cur;
          const merged = { ...cur[0], ...res.data } as any;
          return [merged];
        });
      } else if (res.status === 401) {
        // 인증 만료 등
        setStatus(prev);
        navigate('/login', { replace: true });
      } else {
        // 실패: 원복
        setStatus(prev);
        const msg =
          typeof res.data === 'string'
            ? res.data
            : res.data?.message || '영업 상태 변경에 실패했습니다.';
        setFetchErr(msg);
        if (DEBUG) console.error('[MerchantHome] open toggle failed', res.status, res.data);
      }
    } catch (e) {
      setStatus(prev);
      setFetchErr('네트워크 오류로 영업 상태를 변경하지 못했습니다.');
      if (DEBUG) console.error('[MerchantHome] open toggle error', e);
    } finally {
      setToggling(false);
    }
  };

  const handleDeleteStore = async () => {
    try {
      dbg('request delete store');
      const res = await api.delete('/api/store/me', { validateStatus: () => true });
      dbg('delete result', res.status, res.data);

      if (res.status === 200 || res.status === 204) {
        setShowDeleteModal(false);
        // 로컬 상태 및 관련 캐시 정리
        setStores([]);
        setFetchErr('');
        try {
          localStorage.removeItem('merchantHome:productSnapshot');
          localStorage.removeItem('merchantHome:changeLog');
          localStorage.removeItem('product:specials');
        } catch {}
      } else if (res.status === 401) {
        setShowDeleteModal(false);
        navigate('/login', { replace: true });
      } else {
        const msg =
          typeof res.data === 'string'
            ? res.data
            : res.data?.message || '상점 삭제에 실패했습니다.';
        setFetchErr(msg);
      }
    } catch (e) {
      dbg('delete store error', e);
      setFetchErr('네트워크 오류로 상점을 삭제하지 못했습니다.');
    }
  };

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
              onChange={handleToggle}
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
              onClick={() => {
                // 변경 로그에서 가장 최근 항목을 편집 후보로 전달 (after → before 순)
                const latest = changeLog
                  .slice()
                  .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))[0];

                const candidate = latest
                  ? {
                      id: latest.id,
                      name: (latest.after?.name || latest.before?.name) ?? '',
                      regularPrice: latest.after?.price ?? latest.before?.price,
                      regularUnit: latest.after?.unit ?? latest.before?.unit,
                      stockLevel: latest.after?.stock ?? latest.before?.stock,
                    }
                  : undefined;

                navigate('/product/edit', {
                  state: {
                    source: 'home',
                    defaultMode: registerMode,
                    passedItem: candidate, // 편집 페이지에서 draft 초기화 힌트
                  },
                });
              }}
            >
              <M.Wrapper>
                <M.ProductRegistCard>상품 정보를 변경할래요</M.ProductRegistCard>
                <RightArrow />
              </M.Wrapper>
              {changeLog.length > 0 &&
                changeLog
                  .slice()
                  .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
                  .filter((entry, idx, arr) => arr.findIndex((e) => e.id === entry.id) === idx)
                  // 생성(before=null)과 삭제(after=null)는 제외, 수정만 노출
                  .filter((entry) => !!entry.before && !!entry.after)
                  .slice(0, 3)
                  .map((entry) => {
                    const nameChanged = entry.before?.name !== entry.after?.name;
                    const priceChanged = entry.before?.price !== entry.after?.price;
                    const unitChanged = entry.before?.unit !== entry.after?.unit;
                    const stockChanged = entry.before?.stock !== entry.after?.stock;
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
              onClick={() => {
                // 홈 미리보기에서 가장 최근의 진행 중 특가를 선택적으로 전달
                const candidate =
                  specialsServer && specialsServer.length > 0
                    ? specialsServer[0] // createdAt 기준 정렬됨
                    : undefined;

                navigate('/specialRegister', {
                  state: {
                    source: 'home',
                    defaultMode: registerMode,
                    // 특가 수정/재설정 화면에서 즉시 프리필할 수 있게 힌트 전달
                    passedItem: candidate
                      ? {
                          id: candidate.id,
                          name: candidate.name,
                          dealPrice: candidate.price,
                          dealUnit: candidate.unit,
                          // 시간은 HH:MM만 있으므로 화면에서 서버 재조회 or 보정
                        }
                      : undefined,
                  },
                });
              }}
            >
              <M.Wrapper>
                <M.ProductRegistCard>이거 특가로 팔래요</M.ProductRegistCard>
                <RightArrow />
              </M.Wrapper>
              {specialsServer.length > 0 && (
                <>
                  {specialsServer.map((sp) => (
                    <M.SpPreview key={sp.id}>
                      <M.SpName>{sp.name}</M.SpName>
                      <M.SpPriceWrap>
                        <M.Em $changed>{sp.price.toLocaleString()}원</M.Em>
                        <M.Slash>/</M.Slash>
                        <M.Em $changed>{sp.unit}</M.Em>
                      </M.SpPriceWrap>
                      <M.TimeBadge>
                        {sp.startTime} - {sp.endTime}
                      </M.TimeBadge>
                    </M.SpPreview>
                  ))}
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

            <M.SmallSpace />

            <M.ModalBtn type="button" onClick={() => setShowDeleteModal(true)}>
              상점 삭제
            </M.ModalBtn>

            <Modal
              open={showDeleteModal}
              onClose={() => setShowDeleteModal(false)}
              onConfirm={handleDeleteStore}
              title="상점 삭제"
              description={
                <>
                  상점을 삭제하면 등록된{' '}
                  <span>
                    모든 상품 데이터가 <br />
                    즉시 삭제
                  </span>
                  되며, <span>복구할 수 없어요.</span>
                </>
              }
              cancelText="취소"
              variant="danger"
              confirmText="상점 삭제"
            />
          </>
        )}
      </M.MerchantHome>
    </>
  );
}

export default MerchantHome;
