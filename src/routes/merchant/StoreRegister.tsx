import React, { useEffect, useRef, useState, useMemo } from 'react';
import Header from '@components/Header';
import * as S from '@styles/merchant/StoreRegisterStyle';

import MarketPosition, { type MarketOption } from '@components/merchant/MarketPosition';
import MarketCard from '@components/merchant/MarketCard';
import PreviewPanel from '@components/merchant/PreviewPanel';

import PlusIcon from '@assets/BlackPlus.svg?react';
import { useNavigate, useLocation } from 'react-router-dom';

function StoreRegister() {
  const navigate = useNavigate();
  const [storeName, setStoreName] = useState('');
  const [market, setMarket] = useState<MarketOption | null>(null);
  const marketStateRef = useRef<MarketOption | null>(null);
  useEffect(() => {
    marketStateRef.current = market;
  }, [market]);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const [imageFile, setImageFile] = useState<File | null>(null);
  const [previewStatus, setPreviewStatus] = useState<'open' | 'closed'>('closed');

  const dobongMarkets: MarketOption[] = useMemo(
    () => [
      { id: 'SINDOBONG', name: '신도봉시장', lat: 37.67, lng: 127.04358 },
      { id: 'BANGHAKDONG', name: '방학동도깨비시장', lat: 37.66337, lng: 127.03502 },
      { id: 'SINCHANG', name: '신창시장', lat: 37.639798, lng: 127.03715 },
      { id: 'CHANDONG', name: '창동골목시장', lat: 37.639022, lng: 127.03902 },
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
  const onFile = (e: React.ChangeEvent<HTMLInputElement>) => {
    const f = e.target.files?.[0];
    if (!f) return;
    const url = URL.createObjectURL(f);
    setImageUrl(url); // 미리보기용 (blob: URL)
    setImageFile(f); // 백엔드 연동 시 업로드에 사용
  };
  const handleSubmit = () => {
    if (!storeName.trim() || !market) {
      alert('상호명과 위치를 선택해 주세요.');
      return;
    }

    // 퍼블리싱 단계: 이미지가 없으면 null을 사용
    const effectiveImageUrl = imageUrl ?? null;

    const body = {
      name: storeName.trim(),
      market: market.id.toUpperCase(),
      latitude: market.lat,
      longitude: market.lng,
      imageUrl: effectiveImageUrl,
    };

    // 퍼블리싱: 콘솔 및 로컬 스토리지에 저장 (백엔드 준비 전)
    console.log('[StoreRegister] request body', body);
    try {
      localStorage.setItem('storeRegister:lastBody', JSON.stringify(body));
      alert('등록 요청이 준비되었습니다. (콘솔/로컬스토리지 저장)');
    } catch (e) {
      // 저장 불가 시에도 콘솔 기록은 남음
    }
    navigate('/merchantHome');

    // TODO: 백엔드 연동 시
    // axios.post('/api/stores', body)
    //  .then(...)
    //  .catch(...);
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

        {canPreview && (
          <PreviewPanel title="이렇게 등록할게요" onConfirm={handleSubmit}>
            <MarketCard
              name={storeName}
              marketName={market!.name}
              status={previewStatus}
              imageUrl={imageUrl}
              showArrow={false}
            />
          </PreviewPanel>
        )}
      </S.StoreRegister>
    </>
  );
}

export default StoreRegister;
