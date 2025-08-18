import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const Page = styled.main`
  padding: 16px 16px 40px;
  display: flex;
  flex-direction: column;
  gap: 14px;
`;

/* 검색 */
export const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 18px;
  background: #ffffff;
  border: 1.5px solid ${palette.brandPrimary};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
`;

export const SearchInput = styled.input`
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 16px;
  color: ${palette.textPrimary};

  &::placeholder {
    color: ${palette.textSecondary};
    opacity: 0.9;
  }
`;

export const IconButton = styled.button`
  border: none;
  background-color: ${palette.card};
  svg {
    display: block;
  }
`;

/* 카드 버튼 */
export const ActionCard = styled.button`
  width: 100%;
  padding: 16px 18px;
  border-radius: 18px;
  background: #fff;
  border: 0;
  display: flex;
  align-items: center;
  justify-content: space-between;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  cursor: pointer;
  color: ${palette.textPrimary};

  svg {
    color: ${palette.textSecondary};
  }
`;

export const CardText = styled.span`
  font-size: 16px;
  font-weight: 400;
`;

/* 토글 */
export const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 14px 18px;
  border-radius: 33px;
  background: ${palette.card};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
`;

export const ToggleLabel = styled.span`
  font-size: 16px;
  color: ${palette.textPrimary};
`;

/* iOS 스타일 스위치: ON/OFF 색상 다름 */
export const Switch = styled.button<{ $on: boolean }>`
  position: relative;
  width: 56px;
  height: 32px;
  padding: 0;
  border: 1px solid ${({ $on }) => ($on ? palette.brandPrimary : 'rgba(0,0,0,0.08)')};
  border-radius: 9999px;
  background: ${({ $on }) => ($on ? 'rgba(47,125,105,0.10)' : '#eef4f1')};
  transition: background 180ms ease, border-color 180ms ease;
  cursor: pointer;

  /* thumb */
  &::after {
    content: '';
    position: absolute;
    top: 50%;
    left: 4px;
    width: 24px;
    height: 24px;
    border-radius: 50%;
    transform: translateY(-50%) translateX(${({ $on }) => ($on ? '24px' : '0')});
    background: ${({ $on }) => ($on ? palette.brandPrimary : '#ffffff')};
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.18);
    transition: transform 180ms ease, background 180ms ease;
  }
`;
