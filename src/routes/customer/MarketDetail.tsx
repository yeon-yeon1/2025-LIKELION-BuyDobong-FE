import React, { useEffect, useMemo, useRef, useState } from 'react';
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

const HERO_MAX = 220; // 초기 배너 높이(px)

export default function StoreDetailPage() {
  const heroRef = useRef<HTMLDivElement | null>(null);
  const [collapse, setCollapse] = useState(0); // 0~1
  const [fav, setFav] = useState(false);

  //관심 onoff
  const onToggleFav = () => {
    setFav((v) => !v);
    // TODO: 서버 연동 시
    // fetch(`/api/stores/${storeId}/favorite`, { method: !fav ? 'POST' : 'DELETE' }).catch(() => setFav(fav));
  };

  // 임시 데이터 (API 연동 시 대체)
  const specials: SpecialItem[] = useMemo(
    () => [
      {
        id: 1,
        title: '사과',
        price: 1000,
        unit: '/100g',
        time: '17:03 - 20:03',
        stockBadge: '재고 충분함',
      },
      {
        id: 2,
        title: '사과',
        price: 1000,
        unit: '/100g',
        time: '17:03 - 20:03',
        stockBadge: '품절',
        soldOut: true,
      },
      {
        id: 3,
        title: '사과',
        price: 1000,
        unit: '/100g',
        time: '17:03 - 20:03',
        stockBadge: '재고 적음',
      },
    ],
    []
  );

  const products: ProductItem[] = useMemo(
    () =>
      Array.from({ length: 12 }).map((_, i) => ({
        id: i + 1,
        title: '사과',
        price: 1000,
        unit: '/100g',
        footer: i % 3 === 0 ? '품절' : '재고 충분함',
        disabled: i % 3 === 0,
      })),
    []
  );

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

  return (
    <>
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
        <Header /> {/* 내부 Header가 style을 안 퍼줘도 상관없음 */}
      </div>

      <S.Wrap>
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
            src="https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=480&q=80"
            alt="가게 썸네일"
          />
        </S.Hero>

        <S.ShopCard>
          <S.ShopContainer>
            <S.ChipRow>
              <S.Chip tone="muted">신도봉시장</S.Chip>
              <S.Chip tone="success">● 영업중</S.Chip>
            </S.ChipRow>
            <S.ShopName>은지네 과일 가게</S.ShopName>
          </S.ShopContainer>
          <S.FavButton
            aria-label={fav ? '즐겨찾기 해제' : '즐겨찾기 추가'}
            aria-pressed={fav}
            onClick={onToggleFav}
            $active={fav} // ← 스타일 상태
          >
            {fav ? <InterestedOn /> : <InterestedOff />}
          </S.FavButton>
        </S.ShopCard>

        <S.Section>
          <S.SectionHeader>
            <S.Icon>
              <TodaySaleIcon />
            </S.Icon>
            <h3>오늘의 특가</h3>
          </S.SectionHeader>
          <SpecialsCarousel items={specials} />
        </S.Section>

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
          <Header /> {/* 내부 Header가 style을 안 퍼줘도 상관없음 */}
        </div>

        <S.Section
          data-app-header
          style={{
            borderRadius: '0',
          }}
        >
          <S.SectionHeader>
            <S.Icon>
              <AllPrlductIcon />
            </S.Icon>
            <h3>전체 상품</h3>
          </S.SectionHeader>
          <ProductGrid items={products} />
        </S.Section>

        <S.BottomSpace />
      </S.Wrap>
    </>
  );
}
