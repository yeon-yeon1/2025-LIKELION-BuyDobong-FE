import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const Button = styled.button<{ $selected: boolean }>`
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 1px;
  width: 100%;
  height: 49px;
  border-radius: 16px;
  border: 1px solid
    ${({ $selected }) => ($selected ? palette.brandPrimary : 'rgba(47, 125, 105, 0.20)')};
  background: ${palette.brandBackground};
  color: ${({ $selected }) => ($selected ? palette.brandPrimary : palette.textPrimary)};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
  transition: all 0.2s ease;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
  isolation: isolate;
`;

export const Label = styled.span``;
