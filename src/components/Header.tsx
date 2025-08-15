import React from 'react';
import * as H from '@styles/HeaderStyle';
import BackButton from '@assets/BackButton.svg?react';
import { useLocation } from 'react-router-dom';

function Header() {
  const location = useLocation();
  return (
    <>
      <H.Header>
        {location.pathname !== '/customerHome' && location.pathname !== '/merchantHome' && (
          <BackButton />
        )}
      </H.Header>
    </>
  );
}

export default Header;
