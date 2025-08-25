import palette from '@lib/colorPalette';
import styled from 'styled-components';

export const Row = styled.div`
  display: grid;
  grid-auto-flow: column;
  overflow-x: auto;
  padding-bottom: 4px;
  gap: 12px;
  scroll-snap-type: x mandatory;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 0;
  }
`;

export const Card = styled.article`
  scroll-snap-align: start;
  width: 130px;
  background: ${palette.card};
  border-radius: 12px;
  padding: 14px 12px;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
  display: grid;
  gap: 8px;

  &[data-soldout='y'] {
    opacity: 0.6;
  }
`;

export const Title = styled.div`
  font-size: 13px;
  color: #5b6a67;
`;

export const Price = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #1a6a46;
  letter-spacing: -0.3px;
`;

export const Unit = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: #204e39;
  margin-left: 4px;
`;

export const TimeBadge = styled.div`
  margin-top: 2px;
  display: flex;
  font-size: 12px;
  font-weight: 400;
  color: #b65a5a;
  background: #f0d7d7;
  border-radius: 8px;
  padding: 6px 10px;
  justify-content: center;
  align-items: center;
`;

export const StockBadge = styled.div`
  display: flex;
  font-size: 12px;
  font-weight: 400;
  color: #4f595b;
  background: #e8eeec;
  border-radius: 8px;
  padding: 6px 10px;
  justify-content: center;
  align-items: center;
  &[data-variant='muted'] {
    color: #8a8f90;
    background: #e3e6e6;
  }
`;
