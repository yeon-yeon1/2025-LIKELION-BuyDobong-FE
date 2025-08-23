import styled from 'styled-components';

export const Grid = styled.div`
  display: grid;
  grid-template-columns: repeat(2, minmax(0, 1fr));
  gap: 12px;
`;

export const Card = styled.article`
  background: #ffffff;
  border-radius: 12px;
  padding: 14px 12px;
  box-shadow: 0 6px 16px rgba(0, 0, 0, 0.06);

  &[aria-disabled='true'] {
    opacity: 0.6;
  }
`;

export const Title = styled.div`
  font-size: 13px;
  color: #5b6a67;
  margin-bottom: 4px;
`;

export const Price = styled.div`
  font-size: 18px;
  font-weight: 600;
  color: #174c36;
  letter-spacing: -0.3px;
`;

export const Unit = styled.span`
  font-size: 12px;
  font-weight: 400;
  color: #39544a;
  margin-left: 4px;
`;

export const Footer = styled.div`
  margin-top: 8px;
  font-size: 12px;
  font-weight: 400;
  color: #4f595b;
  background: #e8eeec;
  border-radius: 8px;
  padding: 6px 10px;
  display: flex;
  justify-content: center;

  &[data-variant='muted'] {
    color: #8a8f90;
    background: #e3e6e6;
  }
`;
