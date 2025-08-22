import React, { useEffect, useRef, useState, useMemo } from 'react';
import Header from '@components/Header';
import * as S from '@styles/merchant/StoreRegisterStyle';

import MarketPosition, { type MarketOption } from '@components/merchant/MarketPosition';
import MarketCard from '@components/merchant/MarketCard';
import PreviewPanel from '@components/merchant/PreviewPanel';

import PlusIcon from '@assets/BlackPlus.svg?react';
import { useNavigate, useLocation } from 'react-router-dom';
import api from '../../lib/api';

const ALLOWED_MIME = ['image/jpeg', 'image/png', 'image/webp'];
const MAX_FILE_SIZE = 5 * 1024 * 1024; // 5MB

// NOTE: 서버가 문자열 URL 또는 { url: string } / { imageUrl: string } 형태로 응답할 수 있음

// 안전한 ASCII 파일명으로 변환 (확장자는 유지)
const MARKET_CODE_MAP: Record<string, string> = {
  CHANDONG: 'CHANGDONG',
};

function StoreRegister() {
  const navigate = useNavigate();
  useEffect(() => {
    const t = (typeof window !== 'undefined' &&
      (sessionStorage.getItem('auth:token') || localStorage.getItem('accessToken'))) as
      | string
      | null;
    if (!t) return;
    try {
      const payload = JSON.parse(atob(t.split('.')[1] || ''));
      console.log('[StoreRegister] token payload', payload);
    } catch {}
  }, []);
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
  // onPickImage now triggers file input and, if a file is already selected, uploads it.
  const onPickImage = async () => {
    if (!fileRef.current) return;
    fileRef.current.click();
    const input = fileRef.current;
    setTimeout(() => {
      const f = input.files?.[0];
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
      // No upload here; just preview and store file.
    }, 0);
  };
  // onFile still handles validation and preview, but no API POST.
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
      setErr('이미지 파일이 너무 큽니다. (최대 10MB)');
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
    // Do not upload here; upload handled by onPickImage.
  };

  const handleSubmit = async () => {
    if (!storeName.trim() || !market) {
      alert('상호명과 위치를 선택해 주세요.');
      return;
    }
    try {
      setSubmitting(true);
      setErr('');

      const token =
        (typeof window !== 'undefined' &&
          (sessionStorage.getItem('auth:token') || localStorage.getItem('accessToken'))) ||
        '';
      if (!token) {
        console.warn('[store submit] no auth token found');
      } else {
        console.log('[store submit] attach token', token.slice(0, 16) + '...');
      }

      // 0) 사전 체크: 내 상점 존재 여부 확인 (있으면 수정 모드로 전환)
      let existingStoreId: number | null = null;
      try {
        const pre = await api.get('/api/store/me', {
          validateStatus: () => true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        console.log('[store pre-check] status', pre.status, pre.data);
        if (pre.status === 403) {
          console.warn('[store pre-check] 403 Forbidden — 토큰 권한/만료/역할 문제 가능성');
        }
        if (pre.status === 200 && pre.data?.id) {
          existingStoreId = pre.data.id as number;
          console.log('[store pre-check] detected existing store id=', existingStoreId);
        }
      } catch (e) {
        console.warn('[store pre-check] error ignored', e);
      }

      // 1) 서버가 멀티파트(data + image)를 받도록 열려있으면 한 번에 보낸다
      const serverMarket = MARKET_CODE_MAP[market.id.toUpperCase()] ?? market.id.toUpperCase();

      // 업로드 파일이 있으면 data.imgUrl는 ''로(서버가 파일 파트를 우선 사용),
      // 업로드 파일이 없으면 기존 imageUrl을 유지(없으면 null)
      const wantsUpload = !!imageFile;
      const payload: Record<string, any> = {
        name: storeName.trim(),
        market: serverMarket,
        latitude: market.lat,
        longitude: market.lng,
        imgUrl: wantsUpload ? '' : imageUrl ?? null,
      };

      const fd = new FormData();
      fd.append('data', new Blob([JSON.stringify(payload)], { type: 'application/json' }));
      if (wantsUpload) {
        fd.append('image', imageFile as File, (imageFile as File).name);
      }

      let res;
      if (existingStoreId) {
        console.log(
          '[store update] -> PATCH multipart /api/store/{id}',
          existingStoreId,
          payload,
          imageFile?.name
        );
        // 멀티파트 PATCH 시 Content-Type 을 직접 설정하지 않는다. 브라우저가 boundary 포함 헤더를 자동 설정.
        res = await api.patch(`/api/store/${existingStoreId}`, fd, {
          validateStatus: () => true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        // 일부 서버는 PATCH 멀티파트를 허용하지 않을 수 있으므로 JSON 패치로 폴백
        if (res.status >= 400 && res.status !== 415 && res.status !== 409) {
          console.log('[store update] multipart failed, fallback JSON PATCH', res.status);
          res = await api.patch(`/api/store/${existingStoreId}`, payload, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            validateStatus: () => true,
          });
        }
      } else {
        console.log('[store create] -> POST multipart /api/store', payload, imageFile?.name);
        res = await api.post('/api/store', fd, {
          validateStatus: () => true,
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });

        // 폴백: 서버가 multipart 미지원이면 JSON POST로 재시도
        if (res.status >= 400 && res.status !== 415 && res.status !== 409) {
          console.log('[store create] multipart failed, fallback JSON POST', res.status);
          res = await api.post('/api/store', payload, {
            headers: {
              'Content-Type': 'application/json',
              ...(token ? { Authorization: `Bearer ${token}` } : {}),
            },
            validateStatus: () => true,
          });
        }
      }

      // 공통 응답 처리
      if (res.status === 409) {
        console.warn('[store create/update] 409 STORE_ALREADY_EXISTS -> redirect /merchantHome');
        navigate('/merchantHome', { replace: true });
        return;
      }

      if (res.status === 200 || res.status === 201) {
        alert(existingStoreId ? '상점 정보가 수정되었습니다.' : '상점이 등록되었습니다.');
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
