import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const Header = styled.div`
  position: fixed;
  /* top: 0; */
  top: constant(safe-area-inset-top);
  top: env(safe-area-inset-top);

  left: 50%;
  transform: translateX(-50%);
  width: 100%;
  max-width: 350px;
  display: flex;
  height: 56px;
  padding: 0 20px;
  align-items: center;
  flex-shrink: 0;
  background: ${palette.brandBackground};
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
  z-index: 9999;

  @media (hover: none) and (pointer: coarse) {
    max-width: 100%;
  }
`;

export const HeaderContent = styled.div`
  display: flex;
  align-items: center;
  width: 100%;
  position: relative;
`;

export const BackButtonContainer = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 40px;
  height: 40px;
  border: none;
  background: transparent;
  cursor: pointer;
  border-radius: 8px;
  transition: background-color 0.2s ease;
  z-index: 1;

  svg {
    color: ${palette.textPrimary};
    transition: color 0.2s ease;
  }
`;

export const LogoContainer = styled.div`
  position: absolute;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  align-items: center;
  justify-content: center;
  cursor: pointer;
  border-radius: 8px;
  padding: 8px;
  transition: background-color 0.2s ease;
`;
