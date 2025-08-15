import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const Button = styled.button<{ $recording: boolean }>`
  width: 100%;
  height: 56px;
  border: ${({ $recording }) => ($recording ? `1px solid ${palette.brandPrimary}` : '0')};
  isolation: isolate;
  background: ${({ $recording }) => ($recording ? palette.brandBackground : palette.brandPrimary)};
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.2);
  border-radius: 30px;
`;
