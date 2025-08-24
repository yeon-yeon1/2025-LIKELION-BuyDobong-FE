import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const Wrap = styled.section`
  width: 100%;
`;

export const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${palette.textPrimary};
  margin: 0 0 12px;
`;

export const Table = styled.div`
  background: ${palette.card};
  border-radius: 12px;
  box-shadow: 0 0 4px 0 ${palette.textPhotoBlur};
  overflow: hidden;
`;

export const Head = styled.div`
  display: grid;
  grid-template-columns: 60px 2fr 67px 26px;
  align-items: center;
  gap: 0;
  background: ${palette.brandBackground};
  color: ${palette.textSecondary};

  padding: 6px 18px 6px 21px;

  border-radius: 12px 12px 0 0;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);

  svg {
    width: 24px;
    height: 24px;
  }
`;

export const HeadCell = styled.div`
  font-size: 14px;
  font-weight: 300;
  text-align: center;

  &:nth-child(3) {
    text-align: left;
  }
`;

export const DotHead = styled.div`
  display: flex;
  justify-content: center;
  svg {
    width: 18px;
    height: 18px;
    opacity: 0.5;
  }
`;

export const Empty = styled.div`
  padding: 20px 79px;
  text-align: center;
  color: ${palette.textSecondary};
`;

export const EmptyIcon = styled.div`
  svg {
    width: 16px;
    height: 16px;
  }
  margin-bottom: 7px;
`;

export const EmptyTitle = styled.div`
  font-size: 16px;
  color: ${palette.textSecondary};
  margin-bottom: 2px;
  font-weight: 300;
`;

export const EmptyDesc = styled.div`
  font-size: 16px;
  color: ${palette.textSecondary};
  font-weight: 300;
`;

export const Body = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  padding: 7px 0;
`;

export const Row = styled.div<{ $expanded?: boolean; $hidden?: boolean; $isSpecial?: boolean }>`
  background: ${({ $isSpecial, $expanded, $hidden }) =>
    $hidden
      ? palette.textDisabled2
      : $isSpecial
      ? palette.brandBackground
      : $expanded
      ? palette.card
      : 'transparent'};

  display: grid;
  grid-template-columns: 60px 2fr 70px 32px;

  align-items: center;
  text-align: center;
  border: none;
  border-radius: 16px;
  cursor: pointer;
`;

export const Cell = styled.div<{ $hidden?: boolean }>`
  font-size: 14px;

  color: ${({ $hidden }) => ($hidden ? palette.textDisabled : palette.textPrimary)};
  font-weight: 300;

  span {
    color: ${({ $hidden }) => ($hidden ? palette.textDisabled : palette.textPrimary)};
  }

  &:first-child {
    overflow: hidden;
    white-space: nowrap;
    text-overflow: ellipsis;
    text-align: left;
  }
`;

export const PriceText = styled.span`
  font-weight: 300;
  font-size: 14px;
`;

export const PriceTextSpan = styled.span`
  color: ${palette.textDisabled2};
`;

export const StockBadge = styled.span<{ $hidden?: boolean }>`
  display: inline-flex;
  min-width: 64px;
  padding: 0 8px;
  font-size: 14px;
  gap: 3px;

  &[data-state='충분함'] {
    color: ${({ $hidden }) => ($hidden ? palette.textDisabled : palette.textPrimary)};
  }

  &[data-state='적음'] {
    color: ${palette.brandPrimary};
  }

  &[data-state='없음'] {
    color: ${palette.highlightRed};
  }
`;

export const MenuBtn = styled.button`
  display: grid;
  place-items: center;
  width: 28px;
  height: 28px;
  border-radius: 50%;
  border: 0;
  background: transparent;
  cursor: pointer;

  svg {
    width: 24px;
    height: 24px;
  }
`;

// 확장
export const AddBar = styled.div`
  margin-top: 12px;
`;

export const ActionBar = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 9px 0 0;
`;

export const PrimaryBtn = styled.button`
  border: 1px solid ${palette.brandPrimary};
  background: ${palette.brandPrimary};
  color: ${palette.card};
  font-weight: 500;

  border-radius: 28px;
  display: flex;
  width: 101px;
  height: 30px;
  padding: 5px 16px;
  justify-content: center;
  align-items: center;
  gap: 10px;
  flex-shrink: 0;

  text-align: center;

  font-size: 14px;
  font-weight: 500;
`;

export const GhostBtn = styled(PrimaryBtn)`
  color: ${palette.brandPrimary};
  background-color: ${palette.card};
`;

export const IconBtn = styled.div`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  background: transparent;
  border: none;
  padding: 0;
  cursor: pointer;

  svg {
    width: 30px;
    height: 30px;
    pointer-events: none;
  }
`;

export const RowWrap = styled.div<{ $expanded?: boolean; $hidden?: boolean; $isSpecial?: boolean }>`
  border-radius: 12px;
  overflow: visible;
  background: ${({ $expanded, $hidden, $isSpecial }) =>
    $hidden
      ? palette.textDisabled2
      : $isSpecial
      ? palette.brandBackground
      : $expanded
      ? palette.card
      : 'transparent'};

  padding: ${({ $expanded }) => ($expanded ? '12px 8px 10px 12px' : '3px 11px')};
  padding: ${({ $isSpecial }) => ($isSpecial ? '3px 11px 8px 13px' : '')};
  box-shadow: ${({ $expanded }) => ($expanded ? '0 0 4px 0 rgba(0,0,0,0.10)' : 'none')};
  margin: ${({ $expanded }) => ($expanded ? '0 9px 0 12px' : '0 7px 0 11px')};
`;

// 모달
export const ModalOverlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: 1000;
  display: flex;
  align-items: center;
  justify-content: center;
  background: rgba(0, 0, 0, 0.45);

  margin: 0 auto;

  width: 100%;
  height: 100%;
  pointer-events: auto;
  touch-action: none;

  @media (hover: hover) and (pointer: fine) {
    width: 390px;
    height: 800px;
  }

  @media (min-width: 768px) {
    width: 390px;
    height: 800px;
  }
`;

export const ModalContent = styled.div`
  width: 100%;
  max-width: 420px;
  background: ${palette.card};
  border-radius: 18px;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.15);
  padding: 30px 22px 22px;
  margin: 0 16px;
`;

export const ModalTitle = styled.h3`
  font-weight: 500;
  margin: 0 0 6px;
  color: ${palette.textPrimary};
`;

export const ModalDesc = styled.p`
  font-weight: 300;
  margin: 0;
  color: ${palette.textSecondary};
`;

export const ItemPreview = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
  padding: 12px 16px;
  background: ${palette.brandBackground};
  color: ${palette.textPrimary};
  border-radius: 12px;
  font-size: 16px;
  font-weight: 300;

  div {
    width: 100%;
    justify-content: space-between;
  }
`;

export const ItemPreviewRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  width: 100%;
  justify-content: space-between;
`;

export const PreviewName = styled.span`
  color: ${palette.textPrimary};
  font-weight: 400;
`;

export const PreviewPriceUnit = styled.span`
  color: ${palette.textPrimary};
  font-weight: 300;
`;

export const PreviewStock = styled.span`
  color: ${palette.textPrimary};
  font-weight: 300;
`;

export const ModalActions = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  margin-top: 16px;
`;

export const ModalButton = styled.button`
  flex: 1;
  height: 51px;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 500;
  cursor: pointer;
  border: none;
  padding: 5px 16px;
`;

export const CancelButton = styled(ModalButton)`
  background: ${palette.card};
  color: ${palette.textPrimary};
  border: 1px solid ${palette.textDisabled2};
`;

export const DangerButton = styled(ModalButton)`
  background-color: ${palette.highlightRed};
  color: ${palette.card};
`;

export const Price = styled.span<{ $isSpecial?: boolean }>`
  color: ${({ $isSpecial }) => ($isSpecial ? palette.brandPrimary : 'inherit')};
  background-color: ${({ $isSpecial }) => ($isSpecial ? palette.brandPrimary : 'inherit')};
`;

export const Unit = styled.span<{ $isSpecial?: boolean }>`
  color: ${({ $isSpecial }) => ($isSpecial ? palette.brandPrimary : 'inherit')};
`;

export const SpecialTag = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 13px;
  color: ${palette.brandPrimary};
  background: ${palette.card};
  background: #ffffff;
  padding: 5px 5px;
  border-radius: 8px;
  margin: 3px;

  img {
    width: 16px;
    height: 16px;
  }
`;

export const SpecialTagSpan = styled.span``;

export const Gap = styled.div`
  width: 6px;
`;
