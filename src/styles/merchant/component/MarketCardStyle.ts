import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const Card = styled.div`
  gap: 16px;
  padding: 10px 15px;
  background: ${palette.card};
  border-radius: 14px;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);

  display: flex;
  justify-content: space-between;
  align-items: center;
`;

export const Thumb = styled.div`
  width: 60px;
  height: 60px;
  border-radius: 10px;
  overflow: hidden;
  background: ${palette.brandBackground};
  display: grid;
  place-items: center;

  svg,
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    display: block;
  }
`;

export const Wrapper = styled.div`
  display: flex;
  gap: 16px;
`;

export const Info = styled.div`
  display: flex;
  flex-direction: column;
  justify-content: center;
  min-width: 0;
`;

export const Title = styled.div`
  font-weight: 500;
  color: ${palette.textPrimary};
  margin-bottom: 6px;
  font-size: 16px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const BadgeWrap = styled.div`
  display: flex;
  gap: 6px;
  flex-wrap: wrap;
`;

export const Badge = styled.span<{ dim?: boolean; isOpen?: boolean }>`
  display: inline-flex;
  align-items: center;
  padding: 4px 8px;
  border-radius: 12px;
  gap: 4px;
  background: ${({ dim, isOpen }) =>
    dim ? (isOpen ? palette.brandPrimary20 : palette.textDisabled2) : palette.brandBackground};
  color: ${({ dim, isOpen }) =>
    dim ? (isOpen ? palette.brandPrimary : palette.textSecondary) : palette.textSecondary};
  font-size: 12px;
  font-weight: 300;
`;
