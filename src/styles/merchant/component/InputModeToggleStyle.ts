import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const Wrap = styled.div<{ $disabled: boolean }>`
  display: flex;
  align-items: center;
  background-color: rgba(47, 125, 105, 0.2);
  border-radius: 12px;
  position: relative;
  padding: 4px;
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  height: 40px;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
`;

export const Knob = styled.div<{ $pos: 'left' | 'right' }>`
  position: absolute;
  top: 4px;
  left: ${({ $pos }) => ($pos === 'left' ? '4px' : '50%')};
  width: 49%;
  height: calc(100% - 8px);
  background-color: ${palette.card};
  border-radius: 10px;
  transition: left 0.3s ease;
`;

export const Segment = styled.button<{ $active: boolean }>`
  flex: 1;
  background: none;
  border: none;
  color: ${({ $active }) => ($active ? palette.textPrimary : palette.textDisabled)};
  font-weight: ${({ $active }) => ($active ? 600 : 400)};
  font-size: 16px;
  z-index: 1;
  cursor: pointer;
  padding: 8px 0;
`;
