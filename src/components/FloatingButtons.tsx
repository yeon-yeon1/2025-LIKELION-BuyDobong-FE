import React from 'react';
import styled from 'styled-components';
import { useNavigate } from 'react-router-dom';
import palette from '@lib/colorPalette';
import StoreIcon from '@assets/StoreIcon.svg?react';
import HomeIcon from '@assets/HomeIcon.svg?react';

const FloatingContainer = styled.div`
  position: fixed;
  right: 20px;
  bottom: 56px;
  display: flex;
  flex-direction: column;
  gap: 12px;
  z-index: 9999;
`;

const FloatingButton = styled.button<{ $primary?: boolean }>`
  width: 56px;
  height: 56px;
  border-radius: 50%;
  border: none;
  cursor: pointer;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15);
  transition: all 0.2s ease;
  background: ${(props) => (props.$primary ? palette.brandPrimary : palette.brandPrimary10)};

  &:hover {
    transform: translateY(-2px);
    box-shadow: 0 6px 16px rgba(0, 0, 0, 0.2);
  }

  &:active {
    transform: translateY(0);
  }
`;

interface FloatingButtonsProps {
  userRole: 'MERCHANT' | 'CUSTOMER' | null;
  isLoggedIn: boolean;
}

export default function FloatingButtons({ userRole, isLoggedIn }: FloatingButtonsProps) {
  const navigate = useNavigate();

  const handleHomeClick = () => {
    if (isLoggedIn && userRole === 'MERCHANT') {
      navigate('/merchantHome');
    } else {
      navigate('/customerHome');
    }
  };

  const handleStoreClick = () => {
    navigate('/storeRegister');
  };

  return (
    <FloatingContainer>
      {/* 상인 전용 상점 등록 버튼 */}
      {isLoggedIn && userRole === 'MERCHANT' && (
        <FloatingButton onClick={handleStoreClick} $primary={true} aria-label="상점 등록">
          <StoreIcon width={32} height={32} />
        </FloatingButton>
      )}

      {/* 홈 버튼 (항상 표시) */}
      <FloatingButton onClick={handleHomeClick} aria-label="홈으로">
        <HomeIcon width={32} height={32} />
      </FloatingButton>
    </FloatingContainer>
  );
}
