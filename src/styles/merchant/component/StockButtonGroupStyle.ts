import styled from 'styled-components';

export const Container = styled.div<{ gap?: number; columns?: number }>`
  display: grid;
  gap: ${({ gap = 8 }) => `${gap}px`};
  grid-template-columns: ${({ columns = 1 }) => `repeat(${columns}, 1fr)`};
  display: flex;
`;
