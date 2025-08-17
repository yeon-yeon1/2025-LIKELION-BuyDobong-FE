import styled from 'styled-components';
import palette from '@lib/colorPalette';
import { rgba } from 'polished';

export const LoginHome = styled.div`
  padding: 0 30px;
`;

export const Logo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  width: 300px;
  margin: 0 auto;
  padding: 139px 0 80px 0;
`;

//서비스 네임 및 설명
export const LogoNameBox = styled.div`
  display: block;
`;

export const Ko = styled.div`
  color: ${palette.textPrimary};
  font-size: 32px;
  font-weight: 600;
`;

export const En = styled.h3`
  color: ${palette.brandPrimary};
  font-size: 20px;
  font-weight: 500;
  opacity: 50%;
  margin: 10px 0;
`;

export const Tagline = styled.p`
  color: ${palette.textSecondary};
  font-size: 16px;
  font-weight: 400;
`;

//시작하기 버튼
export const StartButton = styled.button`
  margin-top: 36px;
  width: 100%;
  height: 56px;
  border: 0;
  isolation: isolate;
  background: ${palette.brandPrimary};
  color: ${palette.card};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.2);
  border-radius: 18px;

  &:disabled {
    background: ${palette.textDisabled2};
  }
`;

//로그인 버튼
export const LoginButton = styled.button`
  margin-top: 10px;
  width: 100%;
  height: 56px;
  border: 0;
  isolation: isolate;
  background: ${palette.card};
  color: ${palette.brandPrimary};
  border: 1px solid ${rgba(palette.brandPrimary, 0.3)};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;

  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.2);
  border-radius: 18px;

  &:disabled {
    background: ${palette.textDisabled2};
  }
`;
