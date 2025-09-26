import styled from 'styled-components';
import palette from '@lib/colorPalette';

// 페이지 컨테이너
export const Signup = styled.div`
  padding: 60px 20px 120px;
`;

// 제목
export const SignupHead = styled.h1`
  font-size: 20px;
  font-weight: 500;
  margin: 20px 0;
  color: ${palette.textPrimary};
`;

// 필드 블록
export const Wrapper = styled.div`
  display: flex;
  flex-direction: column;
  gap: 8px;
  margin-bottom: 20px;
`;

export const InputBox = styled.div`
  display: flex;
  justify-content: space-between;
`;

// 한 줄(인풋 + 부가요소) 컨테이너
export const InputRow = styled.div<{ $hasError?: boolean }>`
  display: flex;
  align-items: center;
  gap: 8px;
  border: 1.5px solid ${({ $hasError }) => ($hasError ? palette.brandPrimary : 'transparent')};
  border-radius: 18px;
  padding: 7px 14px;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
  background-color: ${palette.card};
`;

// 입력
export const Input = styled.input`
  width: 310px;
  height: 22px;
  flex: 1;
  border-radius: 18px;
  border: none;
  outline: none;
  background-color: transparent;
  font-size: 14px;
  font-weight: 400;
  color: ${palette.textSecondary};
  &#phone {
    width: 195px;
    box-sizing: border-box;
  }
`;

// 버튼(인증요청)
export const Button = styled.button`
  white-space: nowrap;
  padding: 12px 20px;
  border-radius: 18px;
  background-color: ${palette.brandPrimary};
  color: white;
  border: none;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

// 타이머
export const Timer = styled.span`
  margin-left: 8px;
  font-size: 14px;
  font-weight: 600;
  color: ${palette.brandPrimary};
`;

// 체크(인증번호 우측)
export const Check = styled.span`
  font-size: 16px;
  color: ${palette.textSecondary};
`;

// 에러 문구
export const ErrorMessage = styled.div`
  margin-top: 6px;
  font-size: 13px;
  color: ${palette.highlightRed};
  display: flex;
  align-items: center;
  gap: 6px;
`;

// 아이콘 버튼 (눈/지우기)
export const IconButton = styled.button`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 28px;
  height: 28px;
  padding: 0;
  border-radius: 50%;
  background: transparent;
  border: none;
  font-size: 16px;
  color: ${palette.textSecondary};
  cursor: pointer;

  &:hover {
    background: rgba(0, 0, 0, 0.05);
  }
`;

// 하단 제출 바 + 버튼
export const BottomBar = styled.div`
  position: fixed;
  bottom: 15%;
  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 350px;
  padding: 16px 20px 20px;
  display: grid;
  place-items: center;
  z-index: 1000;
`;

export const PrimaryCTA = styled.button`
  width: 100%;
  height: 56px;
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
