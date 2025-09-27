import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const LoginHome = styled.div`
  /* min-height: 100vh; */
  background-color: ${palette.brandBackground};
  padding: 0 30px;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
`;

export const Logo = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
`;

// 서비스 네임 및 설명
export const LogoNameBox = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 60px;
`;

export const LogoNameSvg = styled.div`
  margin-bottom: 20px;
  display: flex;
  justify-content: center;
  align-items: center;
`;

export const Tagline = styled.p`
  color: #666;
  font-size: 16px;
  font-weight: 400;
  margin: 0;
`;

export const ButtonContainer = styled.div`
  width: 100%;
  max-width: 300px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin-bottom: 20px;
`;

//시작하기 버튼
export const StartButton = styled.button`
  width: 100%;
  height: 56px;
  border: 0;
  background: #2f7d69;
  color: white;
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 18px;
  transition: all 0.2s ease;
  color: ${palette.card};

  &:hover {
    /* background: #256b5a; */
  }

  &:disabled {
    background: ${palette.textDisabled2};
  }
`;

//로그인 버튼
export const LoginButton = styled.button`
  width: 100%;
  height: 56px;
  border: 1px solid #b8d4cd;
  background: ${palette.brandPrimary10};
  color: ${palette.brandPrimary};
  font-size: 16px;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 18px;
  transition: all 0.2s ease;

  &:hover {
    /* background: #e8f5f2; */
  }

  &:disabled {
    background: ${palette.textDisabled2};
  }
`;

// 게스트 링크
export const GuestLink = styled.div`
  color: ${palette.textSecondary};
  font-size: 14px;
  font-weight: 400;
  cursor: pointer;
  transition: color 0.2s ease;
  margin-left: 150px !important;
`;
