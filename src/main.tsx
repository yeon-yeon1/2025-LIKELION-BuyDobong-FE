import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App from './App.tsx';
import { BrowserRouter } from 'react-router-dom';
import { GlobalStyle } from '@styles/GlobalStyle';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <BrowserRouter>
      <GlobalStyle />
      <App />
    </BrowserRouter>
  </StrictMode>
);
