import React from 'react';
import * as H from '@styles/HeaderStyle';
import BackButton from '@assets/BackButton.svg?react';
import { useLocation, useNavigate } from 'react-router-dom';

function Header() {
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

  return (
    <>
      <H.Header>
        {location.pathname !== '/customerHome' && location.pathname !== '/merchantHome' && (
          <BackButton onClick={handleBack} />
        )}
      </H.Header>
    </>
  );
}

export default Header;
