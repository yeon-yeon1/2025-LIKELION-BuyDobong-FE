import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const Page = styled.form`
  padding: 60px 20px 0;
`;

export const Head = styled.h1`
  font-size: 20px;
  font-weight: 500;
  margin: 20px 0;
  color: ${palette.textPrimary};
`;

export const Caption = styled.label`
  display: block;
  margin-bottom: 12px;
  color: ${palette.textPrimary};
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

export const Card = styled.button<{ selected?: boolean }>`
  width: 100%;
  text-align: left;
  border-radius: 18px;
  padding: 16px 18px;
  background: #fff;
  border: 1.5px solid ${({ selected }) => (selected ? palette.brandPrimary : 'transparent')};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  outline: ${({ selected }) => (selected ? `2px solid rgba(47,125,105,0.15)` : 'none')};
  display: flex;
  flex-direction: column;
  gap: 6px;
  cursor: pointer;
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const CheckImg = styled.img`
  width: 18px;
  height: 18px;
`;

export const Title = styled.div<{ selected?: boolean }>`
  font-size: 18px;
  font-weight: 700;
  color: ${({ selected }) => (selected ? palette.brandPrimary : palette.textPrimary)};
`;

export const Desc = styled.div`
  font-size: 14px;
  color: ${palette.textSecondary};
`;
