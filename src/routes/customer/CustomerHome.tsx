import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import Header from '@components/Header';
import * as C from '@styles/customer/CustomerHomeStyle';
import SearchIcon from '@assets/SearchIcon.svg?react';

const api = axios.create({
  baseURL: 'https://n0t4u.shop',
  headers: { 'Content-Type': 'application/json', Accept: '*/*' },
  withCredentials: true,
});

api.interceptors.request.use((config) => {
  // Do not add Authorization header to /api/consumer/vapid requests
  if (!config.url?.includes('/api/consumer/vapid')) {
    const token =
      localStorage.getItem('accessToken') || sessionStorage.getItem('accessToken') || '';
    if (token) {
      (config.headers = config.headers || {}).Authorization = `Bearer ${token}`;
    }
  }
  return config;
});

// 조회
async function getPushStatus(): Promise<{ pushEnabled: boolean } | null> {
  try {
    const { data } = await api.get('/api/consumer/push');
    return data;
  } catch (err: unknown) {
    if (axios.isAxiosError(err)) {
      console.warn('[push] status fetch failed', err.response?.status, err.response?.data);
    }
    return null;
  }
}

// 수정d
async function patchPushEnabled(enabled: boolean): Promise<boolean> {
  try {
    const res = await api.patch('/api/consumer/push', { pushEnabled: enabled });
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

// 서버에 구독 정보 저장/갱신
async function upsertSubscriptionToServer(sub: PushSubscription): Promise<boolean> {
  try {
    const j = sub.toJSON() as any;
    const endpoint = j?.endpoint as string | undefined;
    const p256dh = j?.keys?.p256dh as string | undefined;
    const auth = j?.keys?.auth as string | undefined;

    // 서버 스펙: { endpoint, p256dh, auth } 만 허용됨. (여분 필드 금지)
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

    // 정확히 2xx 만 성공 처리
    const res = await api.post('/api/consumer/subscription', payload, {
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

// 서버에서 VAPID 공개키 조회
async function getVapidPublicKey(): Promise<string | null> {
  try {
    const { data } = await api.get('/api/consumer/vapid');
    // 서버가 문자열 혹은 { publicKey } 형태 중 하나로 줄 수 있으니 모두 대응
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

const ChevronRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

function CustomerHome() {
  const [q, setQ] = useState(''); //검색어 입력 상태 관리
  const [notify, setNotify] = useState(false);
  const navigate = useNavigate();

  // 초기 렌더 시: 권한/구독 상태로 notify 복원
  useEffect(() => {
    let alive = true;
    (async () => {
      try {
        if (!('serviceWorker' in navigator) || !('Notification' in window)) {
          if (alive) setNotify(false);
          return;
        }
        const perm = Notification.permission; // 'granted' | 'denied' | 'default'
        const reg = await navigator.serviceWorker.getRegistration();
        const sub = reg ? await reg.pushManager.getSubscription() : null;
        const server = await getPushStatus();
        const serverOn = !!server?.pushEnabled; // 서버 설정
        const clientOn = perm === 'granted' && !!sub; // 클라이언트(권한+구독)
        const shouldOn = serverOn && clientOn;
        if (alive) setNotify(shouldOn);
      } catch {
        if (alive) setNotify(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, []);

  // notify 변경 시 로컬 저장 (선택)
  useEffect(() => {
    try {
      localStorage.setItem('notifyPref', notify ? 'on' : 'off');
    } catch {
      //
    }
  }, [notify]);

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = q.trim();
    if (!keyword) return;
    navigate({ pathname: '/keywordSearch', search: `?query=${encodeURIComponent(keyword)}` });
  };

  const onInterest = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ pathname: '/interestMarket' });
  };

  return (
    <>
      <Header />
      <C.Page>
        {/* 검색창 */}
        <C.SearchForm onSubmit={onSearch}>
          <C.SearchInput
            placeholder="지금 이런 걸 팔고 있어요"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <C.IconButton type="submit" aria-label="검색">
            <SearchIcon width={22} height={22} />
          </C.IconButton>
        </C.SearchForm>

        {/* 관심 키워드·상점 확인하기 */}
        <C.ActionCard type="button" onClick={onInterest}>
          <C.CardText>관심 키워드·상점 확인하기</C.CardText>
          <ChevronRight width={20} height={20} />
        </C.ActionCard>

        {/* 특가 알림 토글 */}
        <C.ToggleRow>
          <C.ToggleLabel>특가가 뜨면 알려드릴게요</C.ToggleLabel>
          <C.Switch
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
        </C.ToggleRow>
      </C.Page>
    </>
  );
}

export default CustomerHome;
