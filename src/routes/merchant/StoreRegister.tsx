import React, { useEffect, useRef, useState, useMemo } from 'react';
import Header from '@components/Header';
import * as S from '@styles/merchant/StoreRegisterStyle';

import MarketPosition, { type MarketOption } from '@components/merchant/MarketPosition';
import MarketCard from '@components/merchant/MarketCard';
import PreviewPanel from '@components/merchant/PreviewPanel';

import PlusIcon from '@assets/BlackPlus.svg?react';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// NOTE: 서버가 문자열 URL 또는 { url: string } / { imageUrl: string } 형태로 응답할 수 있음

// 안전한 ASCII 파일명으로 변환 (확장자는 유지)
const toSafeFilename = (name: string) => {
  const dot = name.lastIndexOf('.');
  const base = dot >= 0 ? name.slice(0, dot) : name;
  const ext = dot >= 0 ? name.slice(dot) : '';
  // 한글/공백/특수문자 제거, 소문자/숫자/하이픈만 허용
  const safeBase =
    base
      .normalize('NFKD')
      .replace(/[^\w\s-]/g, '')
      .replace(/\s+/g, '-')
      .replace(/-+/g, '-')
      .toLowerCase()
      .slice(0, 50) || 'image';
  const safeExt = ext.toLowerCase().replace(/[^.\w]/g, '');
  return `${safeBase}${safeExt || '.png'}`;
};

const MARKET_CODE_MAP: Record<string, string> = {
  CHANDONG: 'CHANGDONG',
};

function StoreRegister() {
  const navigate = useNavigate();
  const api = axios.create({
    baseURL: 'https://n0t4u.shop',
    headers: { Accept: '*/*' },
  });
  api.interceptors.request.use((config) => {
    const t = sessionStorage.getItem('auth:token');
    if (t) {
      const short = t.slice(0, 10) + '...';
      console.log('[store api] attach token', short);
      config.headers = config.headers ?? {};
      (config.headers as any).Authorization = `Bearer ${t}`;
    }
    return config;
  });
  const [submitting, setSubmitting] = useState(false);
  const [err, setErr] = useState('');
  const [storeName, setStoreName] = useState('');
  const [market, setMarket] = useState<MarketOption | null>(null);
  const marketStateRef = useRef<MarketOption | null>(null);
  useEffect(() => {
    marketStateRef.current = market;
  }, [market]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null); // 화면 미리보기용
  const [uploading, setUploading] = useState(false); // 즉시 업로드 진행중 플래그
  const [previewStatus, setPreviewStatus] = useState<'open' | 'closed'>('closed');

  const dobongMarkets: MarketOption[] = useMemo(
    () => [
      { id: 'SINDOBONG', name: '신도봉시장', lat: 37.67, lng: 127.04358 },
      { id: 'BANGHAKDONG', name: '방학동도깨비시장', lat: 37.66337, lng: 127.03502 },
      { id: 'SINCHANG', name: '신창시장', lat: 37.639798, lng: 127.03715 },
      { id: 'CHANGDONG', name: '창동골목시장', lat: 37.639022, lng: 127.03902 },
      { id: 'SSANGMUN', name: '쌍문시장', lat: 37.647961, lng: 127.032846 },
      { id: 'BAEGUN', name: '백운시장', lat: 37.655533, lng: 127.015291 },
    ],
    []
  );

  const location = useLocation();
  type NavState = {
    name?: string;
    market?: string; // id
    imageUrl?: string | null;
    latitude?: number;
    longitude?: number;
    status?: 'open' | 'closed';
  } | null;

  // Prefill when navigated with state from MerchantHome
  useEffect(() => {
    const state = (location.state as NavState) || null;
    if (!state) return;

    if (state.name) setStoreName(state.name);
    if (state.market) {
      const found = dobongMarkets.find(
        (m) => m.id === state.market || m.id.toUpperCase() === state.market?.toUpperCase()
      );
      if (found) setMarket(found);
    }
    if (state.imageUrl !== undefined) setImageUrl(state.imageUrl ?? null);
    if (state.status === 'open' || state.status === 'closed') setPreviewStatus(state.status);
  }, [location.state, dobongMarkets]);

  function haversineDistance(lat1: number, lng1: number, lat2: number, lng2: number) {
    const toRad = (x: number) => (x * Math.PI) / 180;
    const R = 6371;
    const dLat = toRad(lat2 - lat1);
    const dLon = toRad(lng2 - lng1);
    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function nearestMarket(lat: number, lng: number): MarketOption {
    let nearest = dobongMarkets[0];
    let minDist = haversineDistance(lat, lng, nearest.lat, nearest.lng);
    for (const m of dobongMarkets) {
      const dist = haversineDistance(lat, lng, m.lat, m.lng);
      if (dist < minDist) {
        nearest = m;
        minDist = dist;
      }
    }
    return nearest;
  }

  // === NAVER MAP ===
  const mapRef = useRef<HTMLDivElement>(null);
  const mapObjRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [mapReady, setMapReady] = useState(false);
  useEffect(() => {
    // Naver Maps JS는 clientId만 사용합니다. Secret을 프론트에 넣지 마세요.
    const scriptId = 'naver-map-sdk';
    const existing = document.getElementById(scriptId) as HTMLScriptElement | null;

    const markReady = () => setMapReady(true);

    if (existing) {
      // 스크립트 태그는 있지만 아직 SDK가 준비되지 않았을 수 있음
      if ((window as any).naver?.maps) {
        markReady();
      } else {
        existing.addEventListener('load', markReady, { once: true });
      }
      return;
    }

    const s = document.createElement('script');
    s.id = scriptId;
    const clientId = import.meta.env.VITE_MAP_CLIENT;
    s.src = `https://openapi.map.naver.com/openapi/v3/maps.js?ncpClientId=${clientId}`;
    s.async = true;
    s.defer = true;
    s.addEventListener('load', markReady, { once: true });
    document.body.appendChild(s);
  }, []);

  useEffect(() => {
    if (!mapReady || !mapRef.current || !(window as any).naver) return;
    if (mapObjRef.current) return;

    const { naver } = window as any;
    const center = new naver.maps.LatLng(market?.lat ?? 37.66654, market?.lng ?? 127.0453);
    const map = new naver.maps.Map(mapRef.current, {
      center,
      zoom: 14,
      scaleControl: false,
      mapDataControl: false,
    });
    mapObjRef.current = map;

    const marker = new naver.maps.Marker({ position: center, map });
    markerRef.current = marker;

    if (market) {
      const mLatLng = new naver.maps.LatLng(market.lat, market.lng);
      map.setCenter(mLatLng);
      marker.setPosition(mLatLng);
    }

    setTimeout(() => {
      try {
        naver.maps.Event.trigger(map, 'resize');
      } catch {}
    }, 0);

    naver.maps.Event.addListener(map, 'click', (e: any) => {
      const lat = e.coord._lat;
      const lng = e.coord._lng;
      if (markerRef.current) {
        markerRef.current.setPosition(new naver.maps.LatLng(lat, lng));
      }
      setMarket(nearestMarket(lat, lng));
    });
  }, [mapReady]);

  useEffect(() => {
    if (!mapReady) return;
    if (!navigator.geolocation) return;

    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const lat = pos.coords.latitude;
        const lng = pos.coords.longitude;
        const near = nearestMarket(lat, lng);
        if (!marketStateRef.current) {
          setMarket(near);
        }
      },
      () => {
        if (!marketStateRef.current) {
          const defaultMarket =
            dobongMarkets.find((m) => m.name === '신도봉시장') ?? dobongMarkets[0];
          setMarket(defaultMarket);
        }
      }
    );
  }, [mapReady]);

  // 이후 이 부분 연동 필요
  useEffect(() => {
    if (!mapReady) return;
    if (!market) return;
    if (!mapObjRef.current || !markerRef.current) return;
    const { naver } = window as any;
    const posLatLng = new naver.maps.LatLng(market.lat, market.lng);
    mapObjRef.current.setCenter(posLatLng);
    markerRef.current.setPosition(posLatLng);
  }, [market, mapReady]);

  const fileRef = useRef<HTMLInputElement>(null);
  const onPickImage = () => fileRef.current?.click();
  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    // 유효성 검사
    if (!ALLOWED_MIME.includes(f.type)) {
      setErr('이미지 형식이 올바르지 않습니다. (허용: JPG, PNG, WEBP)');
      setPreviewUrl(null);
      setImageUrl(null);
      setImageFile(null);
      return;
    }
    if (f.size > MAX_FILE_SIZE) {
      setErr('이미지 파일이 너무 큽니다. (최대 5MB)');
      setPreviewUrl(null);
      setImageUrl(null);
      setImageFile(null);
      return;
    }
    setErr('');
    setImageFile(f);
    // 즉시 미리보기
    const url = URL.createObjectURL(f);
    console.log('[local preview url]', url);
    setPreviewUrl(url);
    // 서버에 즉시 업로드 시도 -> 성공 시 서버가 준 절대 URL을 imageUrl 로 저장
    try {
      setUploading(true);
      const fileToSend = f;
      const fd = new FormData();
      fd.append('file', fileToSend, fileToSend.name);
      // DEBUG: FormData preview
      console.log(
        '[instant image upload] sending -> key=file name=%s type=%s size=%d',
        fileToSend.name,
        fileToSend.type,
        fileToSend.size
      );
      let up = await api.post('/api/store', fd, { validateStatus: () => true });
      console.log('[instant image upload]', up.status, up.data, up.headers);
      if (up.status === 200 && typeof up.data === 'string') {
        console.log('[server image url]', up.data);
        console.log('[instant image upload] set imageUrl =', up.data);
        setImageUrl(up.data); // 서버 URL
        return;
      }
      // fallback 1: /api/store/image
      const fd1 = new FormData();
      fd1.append('file', fileToSend, fileToSend.name);
      console.log(
        '[instant image upload:/image] sending -> key=file name=%s type=%s size=%d',
        fileToSend.name,
        fileToSend.type,
        fileToSend.size
      );
      const up2 = await api.post('/api/store', fd1, { validateStatus: () => true });
      console.log('[instant image upload:/image]', up2.status, up2.data, up2.headers);
      if (up2.status === 200 && typeof up2.data === 'string') {
        console.log('[server image url]', up2.data);
        console.log('[instant image upload:/image] set imageUrl =', up2.data);
        setImageUrl(up2.data);
        return;
      }
      // fallback 2: 필드명 대체
      const altNames = ['image', 'multipartFile'];
      for (const key of altNames) {
        const fdx = new FormData();
        fdx.append(key, fileToSend, fileToSend.name);
        console.log(
          '[instant image upload:field] sending -> key=%s name=%s type=%s size=%d',
          key,
          fileToSend.name,
          fileToSend.type,
          fileToSend.size
        );
        const resX = await api.post('/api/store', fdx, { validateStatus: () => true });
        console.log('[instant image upload:field]', key, resX.status, resX.data, resX.headers);
        if (resX.status === 200 && typeof resX.data === 'string') {
          console.log('[server image url]', resX.data);
          console.log('[instant image upload:field] set imageUrl =', resX.data);
          setImageUrl(resX.data);
          return;
        }
      }
      // fallback 3: 상점 소유자 스코프 엔드포인트 (/api/store/{id}/image)
      try {
        const me = await api.get('/api/store/me', { validateStatus: () => true });
        console.log('[instant image upload:/me]', me.status, me.data);
        if (me.status === 200 && me.data?.id) {
          const storeId = me.data.id;
          const fdScoped = new FormData();
          fdScoped.append('file', fileToSend, fileToSend.name);
          console.log(
            '[instant image upload:/store/{id}/image] sending -> id=%s name=%s type=%s size=%d',
            String(storeId),
            fileToSend.name,
            fileToSend.type,
            fileToSend.size
          );
          const upScoped = await api.post(`/api/store/${storeId}/image`, fdScoped, {
            validateStatus: () => true,
          });
          console.log('[instant image upload:/store/{id}/image]', upScoped.status, upScoped.data);
          if (upScoped.status === 200) {
            const urlFromServer =
              typeof upScoped.data === 'string'
                ? upScoped.data
                : upScoped.data?.url || upScoped.data?.imageUrl || null;
            if (urlFromServer) {
              console.log('[server image url]', urlFromServer);
              setImageUrl(urlFromServer);
              return;
            }
          }
        }
      } catch (scopedErr) {
        console.warn('[instant image upload scoped error]', scopedErr);
      }
      setErr('이미지 업로드에 실패했습니다. 이미지 없이 등록을 계속할 수 있어요.');
      setImageUrl(null);
    } catch (er) {
      console.warn('[instant image upload error]', er);
      setErr('이미지 업로드 중 오류가 발생했습니다.');
      setImageUrl(null);
    } finally {
      setUploading(false);
    }
  };
  const handleSubmit = async () => {
    if (!storeName.trim() || !market) {
      alert('상호명과 위치를 선택해 주세요.');
      return;
    }
    try {
      setSubmitting(true);
      setErr('');

      // 0) 사전 체크: 이미 상점이 있는 계정인지 확인
      try {
        const pre = await api.get('/api/store/me', { validateStatus: () => true });
        console.log('[store pre-check] status', pre.status, pre.data);
        if (pre.status === 200 && pre.data) {
          alert('이미 등록된 상점이 있습니다. 상점 홈으로 이동합니다.');
          navigate('/merchantHome', { replace: true });
          return;
        }
      } catch (e) {
        console.warn('[store pre-check] error ignored', e);
      }

      // 1) 이미지 URL은 (있다면) 파일 선택 시 즉시 업로드로 확보된 값을 사용
      let finalImageUrl = imageUrl ?? null;
      console.log('[store create] finalImageUrl (before build)', finalImageUrl);

      // 2) 상점 등록(JSON)
      const serverMarket = MARKET_CODE_MAP[market.id.toUpperCase()] ?? market.id.toUpperCase();
      const bodyPrimary: Record<string, any> = {
        name: storeName.trim(),
        market: serverMarket,
        latitude: market.lat,
        longitude: market.lng,
      };
      if (finalImageUrl && /^https?:\/\//i.test(finalImageUrl)) {
        bodyPrimary.imageUrl = finalImageUrl;
      }
      console.log('[store create] finalImageUrl', finalImageUrl);
      console.log('[store create] payload(primary)', JSON.stringify(bodyPrimary));
      let res = await api.post('/api/store', bodyPrimary, {
        headers: { 'Content-Type': 'application/json' },
        validateStatus: () => true,
      });
      console.log('[store create] result(primary)', res.status, res.data);

      if (res.status >= 400 && res.status !== 409) {
        const bodyAlt: Record<string, any> = {
          name: storeName.trim(),
          market: serverMarket,
          lat: market.lat,
          lng: market.lng,
        };
        if (finalImageUrl && /^https?:\/\//i.test(finalImageUrl)) {
          bodyAlt.imageUrl = finalImageUrl;
        }
        console.log('[store create] finalImageUrl (alt)', finalImageUrl);
        console.log('[store create] payload(alt)', JSON.stringify(bodyAlt));
        const resAlt = await api.post('/api/store', bodyAlt, {
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true,
        });
        console.log('[store create] result(alt)', resAlt.status, resAlt.data);
        if (resAlt.status === 200 || resAlt.status === 201) {
          alert('상점이 등록되었습니다.');
          navigate('/merchantHome', { replace: true });
          return;
        }
        res = resAlt; // 이후 공통 에러 처리
      }

      if (
        (res.status === 200 || res.status === 201) &&
        (typeof res.data === 'string' || !!res.data)
      ) {
        alert('상점이 등록되었습니다.');
        navigate('/merchantHome', { replace: true });
        return;
      }
      if (res.status === 409) {
        console.warn('[store create] 409 STORE_ALREADY_EXISTS -> redirect /merchantHome');
        navigate('/merchantHome', { replace: true });
        return;
      }
      const msg =
        typeof res.data === 'string' ? res.data : res.data?.message || '상점 등록에 실패했습니다.';
      setErr(msg);
    } catch (e) {
      console.error('[store register error]', e);
      setErr('서버 오류로 상점 등록에 실패했습니다.');
    } finally {
      setSubmitting(false);
    }
  };

  const canPreview = storeName.trim().length > 0 && !!market;

  return (
    <>
      <Header />
      <S.StoreRegister>
        <S.Title>우리 가게 문 열어요</S.Title>

        {/* 상호명 */}
        <S.Field>
          <S.Label>상호명</S.Label>
          <S.Input
            value={storeName}
            onChange={(e) => setStoreName(e.target.value)}
            placeholder="예: 은지네과일가게"
          />
        </S.Field>

        {/* 위치 선택 */}
        <S.Field>
          <S.Label>위치</S.Label>
          <MarketPosition
            value={market?.id}
            onChange={(m) => setMarket(m)}
            placeholder="시장 선택"
            options={dobongMarkets}
          />
        </S.Field>

        {/* 지도 */}
        <S.MapBox>
          <S.Map ref={mapRef} style={{ width: '100%', height: 360, borderRadius: 12 }} />
        </S.MapBox>

        {/* 대표 사진 */}
        <S.Row>
          <S.LabelWrapper>
            <S.Label>대표 사진</S.Label>
            <S.SubLabel>선택</S.SubLabel>
          </S.LabelWrapper>
          <S.PickBtn type="button" onClick={onPickImage}>
            <PlusIcon /> 사진 추가하기
          </S.PickBtn>
          <S.ImgInput
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: 'none' }}
            onChange={onFile}
          />
        </S.Row>
        {err && <div style={{ color: 'crimson', fontSize: 14, padding: '8px 0' }}>❗ {err}</div>}
        {canPreview && (
          <PreviewPanel
            title="이렇게 등록할게요"
            onConfirm={submitting || uploading ? undefined : handleSubmit}
          >
            <MarketCard
              name={storeName}
              marketName={market!.name}
              status={previewStatus}
              imageUrl={previewUrl ?? imageUrl ?? undefined}
              showArrow={false}
            />
            {uploading && (
              <div style={{ paddingTop: 8, fontSize: 12, color: '#666' }}>이미지 업로드 중…</div>
            )}
          </PreviewPanel>
        )}
      </S.StoreRegister>
    </>
  );
}

export default StoreRegister;
