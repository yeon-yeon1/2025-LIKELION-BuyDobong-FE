import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const MarketDetail = styled.div``;

export const Wrap = styled.div`
  max-width: 412px;
  height: 100dvh;
  margin: 0 auto;
  background: var(--brand-background, #eef1ee);
  position: relative;
  overflow-x: hidden;

  //세로 스크롤 제어
  overflow-y: auto;
  overflow-x: hidden;
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
  background-image: url('https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=1200&q=80');
  background-size: cover;
  background-position: center;
  transition: height 120ms ease, opacity 120ms ease, filter 120ms ease;
  will-change: height, opacity, filter;
`;

export const HeroOverlay = styled.div`
  position: absolute;
  inset: 0;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0.25) 0%, rgba(0, 0, 0, 0) 60%);
`;

export const ShopThumb = styled.img`
  position: absolute;
  left: 16px;
  bottom: -28px;
  width: 72px;
  height: 72px;
  border-radius: 16px;
  object-fit: cover;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.18);
  transition: transform 160ms ease, opacity 160ms ease;
  z-index: 500;
`;

export const ShopCard = styled.div`
  position: relative;
  margin: 12px 12px 0;
  padding: 12px;
  background: #ffffff;
  border-radius: 18px;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.08);
  transition: transform 160ms ease;
  z-index: 2;
  display: flex;
  justify-content: space-between;
`;

export const ShopContainer = styled.div`
  display: block;
`;

export const ChipRow = styled.div`
  display: flex;
  gap: 8px;
  margin-bottom: 8px;
`;

export interface ChipProps {
  tone?: 'success' | 'muted';
}
export const Chip = styled.span<ChipProps>`
  display: inline-flex;
  align-items: center;
  font-size: 12px;
  font-weight: 600;
  padding: 6px 10px;
  border-radius: 12px;
  color: ${({ tone }) => (tone === 'success' ? '#0d6e3f' : '#516063')};
  background: ${({ tone }) => (tone === 'success' ? '#e3f7ec' : '#e7eeea')};
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
