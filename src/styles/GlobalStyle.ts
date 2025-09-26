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

  /* ===== Safe area + header height variables ===== */
  :root {
    /* 최신 사파리/ iOS PWA */
    --safe-top: env(safe-area-inset-top);
    /* 구형 iOS 11 대응(선언만, 최신이 우선 적용됨) */
    /* --safe-top: constant(safe-area-inset-top); */

    /* 프로젝트 공통 헤더 기본 높이 */
    --header-base: 56px;
    --header-h: calc(var(--header-base) + var(--safe-top));
  }

  /* 헤더가 fixed라서 본문 시작점을 안전영역+헤더 높이만큼 내려줌 */
  #root, .page-wrap {
    /* 구형 iOS 우선 선언 후 최신으로 override */
    padding-top: calc(var(--header-base) + constant(safe-area-inset-top));
    padding-top: var(--header-h);
  }
////////////////////////////////////////////////////////////////
  @media (hover: hover) and (pointer: fine) {
    body {
      width: 390px;
      margin: 0 auto;
      font-family: 'Pretendard', sans-serif;
    }
    #root {
      background-color: ${palette.brandBackground};
      height: 800px;
      overflow-y: auto;
      overflow-x: hidden;

    }
  }
    #root {
      background-color: ${palette.brandBackground};
      overflow-x: hidden;

    }
  /* 모바일 전용: 터치 디바이스 */
  @media (hover: none) and (pointer: coarse) {
    body {
      background-color: ${palette.brandBackground};
      font-family: 'Pretendard', sans-serif;
      width: 100%;
      margin: 0 auto;
    }
  }

    @media (min-width: 768px) {
    body {
      width: 390px;
      margin: 0 auto;
      font-family: 'Pretendard', sans-serif;
    }
    #root {
      background-color: ${palette.brandBackground};
      height: 800px;
      overflow-y: auto;
      overflow-x: hidden;
    }
  }
`;
