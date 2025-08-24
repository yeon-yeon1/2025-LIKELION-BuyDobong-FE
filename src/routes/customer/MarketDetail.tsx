import React, { useEffect, useMemo, useRef, useState } from 'react';
import { useParams } from 'react-router-dom';
import Header from '@components/Header';
import * as S from '@styles/customer/MarketDetailStyle';
import { SpecialsCarousel } from '@components/customer/SpecialsCarousel';
import type { SpecialItem } from '@components/customer/SpecialsCarousel';
import { ProductGrid } from '@components/customer/ProductGrid';
import type { ProductItem } from '@components/customer/ProductGrid';
import TodaySaleIcon from '@assets/TodaySaleIcon.svg?react';
import AllPrlductIcon from '@assets/AllProductIcon.svg?react';
import InterestedOn from '@assets/InterestedOn.svg?react';
import InterestedOff from '@assets/InterestedOff.svg?react';
import { getStoreDetail, type StoreDetail, type StockLevel } from '@lib/api/stores';
import { favoriteStore, unfavoriteStore } from '@lib/api/favorites';

const HERO_MAX = 220; // 초기 배너 높이(px)

function fmtTimeRange(start?: string | null, end?: string | null) {
  if (!start || !end) return '';
  const toHM = (iso: string) => {
    const d = new Date(iso);
    // 로컬 HH:MM (두 자리)
    const hh = `${d.getHours()}`.padStart(2, '0');
    const mm = `${d.getMinutes()}`.padStart(2, '0');
    return `${hh}:${mm}`;
  };
  return `${toHM(start)} - ${toHM(end)}`;
}

function stockBadge(level: StockLevel) {
  switch (level) {
    case 'NONE':
      return { label: '품절', soldOut: true, footer: '품절' as const };
    case 'LOW':
      return { label: '재고 적음', soldOut: false, footer: '재고 적음' as const };
    default:
      return { label: '재고 충분함', soldOut: false, footer: '재고 충분함' as const };
  }
}

export default function StoreDetailPage() {
  const { storeId } = useParams<{ storeId: string }>();
  const id = Number(storeId); // 라우트에서 넘어온 상점 id
  const heroRef = useRef<HTMLDivElement | null>(null);

  const [collapse, setCollapse] = useState(0); // 0~1
  const [fav, setFav] = useState(false);

  const [detail, setDetail] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [savingFav, setSavingFav] = useState(false);

  // 스크롤 효과
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY;
      const next = Math.min(1, Math.max(0, y / HERO_MAX));
      setCollapse(next);
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 상세 API 호출
  useEffect(() => {
    if (!Number.isFinite(id)) return;
    let alive = true;
    (async () => {
      setLoading(true);
      setErr(null);
      try {
        const data = await getStoreDetail(id);
        if (!alive) return;
        setDetail(data);
        setFav(!!data.favorite);
      } catch (e: any) {
        if (!alive) return;
        setErr(e?.response?.data?.message || '상점 정보를 불러오지 못했어요.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // 관심 on/off
  const onToggleFav = async () => {
    if (!Number.isFinite(id) || savingFav) return;
    const next = !fav;
    setFav(next);
    setSavingFav(true);
    try {
      if (next) {
        await favoriteStore(id); // POST { storeId }
      } else {
        await unfavoriteStore(id); // DELETE /{storeId}
      }
      // 상세 상태와도 동기화 (옵션)
      setDetail((d) => (d ? ({ ...d, favorite: next } as StoreDetail) : d));
    } catch (e) {
      console.error('favorite toggle failed', e);
      setFav(!next); // 롤백
    } finally {
      setSavingFav(false);
    }
  };

  // SpecialsCarousel 매핑
  const specials: SpecialItem[] = useMemo(() => {
    if (!detail?.deals) return [];
    return detail.deals.map((d) => {
      const sb = stockBadge(d.stockLevel);
      return {
        id: d.id,
        title: d.name,
        price: d.displayPrice,
        unit: d.unit ? `/${d.unit}` : '',
        time: fmtTimeRange(d.dealStartAt, d.dealEndAt),
        stockBadge: sb.label,
        soldOut: sb.soldOut,
      };
    });
  }, [detail]);

  // ProductGrid 매핑
  const products: ProductItem[] = useMemo(() => {
    if (!detail?.products) return [];
    return detail.products.map((p) => {
      const sb = stockBadge(p.stockLevel);
      return {
        id: p.id,
        title: p.name,
        price: p.displayPrice,
        unit: p.unit ? `/${p.unit}` : '',
        footer: sb.footer,
        disabled: sb.footer === '품절',
      };
    });
  }, [detail]);

  return (
    <>
      {/* 고정 헤더 래퍼 */}
      <div
        id="app-header"
        data-app-header
        style={{
          position: 'fixed',
          top: 'env(safe-area-inset-top, 0px)',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '100%',
          maxWidth: 412,
          zIndex: 9999,
        }}
      >
        <Header />
      </div>

      <S.Wrap>
        {/* 히어로 */}
        <S.Hero
          ref={heroRef}
          style={{
            height: `${HERO_MAX * (1 - collapse)}px`,
            opacity: 1 - collapse * 0.9,
            filter: `blur(${4 + collapse * 4}px)`,
          }}
          role="img"
          aria-label="가게 대표 이미지"
        >
          <S.HeroOverlay />
          <S.ShopThumb
            src={
              detail?.imageUrl ||
              'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=480&q=80'
            }
            alt="가게 썸네일"
          />
        </S.Hero>

        {/* 상점 카드 */}
        <S.ShopCard>
          <S.ShopContainer>
            <S.ChipRow>
              {/* 스타일 파일에서 prop 경고가 있으면 tone -> $tone로 바꾸고 스타일도 맞춰줘 */}
              <S.Chip tone="muted">{detail?.marketLabel || '시장'}</S.Chip>
              {detail?.open && <S.Chip tone="success">● 영업중</S.Chip>}
            </S.ChipRow>
            <S.ShopName>{detail?.name || '상점명'}</S.ShopName>
          </S.ShopContainer>

          <S.FavButton
            aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            aria-pressed={fav}
            onClick={onToggleFav}
            $active={fav}
          >
            {fav ? <InterestedOn /> : <InterestedOff />}
          </S.FavButton>
        </S.ShopCard>

        {/* 오늘의 특가 */}
        {loading ? (
          <S.Section>
            <S.SectionHeader>
              <h3>불러오는 중…</h3>
            </S.SectionHeader>
          </S.Section>
        ) : err ? (
          <S.Section>
            <S.SectionHeader>
              <h3>{err}</h3>
            </S.SectionHeader>
          </S.Section>
        ) : (
          <>
            {specials.length > 0 && (
              <S.Section>
                <S.SectionHeader>
                  <S.Icon>
                    <TodaySaleIcon />
                  </S.Icon>
                  <h3>오늘의 특가</h3>
                </S.SectionHeader>
                <SpecialsCarousel items={specials} />
              </S.Section>
            )}

            <S.Section style={{ borderRadius: '0' }}>
              <S.SectionHeader>
                <S.Icon>
                  <AllPrlductIcon />
                </S.Icon>
                <h3>전체 상품</h3>
              </S.SectionHeader>
              <ProductGrid items={products} />
            </S.Section>

            <S.BottomSpace />
          </>
        )}
      </S.Wrap>
    </>
  );
}
