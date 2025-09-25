import * as L from '@styles/LoginHomeStyle';
import Logo from '@assets/LoginHomeLogo.svg?react';
import LogoName from '@assets/LogoName.svg?react';
import { useNavigate } from 'react-router-dom';

function LoginHome() {
  const navigate = useNavigate();
  return (
    <>
      <L.LoginHome>
        <L.Logo>
          <Logo aria-label="앱 로고" />
        </L.Logo>
        <L.LogoNameBox>
          <L.LogoNameSvg>
            <LogoName />
          </L.LogoNameSvg>
          <L.Tagline>말하면 전해지는 전통시장 특가 정보</L.Tagline>
        </L.LogoNameBox>
        <L.ButtonContainer>
          <L.StartButton onClick={() => navigate('/signup')}>시작하기</L.StartButton>
          <L.LoginButton onClick={() => navigate('/login')}>로그인</L.LoginButton>
        </L.ButtonContainer>
        <L.GuestLink onClick={() => navigate('/keywordSearch')}>
          로그인 없이 둘러보기 &gt;
        </L.GuestLink>
      </L.LoginHome>
    </>
  );
}

export default LoginHome;
