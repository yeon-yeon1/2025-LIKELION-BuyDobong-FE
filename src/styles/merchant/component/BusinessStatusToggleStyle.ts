import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const Wrap = styled.div<{ $disabled?: boolean }>`
  display: flex;
  width: 320px;
  height: 40px;
  padding: 3px;
  justify-content: center;
  align-items: center;
  gap: 2px;

  outline: none;

  border-radius: 12px;
  border: 1px solid rgba(98, 161, 147, 0.2);
  background-color: ${palette.card};

  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
`;

export const Knob = styled.div<{ $pos: 'left' | 'right' }>`
  position: absolute;
  top: 6px;
  bottom: 6px;
  width: calc(50% - 6px);
  border-radius: 12px;
  background: linear-gradient(0deg, rgba(255, 255, 255, 0.45) 0%, rgba(255, 255, 255, 0.2) 100%);
  pointer-events: none;
`;

export const Segment = styled.button<{ $active: boolean }>`
  z-index: 1;
  appearance: none;
  border: 0;
  background: transparent;
  color: ${({ $active }) => ($active ? palette.card : '#B0B1B4')};
  font-weight: 400;
  font-size: 16px;
  letter-spacing: -0.025em;
  border-radius: 9px;

  cursor: pointer;

  display: flex;
  padding: 11px 0;
  justify-content: center;
  align-items: center;
  gap: 7px;
  flex: 1 0 0;

  &:last-child {
    margin-right: 0;
  }

  &:first-of-type {
    background: ${({ $active }) => ($active ? palette.brandPrimary : 'transparent')};
  }
  &:last-of-type {
    background: ${({ $active }) => ($active ? palette.textDisabled3 : 'transparent')};
  }
`;

export const Dot = styled.span<{ $active: boolean }>`
  display: inline-block;
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $active }) => ($active ? palette.card : '#B0B1B4')};
`;
