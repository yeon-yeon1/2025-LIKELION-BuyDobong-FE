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
    } else {
      navigate(-1);
    }
  };

  // CustomerHome과 MerchantHome에서는 BackButton을 표시하지 않음
  if (location.pathname === '/merchantHome') {
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
