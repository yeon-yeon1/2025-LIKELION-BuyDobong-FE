import styled from 'styled-components';
import palette from '@lib/colorPalette';

const ITEM_H = 44;

export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  display: grid;
  place-items: center;
  background: rgba(0, 0, 0, 0.4);
  z-index: 1000;
  width: 390px;
  margin: 0 auto;
  height: 800px;
  overscroll-behavior: contain;
`;

export const Sheet = styled.div`
  width: 320px;
  background: ${palette.card};
  border-radius: 24px;
  padding: 35px 30px 20px;
  box-shadow: 0 20px 40px ${palette.textPhotoBlur};
`;

export const Title = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 300;
  color: ${palette.textPrimary};
`;

export const PickerWrap = styled.div`
  position: relative;
  display: grid;
  grid-template-columns: 1fr 0.3fr 1fr;
  gap: 12px;
  height: 205px;
  overflow: hidden;

  &::before,
  &::after {
    content: '';
    position: absolute;
    left: 0;
    right: 0;
    height: 50%;
    pointer-events: none;
    z-index: 3;
  }

  &::before {
    top: 0;
    background: linear-gradient(to bottom, ${palette.card} 0%, rgba(255, 255, 255, 0) 100%);
    opacity: 1;
  }

  &::after {
    bottom: 0;
    background: linear-gradient(to top, ${palette.card} 0%, rgba(255, 255, 255, 0) 100%);
    opacity: 1;
  }
`;

export const CenterBar = styled.div`
  pointer-events: none;
  position: absolute;
  left: 0;
  right: 0;
  top: calc(50% - ${ITEM_H / 2 - 13}px);
  height: 33px;
  border-radius: 8px;
  background: ${palette.brandBackground};
`;

export const Column = styled.div`
  position: relative;
  height: ${ITEM_H * 5}px;
  overflow: hidden;
  z-index: 1;

  &:nth-child(2) {
    display: flex;
    justify-content: flex-end;
  }

  &:last-child {
    display: flex;
    flex-direction: column;
    margin-right: 110px;
  }

  &:nth-child(2) li,
  &:nth-child(3) li {
    padding-bottom: 2px;
  }
`;

export const List = styled.ul`
  margin: 0;
  padding: ${ITEM_H * 2}px 0;
  list-style: none;
  height: 21%;
  overflow-y: auto;
  scroll-snap-type: y mandatory;
  scroll-snap-stop: always;
  -webkit-overflow-scrolling: touch;
  touch-action: pan-y;
  overscroll-behavior: contain;
  &::-webkit-scrollbar {
    display: none;
  }
`;

export const Item = styled.li`
  height: ${ITEM_H}px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 16px;
  letter-spacing: -0.02em;
  color: ${palette.textDisabled2};
  scroll-snap-align: center;
  &[aria-selected='true'] {
    color: ${palette.textPrimary};
    font-weight: 300;
  }
`;

export const Footer = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 16px;
  margin-top: 8px;
`;

const BaseBtn = styled.button`
  height: 56px;
  border-radius: 28px;
  font-size: 16px;
  cursor: pointer;
  border: 1px solid transparent;
`;

export const BtnGhost = styled(BaseBtn)`
  background: ${palette.brandBackground};
  color: ${palette.textPrimary};
  border-color: rgba(47, 125, 105, 0.3);
`;

export const BtnPrimary = styled(BaseBtn)`
  background: ${palette.brandPrimary};
  color: ${palette.card};
`;
