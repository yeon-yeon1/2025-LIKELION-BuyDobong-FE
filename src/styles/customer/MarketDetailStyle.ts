import styled from 'styled-components';
import palette from '@lib/colorPalette';

export interface ChipProps {
  tone?: 'success' | 'muted' | 'danger';
}

export const MarketDetail = styled.div``;

export const Wrap = styled.div`
  max-width: 412px;
  height: 100dvh;
  margin: 0 auto;
  background: var(--brand-background, #eef1ee);
  position: relative;

  /* 자체 스크롤일 때 */
  overflow-y: auto;
  -ms-overflow-style: none;
  scrollbar-width: none;
  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
  -webkit-overflow-scrolling: touch;
`;

export const Hero = styled.div`
  position: sticky;
  top: 0;
  width: 100%;
  height: ${220}px;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  transition: opacity 120ms ease, filter 120ms ease;
  will-change: opacity, filter;
`;

export const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0) 60%);
`;

/* 히어로 위에 떠 있는 썸네일(처음 화면) */
export const HeroThumb = styled.img`
  position: absolute;
  left: 0px;
  bottom: -50px;
  width: 72px;
  height: 72px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  z-index: 500;
  transition: opacity 160ms ease, transform 160ms ease;
`;

export const ShopCard = styled.div`
  position: relative;
  margin: 12px 12px 0;
  padding: 12px 12px 12px;
  background: #fff;
  border-radius: 18px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  display: flex;
  justify-content: space-between;
  align-items: center;

  z-index: 2;
`;

export const ThumbInCard = styled.img`
  position: absolute;
  left: 0px;
  top: -50px; /* 카드 윗부분 위로 28px 떠 있게 시작 */
  width: 72px;
  height: 72px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  will-change: transform;
  transition: transform 180ms ease;
  z-index: 5;
`;

export const ShopContainer = styled.div`
  display: block;
`;

export const ChipRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

export const Chip = styled.span<ChipProps>`
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 400;
  padding: 6px 10px;
  border-radius: 12px;

  color: ${({ tone }) =>
    tone === 'success' ? '#0d6e3f' : tone === 'danger' ? '#6B6B6F' : '#6B6B6F'};

  background: ${({ tone }) =>
    tone === 'success' ? '#e3f7ec' : tone === 'danger' ? '#DDD' : '#EEF1EE'};
`;
export const ShopName = styled.div`
  font-size: 18px;
  font-weight: 600;
  margin: 0;
  color: #1f2a2e;
`;

export const FavButton = styled.div<{ $active?: boolean }>`
  padding: 0;
  display: grid;
  place-items: center;
  border: none;
  border-radius: 999px;
  cursor: pointer;

  &:active {
    transform: scale(0.96);
  }

  svg {
    width: 32px;
    height: 32px;
    display: block;
  }
`;

export const Section = styled.section`
  position: relative;
  padding: 16px 12px 0;
  background: var(--brand-background, #eef1ee);
  height: 210px;
  z-index: 800;
  border-top-left-radius: 12px;
  border-top-right-radius: 12px;
`;

export const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  background: #d7e4dd;
  border-radius: 12px;
  padding: 10px 12px;
  margin-bottom: 12px;
  h3 {
    margin: 0;
    font-size: 14px;
    font-weight: 400;
    color: #2f3b39;
  }
`;

export const Icon = styled.span`
  font-size: 16px;
`;

export const BottomSpace = styled.div`
  height: 56px;
`;
