import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const Header = styled.div`
  display: flex;
  height: 56px;
  padding: 0 20px;
  align-items: center;
  flex-shrink: 0;
  background: ${palette.brandBackground};
  box-shadow: 0 4px 20px 0 rgba(0, 0, 0, 0.05);
  z-index: 9999;
`;
