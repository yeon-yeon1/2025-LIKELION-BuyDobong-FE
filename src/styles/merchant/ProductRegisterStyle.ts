import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const ProductRegister = styled.div`
  padding: 88px 20px 20px; /* 헤더 높이(56px) + 여백(12px) + 기존 패딩(20px) */
  max-width: 350px;
  margin: 0 auto;
  /* min-height: 100vh; */
`;

export const Title = styled.h1`
  font-size: 22px;
  font-weight: 400;
  color: ${palette.textPrimary};
  margin: 4px 0 25px;
`;

export const PlusButtonWrapper = styled.div`
  margin-top: 39px;
`;
