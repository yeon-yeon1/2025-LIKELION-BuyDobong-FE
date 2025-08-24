import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const Page = styled.div`
  padding: 0 20px;
`;

export const Head = styled.h1`
  margin: 20px 0;
  font-size: 22px;
  font-weight: 600;
  color: ${palette.textPrimary};
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;

  label {
    color: ${palette.textPrimary};
    font-size: 14px;
  }
`;

export const InputRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 12px 14px;
  border-radius: 18px;
  background: ${palette.card};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
`;

export const Input = styled.input`
  flex: 1;
  border: none;
  outline: none;
  background: transparent;
  font-size: 16px;
  color: ${palette.textPrimary};

  &::placeholder {
    color: ${palette.textSecondary};
    opacity: 0.9;
  }
`;

export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0;
  border: none;
  background: transparent;
  cursor: pointer;
  color: ${palette.textDisabled}; /* 아이콘 기본색 */

  svg {
    width: 22px;
    height: 22px;
    display: block;
  }
`;

export const AutoRow = styled.div`
  align-self: flex-start; /* ⬅️ 왼쪽 정렬 */
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const CheckImgButton = styled.button`
  width: 26px;
  height: 26px;
  padding: 0;
  border: none;
  background: transparent;
  display: grid;
  place-items: center;
  cursor: pointer;

  svg {
    width: 26px;
    height: 26px;
    display: block;
  }
`;

export const AutoText = styled.span`
  color: ${palette.textSecondary};
  font-size: 15px;
`;

export const BottomBar = styled.div`
  display: block;
  margin-top: 400px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  align-items: center;
`;

export const PrimaryCTA = styled.button`
  width: 100%;
  height: 50px;
  border-radius: 18px;
  border: none;
  background: ${palette.brandPrimary};
  color: ${palette.card};
  font-size: 18px;
  font-weight: 600;
  cursor: pointer;

  &:disabled {
    background: ${palette.textDisabled2};
    cursor: not-allowed;
  }
`;
