import React from 'react';
import * as H from '@styles/HeaderStyle';
import BackButton from '@assets/BackButton.svg?react';
import { useLocation, useNavigate } from 'react-router-dom';

function Header() {
  const location = useLocation();
  const navigate = useNavigate();
  return (
    <>
      <H.Header>
        {location.pathname !== '/customerHome' && location.pathname !== '/merchantHome' && (
          <BackButton onClick={() => navigate(-1)} />
        )}
      </H.Header>
    </>
  );
}

export default Header;
