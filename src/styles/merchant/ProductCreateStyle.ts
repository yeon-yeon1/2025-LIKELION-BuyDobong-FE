import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const ProductCreate = styled.div`
  padding: 20px;
`;

export const Title = styled.h1`
  font-size: 22px;
  font-weight: 400;
  color: ${palette.textPrimary};
  margin: 4px 0 25px;
`;

export const SubTitle = styled.p`
  color: ${palette.textSecondary};

  font-size: 14px;
  font-weight: 300;
`;

export const Gap = styled.div`
  height: 15px;
`;
