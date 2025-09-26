// src/pages/customer/CustomerHome.tsx (MyPage)
import React, { useEffect, useState, useCallback } from 'react';
import Header from '@components/Header';
import Modal from '@components/Modal';
import { listKeywords, deleteKeyword } from '@lib/api/keywords';
import { listFavoriteStores, unfavoriteStore, type FavStore } from '@lib/api/favorites';
import { listRecentStores, removeRecentStore, type RecentStore } from '@lib/api/recent';
import { logout, withdraw } from '@lib/api/auth';
import * as I from '@styles/customer/InterestMarketStyle';
import DeleteBtn from '@assets/deleteButton.svg?react';
import WarningIcon from '@assets/WarningIcon.svg?react';
import RightArrow from '@assets/RightArrow.svg?react';
import BottomLine from '@assets/BottomLine.svg?react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const api = axios.create({
  baseURL: 'https://n0t4u.shop',
  headers: { 'Content-Type': 'application/json', Accept: '*/*' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  if (!config.url?.includes('/api/vapid')) {
    const token =
      localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || '';
    if (token) {
      (config.headers = config.headers || {}).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 푸시 알림 관련 함수들 (CustomerHome.tsx에서 가져옴)
async function getPushStatus(): Promise<{ pushEnabled: boolean } | null> {
  try {
    const { data } = await api.get('/api/push');
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.warn('[push] status fetch failed', err.response?.status, err.response?.data);
    }
    return null;
  }
}

async function patchPushEnabled(enabled: boolean): Promise<boolean> {
  try {
    const res = await api.patch('/api/push', { pushEnabled: enabled });
    const serverEnabled = (res.data?.pushEnabled ?? res.data?.enabled ?? enabled) as boolean;
    console.log('[push] patchPushEnabled ->', res.status, res.data);
    return !!serverEnabled;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.warn('[push] patch failed', err.response?.status, err.response?.data);
    }
    return false;
  }
}

async function upsertSubscriptionToServer(sub: PushSubscription): Promise<boolean> {
  try {
    const j = sub.toJSON() as { endpoint?: string; keys?: { p256dh?: string; auth?: string } };
    const endpoint = j?.endpoint as string | undefined;
    const p256dh = j?.keys?.p256dh as string | undefined;
    const auth = j?.keys?.auth as string | undefined;

    if (!endpoint || !p256dh || !auth) {
      console.warn('[push] invalid subscription payload', {
        endpoint,
        p256dh: !!p256dh,
        auth: !!auth,
      });
      return false;
    }

    const payload = { endpoint, p256dh, auth };
    console.log('[push] upsert payload(strict) →', payload);

    const res = await api.post('/api/subscription', payload, {
      validateStatus: () => true,
    });
    console.log('[push] upsert response:', res.status, res.data);
    return res.status >= 200 && res.status < 300;
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.warn('[push] upsert failed', err.response?.status, err.response?.data);
    }
    return false;
  }
}

async function getVapidPublicKey(): Promise<string | null> {
  try {
    const { data } = await api.get('/api/vapid');
    const key = (typeof data === 'string' ? data : data?.publicKey ?? data?.vapid ?? data?.key) as
      | string
      | undefined;
    if (!key || typeof key !== 'string') return null;
    console.log('[push] VAPID key fetched:', key);
    return key.trim();
  } catch (err) {
    if (axios.isAxiosError(err)) {
      console.warn('[push] vapid fetch failed', err.response?.status, err.response?.data);
    }
    return null;
  }
}

function urlBase64ToUint8Array(base64String: string) {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = atob(base64);
  const outputArray = new Uint8Array(rawData.length);
  for (let i = 0; i < rawData.length; ++i) outputArray[i] = rawData.charCodeAt(i);
  return outputArray;
}

type Store = {
  id: number;
  name: string;
  market: string;
  open: boolean;
  thumb: string;
};

const MARKET_KEY_TO_LABEL: Record<string, string> = {
  SINDOBONG: '신도봉시장',
  CHANGDONG: '창동골목시장',
  BANGHAKDONG: '방학동도깨비시장',
  SINCHANG: '신창시장',
  SSANGMUN: '쌍문시장',
  BAEGUN: '백운시장',
};

export default function CustomerHome() {
  /* ---------- 로그인 상태 확인 ---------- */
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [isCheckingAuth, setIsCheckingAuth] = useState<boolean>(true);

  /* ---------- 모달 상태 ---------- */
  const [logoutModalOpen, setLogoutModalOpen] = useState<boolean>(false);
  const [withdrawModalOpen, setWithdrawModalOpen] = useState<boolean>(false);
  const [loginRequiredModalOpen, setLoginRequiredModalOpen] = useState<boolean>(false);

  /* ---------- 상세 상점 이동 ---------- */
  const navigate = useNavigate();

  /* ---------- 푸시 알림 상태 ---------- */
  const [notify, setNotify] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token =
          localStorage.getItem('accessToken') ||
          sessionStorage.getItem('accessToken') ||
          sessionStorage.getItem('auth:token');
        if (token) {
          // 토큰이 있으면 로그인 상태로 설정
          setIsLoggedIn(true);
        } else {
          setIsLoggedIn(false);
        }
      } catch {
        setIsLoggedIn(false);
      } finally {
        setIsCheckingAuth(false);
      }
    };

    checkAuth();
  }, []);

  // 로그인된 상태에서만 푸시 알림 상태 확인
  useEffect(() => {
    if (!isLoggedIn) return;

    let alive = true;
    (async () => {
      try {
        if (!('serviceWorker' in navigator) || !('Notification' in window)) {
          if (alive) setNotify(false);
          return;
        }
        const perm = Notification.permission;
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        const server = await getPushStatus();
        const serverOn = !!server?.pushEnabled;
        const clientOn = perm === 'granted' && !!sub;
        const shouldOn = serverOn && clientOn;
        if (alive) setNotify(shouldOn);
      } catch {
        if (alive) setNotify(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [isLoggedIn]);

  // 로그아웃 모달 열기
  const handleLogout = () => {
    setLogoutModalOpen(true);
  };

  // 실제 로그아웃 처리
  const confirmLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error('로그아웃 API 호출 실패:', error);
      // API 호출이 실패해도 로컬 로그아웃은 진행
    }

    // 로컬 스토리지 정리
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('auth:token');
    sessionStorage.removeItem('auth:role');

    // axios 기본 헤더도 정리
    delete axios.defaults.headers.common.Authorization;

    setIsLoggedIn(false);
    setLogoutModalOpen(false);
    navigate('/login', { replace: true });
  };

  // 회원 탈퇴 모달 열기
  const handleWithdraw = () => {
    setWithdrawModalOpen(true);
  };

  // 실제 회원 탈퇴 처리
  const confirmWithdraw = async () => {
    try {
      await withdraw();
    } catch (error) {
      console.error('회원탈퇴 API 호출 실패:', error);
      // API 호출이 실패해도 로컬 로그아웃은 진행
    }

    // 로컬 스토리지 정리
    localStorage.removeItem('accessToken');
    sessionStorage.removeItem('accessToken');
    sessionStorage.removeItem('auth:token');
    sessionStorage.removeItem('auth:role');

    // axios 기본 헤더도 정리
    delete axios.defaults.headers.common.Authorization;

    setIsLoggedIn(false);
    setWithdrawModalOpen(false);
    navigate('/', { replace: true });
  };

  // 로그인 필요한 기능 시도 시 호출
  const handleLoginRequired = () => {
    setLoginRequiredModalOpen(true);
  };

  /* ---------- 관심 키워드 ---------- */
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwLoading, setKwLoading] = useState(false);
  const [kwSaving, setKwSaving] = useState(false);
  const [kwEditing, setKwEditing] = useState(false);
  const [kwDraft, setKwDraft] = useState<string[]>([]);
  const [kwVisible, setKwVisible] = useState(3);

  useEffect(() => {
    if (!isLoggedIn) return;

    (async () => {
      setKwLoading(true);
      try {
        const list = await listKeywords();
        setKeywords(list.map((k) => k.word));
        setKwVisible(3);
      } finally {
        setKwLoading(false);
      }
    })();
  }, [isLoggedIn]);

  const toggleKwEdit = async () => {
    if (!kwEditing) {
      setKwDraft(keywords);
      setKwEditing(true);
      return;
    }
    setKwSaving(true);
    try {
      const removed = keywords.filter((w) => !kwDraft.includes(w));
      if (removed.length) {
        await Promise.allSettled(removed.map((w) => deleteKeyword(w)));
      }
      setKeywords(kwDraft);
      setKwVisible(() => Math.min(3, kwDraft.length));
    } finally {
      setKwSaving(false);
      setKwEditing(false);
    }
  };

  const removeKw = (idx: number) => setKwDraft((list) => list.filter((_, i) => i !== idx));
  const kwList = kwEditing ? kwDraft : keywords.slice(0, kwVisible);
  const showKwMore = !kwEditing && kwVisible < keywords.length;

  /* ---------- 관심 상점 ---------- */
  const [favStores, setFavStores] = useState<Store[]>([]);
  const [favLoading, setFavLoading] = useState(false);
  const [favSaving, setFavSaving] = useState(false);
  const [favEditing, setFavEditing] = useState(false);
  const [favDraft, setFavDraft] = useState<Store[]>([]);
  const [favVisible, setFavVisible] = useState(3);

  const toMarketLabel = useCallback(
    (market: string, marketLabel?: string) => marketLabel || MARKET_KEY_TO_LABEL[market] || market,
    []
  ); // 라벨 우선, 없으면 코드→라벨, 그래도 없으면 원본

  //빈 배경값 대체
  const FALLBACK_THUMB = 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=256&q=80';

  const mapFavToStore = useCallback(
    (s: FavStore): Store => ({
      id: s.id,
      name: s.name,
      market: toMarketLabel(s.market, s.marketLabel),
      open: s.open,
      thumb: s.imageUrl && s.imageUrl.trim() ? s.imageUrl : FALLBACK_THUMB, // imageUrl 우선
    }),
    [toMarketLabel]
  );

  useEffect(() => {
    if (!isLoggedIn) return;

    (async () => {
      setFavLoading(true);
      try {
        const list = await listFavoriteStores();
        const mapped = list.map(mapFavToStore);
        setFavStores(mapped);
        setFavVisible(3);
      } finally {
        setFavLoading(false);
      }
    })();
  }, [isLoggedIn, mapFavToStore]);

  const toggleFavEdit = async () => {
    if (!favEditing) {
      setFavDraft(favStores);
      setFavEditing(true);
      return;
    }
    setFavSaving(true);
    try {
      const removedIds = favStores
        .filter((s) => !favDraft.some((d) => d.id === s.id))
        .map((s) => s.id);
      if (removedIds.length) {
        await Promise.allSettled(removedIds.map((id) => unfavoriteStore(id)));
      }
      setFavStores(favDraft);
      setFavVisible(() => Math.min(3, favDraft.length));
    } finally {
      setFavSaving(false);
      setFavEditing(false);
    }
  };

  const removeFav = (id: number) => setFavDraft((list) => list.filter((s) => s.id !== id));
  const favList = favEditing ? favDraft : favStores.slice(0, favVisible);
  const showFavMore = !favEditing && favVisible < favStores.length;

  /* ---------- 최근 본 상점 (API) ---------- */
  const [recentStores, setRecentStores] = useState<Store[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentSaving, setRecentSaving] = useState(false);
  const [recentEditing, setRecentEditing] = useState(false);
  const [recentDraft, setRecentDraft] = useState<Store[]>([]);
  const [recentVisible, setRecentVisible] = useState(3);

  const mapRecentToStore = useCallback(
    (s: RecentStore): Store => ({
      id: s.id,
      name: s.name,
      market: toMarketLabel(s.market, s.marketLabel),
      open: s.open,
      thumb: s.imageUrl && s.imageUrl.trim() ? s.imageUrl : FALLBACK_THUMB, // imageUrl 우선
    }),
    [toMarketLabel]
  );

  useEffect(() => {
    if (!isLoggedIn) return;

    (async () => {
      setRecentLoading(true);
      try {
        const list = await listRecentStores(); // GET /api/consumer/recent
        setRecentStores(list.map(mapRecentToStore)); // 화면용 매핑
        setRecentVisible(3);
      } finally {
        setRecentLoading(false);
      }
    })();
  }, [isLoggedIn, mapRecentToStore]);

  const toggleRecentEdit = async () => {
    if (!recentEditing) {
      setRecentDraft(recentStores);
      setRecentEditing(true);
      return;
    }
    setRecentSaving(true);
    try {
      const removedIds = recentStores
        .filter((s) => !recentDraft.some((d) => d.id === s.id))
        .map((s) => s.id);
      if (removedIds.length) {
        await Promise.allSettled(removedIds.map((id) => removeRecentStore(id))); // DELETE /recent/{id}
      }
      setRecentStores(recentDraft);
      setRecentVisible(() => Math.min(3, recentDraft.length));
    } finally {
      setRecentSaving(false);
      setRecentEditing(false);
    }
  };

  const removeRecent = (id: number) => setRecentDraft((list) => list.filter((s) => s.id !== id));

  const recentList = recentEditing ? recentDraft : recentStores.slice(0, recentVisible);
  const showRecentMore = !recentEditing && recentVisible < recentStores.length;

  //영업중 / 영업종료 onoff
  function OpenStatusChip({ open }: { open: boolean }) {
    return (
      <I.Chip $green={open} aria-label={open ? '영업중' : '영업 종료'}>
        <I.Dot $gray={!open} /> {open ? '영업중' : '영업 종료'}
      </I.Chip>
    );
  }

  /* ---------- 렌더 ---------- */

  // 로딩 중이면 로딩 표시
  if (isCheckingAuth) {
    return (
      <>
        <Header />
        <I.PageWithHeader>
          <I.Empty>로딩 중...</I.Empty>
        </I.PageWithHeader>
      </>
    );
  }

  // 로그인되지 않은 상태
  if (!isLoggedIn) {
    return (
      <>
        <Header />
        <I.PageWithHeader>
          <I.PageTitle>마이페이지</I.PageTitle>

          {/* 로그인 안내 카드 */}
          <I.LoginCard>
            <WarningIcon width={16} height={16} />
            <I.LoginText>로그인 후 이용 가능한 페이지예요</I.LoginText>
          </I.LoginCard>

          {/* 특가 알림 토글 (비활성화) */}
          <I.ToggleRow>
            <I.PlaceholderBar />
            <I.Switch type="button" aria-pressed={false} $on={false} disabled />
          </I.ToggleRow>

          {/* 관심 키워드 섹션 */}
          <I.Section>
            <I.SectionHead>
              <I.SectionTitle>관심 키워드</I.SectionTitle>
              <I.EditBtn type="button" onClick={handleLoginRequired}>
                편집
              </I.EditBtn>
            </I.SectionHead>
            <I.PlaceholderCard onClick={handleLoginRequired}>
              <I.PlaceholderBar />
              <I.SearchIcon aria-hidden viewBox="0 0 24 24">
                <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" fill="none" />
                <line x1="21" y1="21" x2="16.65" y2="16.65" stroke="currentColor" strokeWidth="2" />
              </I.SearchIcon>
            </I.PlaceholderCard>
          </I.Section>

          {/* 관심 상점 섹션 */}
          <I.Section>
            <I.SectionHead>
              <I.SectionTitle>관심 상점</I.SectionTitle>
              <I.EditBtn type="button" onClick={handleLoginRequired}>
                편집
              </I.EditBtn>
            </I.SectionHead>
            <I.PlaceholderStoreCard onClick={handleLoginRequired}>
              <I.PlaceholderImage />
              <I.PlaceholderInfo>
                <I.PlaceholderBar />
                <I.PlaceholderBar />
              </I.PlaceholderInfo>
              <RightArrow />
            </I.PlaceholderStoreCard>
          </I.Section>

          {/* 최근 본 상점 섹션 */}
          <I.Section>
            <I.SectionHead>
              <I.SectionTitle>최근 본 상점</I.SectionTitle>
              <I.EditBtn type="button" onClick={handleLoginRequired}>
                편집
              </I.EditBtn>
            </I.SectionHead>
            <I.PlaceholderStoreCard onClick={handleLoginRequired}>
              <I.PlaceholderImage />
              <I.PlaceholderInfo>
                <I.PlaceholderBar />
                <I.PlaceholderBar />
              </I.PlaceholderInfo>
              <RightArrow />
            </I.PlaceholderStoreCard>
          </I.Section>

          {/* 하단 버튼들 */}
          <I.BottomSection>
            <BottomLine />
            <I.BottomButtons>
              <I.LoginButton onClick={() => navigate('/login')}>로그인</I.LoginButton>
              <I.StartButton onClick={() => navigate('/signup')}>시작하기</I.StartButton>
            </I.BottomButtons>
          </I.BottomSection>
        </I.PageWithHeader>
      </>
    );
  }

  // 로그인된 상태
  return (
    <>
      <Header />
      <I.PageWithHeader>
        <I.PageTitle>마이페이지</I.PageTitle>

        {/* 특가 알림 토글 */}
        <I.ToggleRow>
          <I.ToggleLabel>특가가 뜨면 알려드릴게요</I.ToggleLabel>
          <I.Switch
            type="button"
            aria-pressed={notify}
            $on={notify}
            onClick={async () => {
              try {
                if (!notify) {
                  // 켜기: 권한 요청 → SW 준비 → 구독 생성/재사용 → 콘솔로 확인
                  if (!('Notification' in window)) {
                    alert('이 브라우저는 알림을 지원하지 않습니다.');
                    return;
                  }
                  const perm = await Notification.requestPermission();
                  if (perm !== 'granted') {
                    setNotify(false);
                    return;
                  }

                  if (!('serviceWorker' in navigator)) {
                    alert('서비스워커를 지원하지 않습니다.');
                    return;
                  }

                  const reg = await navigator.serviceWorker.ready;
                  let sub = await reg.pushManager.getSubscription();
                  if (sub) {
                    console.log('[push] existing subscription found → VAPID fetch skipped');
                  } else {
                    console.log('[push] no subscription found → fetching VAPID & creating one');
                    const vapid = await getVapidPublicKey();
                    if (!vapid) {
                      alert('서버에서 VAPID 공개키를 가져오지 못했습니다.');
                      return;
                    }
                    console.log('[push] VAPID fetched (pre-subscribe):', vapid);
                    sub = await reg.pushManager.subscribe({
                      userVisibleOnly: true,
                      applicationServerKey: urlBase64ToUint8Array(vapid),
                    });
                  }

                  console.log('[push] 구독 생성/확인 완료:', sub.toJSON());

                  // 1) 구독 정보를 서버에 먼저 저장
                  const saved = await upsertSubscriptionToServer(sub);
                  if (!saved) {
                    alert('구독 정보를 서버에 저장하지 못했습니다. 다시 시도해 주세요.');
                  }

                  // 서버에 ON 저장 후, 즉시 서버-클라이언트 상태 재확인
                  const ok = await patchPushEnabled(true);
                  if (!ok) {
                    alert('서버에 푸시 ON 설정을 저장하지 못했습니다.');
                  }

                  // 서버에 저장되었는지 즉시 조회해서 토글 상태를 일관되게 맞춘다
                  try {
                    const server = await getPushStatus();
                    const serverOn = !!server?.pushEnabled;
                    const permNow = Notification.permission === 'granted';
                    const hasSubNow = !!(await reg.pushManager.getSubscription());
                    const finalOn = serverOn && permNow && hasSubNow;
                    console.log('[push] 서버 상태 확인(ON 후):', {
                      serverOn,
                      permNow,
                      hasSubNow,
                      finalOn,
                    });
                    setNotify(finalOn);
                  } catch {
                    setNotify(true); // 조회 실패시엔 낙관적으로 ON 유지
                  }
                } else {
                  const reg = await navigator.serviceWorker.getRegistration();
                  const sub = reg ? await reg.pushManager.getSubscription() : null;
                  if (sub) {
                    await sub.unsubscribe();
                    console.log('[push] 구독 해지 완료:', sub.endpoint);
                  } else {
                    console.log('[push] 활성 구독이 없어 해지 생략');
                  }
                  // 서버 설정 OFF
                  const ok = await patchPushEnabled(false);
                  if (!ok) {
                    console.warn('[push] 서버 OFF 저장 실패');
                  }
                  // 서버에 OFF 저장 뒤에도 즉시 조회하여 최종 상태 동기화
                  try {
                    const server = await getPushStatus();
                    const serverOn = !!server?.pushEnabled;
                    const permNow = Notification.permission === 'granted';
                    const hasSubNow = !!(await (
                      await navigator.serviceWorker.getRegistration()
                    )?.pushManager.getSubscription());
                    const finalOn = serverOn && permNow && hasSubNow;
                    console.log('[push] 서버 상태 확인(OFF 후):', {
                      serverOn,
                      permNow,
                      hasSubNow,
                      finalOn,
                    });
                    setNotify(finalOn);
                  } catch {
                    setNotify(false);
                  }
                }
              } catch (err) {
                console.error('[push] toggle error', err);
                alert('알림 설정 중 오류가 발생했습니다.');
                setNotify(false);
              }
            }}
          />
        </I.ToggleRow>

        {/* 관심 키워드 */}
        <I.Section>
          <I.SectionHead>
            <I.SectionTitle>관심 키워드</I.SectionTitle>
            <I.EditBtn type="button" onClick={toggleKwEdit} disabled={kwLoading || kwSaving}>
              {kwEditing ? '완료' : '편집'}
            </I.EditBtn>
          </I.SectionHead>

          {kwLoading ? (
            <I.Empty>불러오는 중…</I.Empty>
          ) : kwList.length === 0 ? (
            <I.Empty>
              <I.EmptyIcon>!</I.EmptyIcon>아직 관심 키워드가 없어요
            </I.Empty>
          ) : (
            <I.KeywordList>
              {kwList.map((k, i) => (
                <I.KeywordRow key={`${k}-${i}`}>
                  <span>{k}</span>
                  {kwEditing ? (
                    <I.RemoveBtn
                      $size="sm"
                      type="button"
                      onClick={() => removeKw(i)}
                      aria-label="키워드 삭제"
                    >
                      <DeleteBtn width={16} height={16} />
                    </I.RemoveBtn>
                  ) : (
                    <I.SearchIcon aria-hidden viewBox="0 0 24 24">
                      <circle
                        cx="11"
                        cy="11"
                        r="7"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                      <line
                        x1="21"
                        y1="21"
                        x2="16.65"
                        y2="16.65"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </I.SearchIcon>
                  )}
                </I.KeywordRow>
              ))}
            </I.KeywordList>
          )}

          {!kwLoading && showKwMore && (
            <I.MoreBtn onClick={() => setKwVisible((prev) => Math.min(prev + 3, keywords.length))}>
              <I.DownIcon>▾</I.DownIcon> 더보기
            </I.MoreBtn>
          )}
        </I.Section>

        {/* 관심 상점 */}
        <I.Section>
          <I.SectionHead>
            <I.SectionTitle>관심 상점</I.SectionTitle>
            <I.EditBtn type="button" onClick={toggleFavEdit} disabled={favLoading || favSaving}>
              {favEditing ? '완료' : '편집'}
            </I.EditBtn>
          </I.SectionHead>

          {favLoading ? (
            <I.Empty>불러오는 중...</I.Empty>
          ) : favList.length === 0 ? (
            <I.Empty>
              <I.EmptyIcon>!</I.EmptyIcon>아직 관심 상점이 없어요
            </I.Empty>
          ) : (
            <I.List>
              {favList.map((s) => (
                <I.Card
                  key={s.id}
                  onClick={() => {
                    if (!favEditing) navigate(`/marketDetail/${s.id}`);
                  }}
                >
                  <I.Thumb src={s.thumb} alt={s.name} loading="lazy" />
                  <I.Info>
                    <I.Title>{s.name}</I.Title>
                    <I.MetaRow>
                      <I.Chip>{s.market}</I.Chip>
                      <OpenStatusChip open={s.open} />
                    </I.MetaRow>
                  </I.Info>

                  {favEditing ? (
                    <I.RemoveBtn
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFav(s.id);
                      }}
                      aria-label="상점 삭제"
                    >
                      <DeleteBtn width={16} height={16} />
                    </I.RemoveBtn>
                  ) : (
                    <I.Chevron aria-hidden>›</I.Chevron>
                  )}
                </I.Card>
              ))}
            </I.List>
          )}

          {!favLoading && showFavMore && (
            <I.MoreBtn
              onClick={() => setFavVisible((prev) => Math.min(prev + 3, favStores.length))}
            >
              <I.DownIcon>▾</I.DownIcon> 더보기
            </I.MoreBtn>
          )}
        </I.Section>

        {/* 최근 본 상점 */}
        <I.Section>
          <I.SectionHead>
            <I.SectionTitle>최근 본 상점</I.SectionTitle>
            <I.EditBtn
              type="button"
              onClick={toggleRecentEdit}
              disabled={recentLoading || recentSaving}
            >
              {recentEditing ? '완료' : '편집'}
            </I.EditBtn>
          </I.SectionHead>

          {recentLoading ? (
            <I.Empty>불러오는 중...</I.Empty>
          ) : recentList.length === 0 ? (
            <I.Empty>
              <I.EmptyIcon>!</I.EmptyIcon>최근 본 상점이 없어요
            </I.Empty>
          ) : (
            <I.List>
              {recentList.map((s) => (
                <I.Card
                  key={`r-${s.id}`}
                  onClick={() => {
                    if (!recentEditing) navigate(`/marketDetail/${s.id}`);
                  }}
                >
                  <I.Thumb src={s.thumb} alt={s.name} loading="lazy" />
                  <I.Info>
                    <I.Title>{s.name}</I.Title>
                    <I.MetaRow>
                      <I.Chip>{s.market}</I.Chip>
                      <OpenStatusChip open={s.open} />
                    </I.MetaRow>
                  </I.Info>

                  {recentEditing ? (
                    <I.RemoveBtn
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecent(s.id);
                      }}
                      aria-label="최근 본 상점 삭제"
                    >
                      <DeleteBtn width={16} height={16} />
                    </I.RemoveBtn>
                  ) : (
                    <I.Chevron aria-hidden>›</I.Chevron>
                  )}
                </I.Card>
              ))}
            </I.List>
          )}

          {!recentLoading && showRecentMore && (
            <I.MoreBtn
              onClick={() => setRecentVisible((prev) => Math.min(prev + 3, recentStores.length))}
            >
              <I.DownIcon>▾</I.DownIcon> 더보기
            </I.MoreBtn>
          )}
        </I.Section>

        {/* 하단 버튼들 */}
        <I.BottomSection>
          <BottomLine />
          <I.BottomButtons>
            <I.LogoutButton onClick={handleLogout}>로그아웃</I.LogoutButton>
            <I.WithdrawButton onClick={handleWithdraw}>회원 탈퇴</I.WithdrawButton>
          </I.BottomButtons>
        </I.BottomSection>
      </I.PageWithHeader>

      {/* 로그아웃 확인 모달 */}
      <Modal
        open={logoutModalOpen}
        title="로그아웃"
        description="현재 로그인된 계정에서 로그아웃돼요."
        cancelText="취소"
        confirmText="로그아웃"
        onClose={() => setLogoutModalOpen(false)}
        onConfirm={confirmLogout}
        variant="primary"
        width={320}
      />

      {/* 회원탈퇴 확인 모달 */}
      <Modal
        open={withdrawModalOpen}
        title="회원 탈퇴"
        description={
          <>
            회원 탈퇴 시 계정, 관심 키워드 등 <br /> <span>모든 데이터가 삭제</span>되며,{' '}
            <span>복구할 수 없어요</span>.
          </>
        }
        cancelText="취소"
        confirmText="회원 탈퇴"
        onClose={() => setWithdrawModalOpen(false)}
        onConfirm={confirmWithdraw}
        variant="danger"
        width={320}
      />

      {/* 로그인 안내 모달 */}
      <Modal
        open={loginRequiredModalOpen}
        title="회원 기능"
        description="로그인 후 이용 가능한 페이지예요"
        cancelText="로그인"
        confirmText="시작하기"
        onClose={() => {
          setLoginRequiredModalOpen(false);
          navigate('/login');
        }}
        onConfirm={() => {
          setLoginRequiredModalOpen(false);
          navigate('/signup');
        }}
        variant="primary"
        width={320}
      />
    </>
  );
}
