import { useEffect, useMemo, useState } from 'react';
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
import Modal from '@components/Modal';

const HERO_MAX = 220;

function fmtTimeRange(start?: string | null, end?: string | null) {
  if (!start || !end) return '';
  const toHM = (iso: string) => {
    const d = new Date(iso);
    return `${`${d.getHours()}`.padStart(2, '0')}:${`${d.getMinutes()}`.padStart(2, '0')}`;
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
  const id = Number(storeId);

  const [collapse, setCollapse] = useState(0); // 0~1
  const [fav, setFav] = useState(false);
  const [detail, setDetail] = useState<StoreDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  const [savingFav, setSavingFav] = useState(false);
  const [isLoggedIn, setIsLoggedIn] = useState<boolean>(false);
  const [loginRequiredModalOpen, setLoginRequiredModalOpen] = useState(false);

  // 로그인 상태 확인
  useEffect(() => {
    const token = sessionStorage.getItem('auth:token');
    setIsLoggedIn(!!token);
  }, []);

  // 스크롤에 따른 collapse (히어로는 고정, 카드/썸네일 연출만)
  useEffect(() => {
    const onScroll = () => {
      const y = window.scrollY; // Wrap이 윈도우 스크롤이면 그대로 사용
      setCollapse(Math.min(1, Math.max(0, y / HERO_MAX)));
    };
    onScroll();
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  // 상세
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
      } catch (e: unknown) {
        if (!alive) return;
        const error = e as { response?: { data?: { message?: string } } };
        setErr(error?.response?.data?.message || '상점 정보를 불러오지 못했어요.');

        // const err = e as { response?: { status?: number; data?: { message?: string } } };
        // const status = err?.response?.status;
        // if (status === 500) {
        //   try {
        //     const res = await fetch(`https://n0t4u.shop/api/store/${id}/detail`, {
        //       method: 'GET',
        //       headers: { Accept: '*/*' },
        //       mode: 'cors',
        //       credentials: 'omit',
        //     });
        //     if (res.ok) {
        //       const data = (await res.json()) as StoreDetail;
        //       if (!alive) return;
        //       setDetail(data);
        //       setFav(!!data.favorite);
        //       setErr(null);
        //       return;
        //     }
        //   } catch (_) {
        //     // fallthrough to generic error
        //   }
        // }
        // setErr(err?.response?.data?.message || '상점 정보를 불러오지 못했어요.');
      } finally {
        if (alive) setLoading(false);
      }
    })();
    return () => {
      alive = false;
    };
  }, [id]);

  // 즐겨찾기 토글
  const onToggleFav = async () => {
    if (!Number.isFinite(id) || savingFav) return;

    // 로그인하지 않은 경우 로그인 모달 띄우기
    if (!isLoggedIn) {
      setLoginRequiredModalOpen(true);
      return;
    }

    const next = !fav;
    setFav(next);
    setSavingFav(true);
    try {
      if (next) await favoriteStore(id);
      else await unfavoriteStore(id);
      setDetail((d) => (d ? { ...d, favorite: next } : d) as StoreDetail | null);
    } catch (e: unknown) {
      setFav(!next); // 롤백
      console.error('favorite toggle failed', e);

      // 403 에러 시 로그인 모달 띄우기
      const error = e as { response?: { status?: number } };
      if (error?.response?.status === 403) {
        setLoginRequiredModalOpen(true);
      }
    } finally {
      setSavingFav(false);
    }
  };

  // 캐러셀/그리드 데이터 매핑
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

  // 히어로 배경
  const FALLBACK_HERO = 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=1200&q=80';
  const heroBg = useMemo(() => detail?.imageUrl?.trim() || FALLBACK_HERO, [detail?.imageUrl]);

  // 썸네일 변환: -28px(떠있음) → 0px(카드 자리)로 보간
  // const thumbTransform = `translateY(${-28 * (1 - collapse)}px)`;

  return (
    <>
      {/* 고정 헤더 */}
      {/* <div
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
      > */}
      <Header />
      {/* </div> */}

      <S.Wrap>
        {/* 고정 배경(히어로) — 스크롤해도 배경은 그대로 블러만 */}
        <S.Hero
          style={{
            backgroundImage: `url("${heroBg}")`,
            opacity: 1 - collapse * 0.2, // 살짝 어둡게
            filter: `blur(${2 + collapse * 2}px)`, // 살짝 더 블러
          }}
          role="img"
          aria-label="가게 대표 이미지"
        >
          <S.HeroOverlay />
        </S.Hero>

        {/* 상점 카드 (스크롤 시 자연스럽게 위로 올라옴) */}
        <S.ShopCard>
          {/* 카드 좌측 썸네일: 처음엔 카드 밖 위로 떠 있다가 collapse=1이면 자리로 */}
          <S.ThumbInCard src={heroBg} alt="" />

          <S.ShopContainer>
            <S.ChipRow>
              <S.Chip tone="muted">{detail?.marketLabel || '시장'}</S.Chip>
              <S.Chip tone={detail?.open ? 'success' : 'danger'}>
                {detail?.open ? '● 영업중' : '● 영업 종료'}
              </S.Chip>
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

        {/* 컨텐츠 */}
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

      {/* 로그인 필요 모달 */}
      <Modal
        open={loginRequiredModalOpen}
        onClose={() => setLoginRequiredModalOpen(false)}
        onConfirm={() => {
          setLoginRequiredModalOpen(false);
          window.location.href = '/login';
        }}
        title="로그인이 필요합니다"
        description="관심상점을 등록하려면 로그인해주세요."
        cancelText="취소"
        confirmText="로그인"
        variant="primary"
      />
    </>
  );
}
