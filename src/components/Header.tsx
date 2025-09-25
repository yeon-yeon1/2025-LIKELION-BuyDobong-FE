import React from 'react';
import * as H from '@styles/HeaderStyle';
import Logo from '@assets/Logo.svg?react';
import BackIcon from '@assets/BackButton.svg?react';
import { useLocation, useNavigate } from 'react-router-dom';

// BackButton 컴포넌트
function BackButton() {
  const location = useLocation();
  const navigate = useNavigate();

  const handleBack = () => {
    if (location.pathname === '/storeRegister' || location.pathname === '/productRegister') {
      navigate('/merchantHome');
    } else if (location.pathname === '/product/new') {
      navigate('/productRegister');
    } else if (location.pathname === '/login') {
      navigate('/');
    } else {
      navigate(-1);
    }
  };

  // keywordSearch 메인 경로일 때만 BackButton을 숨김 (쿼리스트링이 붙어 있으면 표시)
  if (location.pathname === '/keywordSearch' && !location.search) {
    return null;
  }

  return (
    <H.BackButtonContainer onClick={handleBack}>
      <BackIcon width={24} height={24} />
    </H.BackButtonContainer>
  );
}

function Header() {
  return (
    <H.Header>
      <H.HeaderContent>
        <BackButton />
        <H.LogoContainer>
          <Logo width={56} height={56} />
        </H.LogoContainer>
      </H.HeaderContent>
    </H.Header>
  );
}

export default Header;
