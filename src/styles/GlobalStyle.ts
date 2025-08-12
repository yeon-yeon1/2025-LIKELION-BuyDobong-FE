import { createGlobalStyle } from 'styled-components';
import palette from '@lib/colorPalette';

export const GlobalStyle = createGlobalStyle`
  @font-face {
    font-family: 'Pretendard';
    font-style: normal;
    font-weight: 100;
    font-display: swap;
    src: url('/fonts/Pretendard-Thin.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Pretendard';
    font-style: normal;
    font-weight: 200;
    font-display: swap;
    src: url('/fonts/Pretendard-ExtraLight.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Pretendard';
    font-style: normal;
    font-weight: 300;
    font-display: swap;
    src: url('/fonts/Pretendard-Light.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Pretendard';
    font-style: normal;
    font-weight: 400;
    font-display: swap;
    src: url('/fonts/Pretendard-Regular.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Pretendard';
    font-style: normal;
    font-weight: 500;
    font-display: swap;
    src: url('/fonts/Pretendard-Medium.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Pretendard';
    font-style: normal;
    font-weight: 600;
    font-display: swap;
    src: url('/fonts/Pretendard-SemiBold.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Pretendard';
    font-style: normal;
    font-weight: 700;
    font-display: swap;
    src: url('/fonts/Pretendard-Bold.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Pretendard';
    font-style: normal;
    font-weight: 800;
    font-display: swap;
    src: url('/fonts/Pretendard-ExtraBold.woff2') format('woff2');
  }
  @font-face {
    font-family: 'Pretendard';
    font-style: normal;
    font-weight: 900;
    font-display: swap;
    src: url('/fonts/Pretendard-Black.woff2') format('woff2');
  }
  @media (hover: hover) and (pointer: fine) {
    body {
      width: 390px;
      margin: 0 auto;
      font-family: 'Pretendard', sans-serif;
    }
    #root {
      background-color: ${palette.brandBackground};
      min-height: 800px;
    }
  }
`;
