import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const MerchantHome = styled.div`
  padding: 20px;
`;

export const Space = styled.div`
  height: 15px;
`;

export const SmallSpace = styled.div`
  height: 10px;
`;

export const MarketCardWrapper = styled.div`
  cursor: pointer;
`;

export const ProductRegistCardWrapper = styled.div`
  display: flex;

  gap: 5px;
  padding: 15px;
  background: #ffffff;
  border-radius: 14px;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
  justify-content: space-between;
  align-items: center;
  flex-direction: column;
`;

export const ProductRegistCard = styled.span`
  color: ${palette.textPrimary};

  font-size: 16px;
  font-weight: 300;
`;

export const Wrapper = styled.div`
  display: flex;
  justify-content: space-between;
  width: 100%;
  align-items: center;
`;

//
export const ChangeRow = styled.div`
  display: grid;
  grid-template-columns: 85px 1fr 42px;
  align-items: center;
  gap: 8px;
  width: 91%;
  color: ${palette.textSecondary};
  font-weight: 400;

  background-color: ${palette.brandBackground};
  padding: 10px 12px;
  border-radius: 12px;

  &:nth-child(2) {
    margin-top: 10px;
  }

  & > :last-child {
    justify-self: center;
    text-align: center;
  }
`;

export const ChangeText = styled.span<{ $changed?: boolean; $first?: boolean }>`
  color: ${({ $first, $changed }) =>
    $first ? palette.textPrimary : $changed ? palette.brandPrimary : palette.textSecondary};
  font-weight: ${({ $first, $changed }) => ($first ? 500 : $changed ? 500 : 400)} !important;
`;

export const ChangeCol = styled.div`
  display: flex;
  align-items: baseline;
  gap: 4px;
`;

export const ChangeLabel = styled.span`
  color: ${palette.textSecondary};
  font-weight: 400;
`;

// 미리보기
export const SpPreview = styled.div`
  display: grid;
  grid-template-columns: 69px 1fr 90px;

  align-items: center;
  gap: 8px;
  width: 91%;
  color: ${palette.textSecondary};
  font-weight: 400;

  background-color: ${palette.brandBackground};
  padding: 8px 12px;
  border-radius: 12px;

  &:nth-child(2) {
    margin-top: 10px;
  }

  & > :last-child {
    justify-self: center;
    text-align: center;
  }
`;
export const SpName = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${palette.textPrimary};
`;
export const SpPriceWrap = styled.div`
  display: inline-flex;
  align-items: baseline;
  gap: 4px;
`;
export const Em = styled.span<{ $changed?: boolean }>`
  color: ${({ $changed }) => ($changed ? palette.brandPrimary : palette.textSecondary)};
  font-weight: ${({ $changed }) => ($changed ? 500 : 300)};
`;
export const Slash = styled.span`
  color: ${palette.textDisabled2};
`;
export const TimeBadge = styled.span`
  justify-self: end;
  background: ${palette.highlightRed20};
  color: ${palette.highlightRed};
  padding: 4px 7px;
  border-radius: 8px;
  font-size: 12px;
`;

export const MicText = styled.span`
  color: ${palette.textSecondary};
  font-size: 14px;
  font-weight: 300;
  display: inline-flex;
  margin: 0 25px;
`;

export const TextText = styled.span`
  color: ${palette.textSecondary};
  font-size: 14px;
  font-weight: 300;
  display: inline-flex;
  margin: 0 11px;
`;

export const MicWrapper = styled.div`
  display: flex;
  gap: 4px;
  justify-content: center;
  align-items: center;
  font-size: 16px;
  font-weight: 300;
  color: ${palette.textPrimary};
`;

export const ModeRow = styled.div`
  align-items: center;
  gap: 8px;
  color: ${palette.textSecondary};
  font-weight: 400;

  background-color: ${palette.brandBackground};
  padding: 10px 12px;
  border-radius: 12px;
  width: 91%;
  display: flex;

  &:nth-child(2) {
    margin-top: 10px;
  }
`;

// 모드 선택

export const RadioLabel = styled.label`
  display: flex;
  align-items: center;
  gap: 10px;
  width: 100%;
  cursor: pointer;
`;

export const HiddenRadio = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

export const RadioCircle = styled.span<{ $checked: boolean }>`
  width: 20px;
  height: 20px;
  border-radius: 50%;
  border: 2px solid ${({ $checked }) => ($checked ? palette.brandPrimary : palette.card)};
  background: ${({ $checked }) => ($checked ? palette.brandPrimary : palette.card)};
  display: inline-block;
  position: relative;
`;

export const RadioDot = styled.span<{ $checked: boolean }>`
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: ${({ $checked }) => ($checked ? palette.card : palette.brandBackground)};
  position: absolute;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%);
`;

export const ModalBtn = styled.button`
  width: 100%;
  padding: 20px;
  border-radius: 18px;
  border: none;
  background: ${palette.highlightRed20};
  color: ${palette.highlightRed};
  font-weight: 400;
  font-size: 16px;
  cursor: pointer;
`;
