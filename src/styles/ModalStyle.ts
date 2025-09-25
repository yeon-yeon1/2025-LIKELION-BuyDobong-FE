import styled, { css } from 'styled-components';
import palette from '@lib/colorPalette';

export type ModalVariant = 'primary' | 'danger';

type BtnTone = 'muted' | ModalVariant;

export const Overlay = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: flex;
  align-items: center;
  justify-content: center;
  z-index: 99999;
  width: 390px;
  height: 800px;

  margin: 0 auto;
  @media (hover: none) and (pointer: coarse) {
    width: 100%;
    height: 100vh;
    margin: 0 auto;

    @media (min-width: 768px) {
      body {
        width: 390px;
        margin: 0 auto;
        height: 100vh;
      }
    }
  }
`;

export const Card = styled.div<{ $width: number | string }>`
  width: ${({ $width }) => (typeof $width === 'number' ? `${$width}px` : $width)};
  max-width: 90vw;
  border-radius: 16px;
  background: #fff;
  padding: 20px;
  box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
  margin: 15px;
`;

export const Title = styled.h3`
  margin: 10px 0;
  text-align: center;
  font-size: 16px;
  font-weight: 600;
  color: ${palette.textPrimary};
`;

export const Desc = styled.p`
  margin: 0 0 20px;
  text-align: center;
  font-size: 14px;
  line-height: 1.5;
  color: ${palette.textSecondary};
  font-weight: 400;

  & > span {
    font-weight: 600;
  }
`;

export const BtnRow = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 8px;
`;

const mutedStyles = ({ $context }: { $context?: ModalVariant }) =>
  $context === 'danger'
    ? css`
        border: none !important;
        outline: none !important;
        background: ${palette.highlightRed20};
        color: ${palette.highlightRed};
        font-size: 14px;
        font-weight: 600;
      `
    : css`
        border: none !important;
        outline: none !important;
        background: ${palette.brandPrimary20};
        color: ${palette.brandPrimary};
        font-size: 14px;
        font-weight: 600;
      `;

const toneStyles = {
  primary: css`
    border: none !important;
    outline: none !important;
    background: ${palette.brandPrimary};
    color: ${palette.card};
    font-size: 14px;
    font-weight: 600;
  `,
  danger: css`
    border: none !important;
    outline: none !important;
    background: ${palette.highlightRed};
    color: ${palette.card};
    font-size: 14px;
    font-weight: 600;
  `,
} as const;

export const Btn = styled.button<{ $tone: BtnTone; $context?: ModalVariant }>`
  flex: 1;
  padding: 12px 0;
  border-radius: 28px;
  height: 48px;
  padding: 5px 16px;
  cursor: pointer;
  border: none;
  outline: none;

  &:focus {
    outline: none;
    border: none;
  }

  &:active {
    outline: none;
    border: none;
  }

  ${({ $tone, $context }) => ($tone === 'muted' ? mutedStyles({ $context }) : toneStyles[$tone])}
`;
