import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const Wrap = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  background-color: ${palette.card};
  padding: 20px 15px;
  border-radius: 12px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

export const Label = styled.label`
  font-size: 16px;
  color: ${palette.textPrimary};
`;

export const Input = styled.input`
  height: 48px;
  border-radius: 12px;
  border: none;
  background: ${palette.brandBackground};
  padding: 0 15px;
  font-size: 16px;
  color: ${palette.textSecondary};
  outline: none;

  &:disabled {
    cursor: not-allowed;
  }

  &:placeholder {
    color: ${palette.textDisabled};
  }

  &[data-locked='true'] {
    background-color: ${palette.textDisabled2};
    color: ${palette.textSecondary};
    font-weight: 500;
    cursor: not-allowed;
  }
`;

export const StockGroup = styled.div`
  display: flex;
  gap: 10px;
`;

export const StockBtn = styled.button<{ $active?: boolean }>`
  min-width: 76px;
  height: 40px;
  border-radius: 999px;
  padding: 0 14px;
  border: 1px solid ${({ $active }) => ($active ? palette.brandPrimary : palette.textDisabled2)};
  background: ${({ $active }) => ($active ? palette.brandBackground : palette.card)};
  color: ${({ $active }) => ($active ? palette.brandPrimary : palette.textSecondary)};
`;
