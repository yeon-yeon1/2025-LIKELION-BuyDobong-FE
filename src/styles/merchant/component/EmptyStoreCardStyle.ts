import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const Card = styled.div`
  height: 50px;
  display: grid;
  grid-template-columns: auto 1fr auto;
  align-items: center;
  gap: 16px;

  padding: 10px;
  border-radius: 12px;
  background: ${palette.card};
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.08);
`;

export const Left = styled.div`
  display: flex;
  align-items: center;
  justify-content: center;
`;

export const IconWrap = styled.div`
  width: 50px;
  height: 50px;
  border-radius: 16px;
  background: ${palette.brandBackground};
  display: grid;
  place-items: center;
`;

export const StoreIcon = styled.svg`
  stroke: ${palette.textDisabled};
`;

export const Body = styled.div`
  font-size: 17px;
  font-weight: 600;
  color: ${palette.textSecondary};
`;

export const Action = styled.button`
  display: flex;
  justify-content: center;
  align-items: center;
  gap: 3px;
  height: 34px;
  padding: 0 9px;
  border-radius: 18px;
  background: ${palette.brandBackground};
  color: ${palette.textPrimary};
  border: 1px solid ${palette.card};
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  margin-right: 11px;

  font-size: 16px;
  white-space: nowrap;
`;
