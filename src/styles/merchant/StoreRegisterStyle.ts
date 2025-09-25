import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const StoreRegister = styled.div`
  display: flex;
  flex-direction: column;
  gap: 18px;
  padding: 88px 20px 20px; /* 헤더 높이(56px) + 여백(12px) + 기존 패딩(20px) */
  max-width: 350px;
  margin: 0 auto;
  min-height: 100vh;
`;

export const Title = styled.h1`
  font-size: 22px;
  font-weight: 400;
  color: ${palette.textPrimary};
  margin: 4px 0 12px;
`;

export const Field = styled.div`
  display: flex;
  flex-direction: column;
  gap: 5px;
  label {
    margin-bottom: 10px;
  }
`;

export const LabelWrapper = styled.div`
  display: flex;
  gap: 10px;
  align-items: center;
`;

export const Label = styled.label`
  font-size: 18px;
  color: ${palette.textPrimary};
`;

export const SubLabel = styled.label`
  font-size: 14px;
  color: ${palette.textSecondary};
  font-weight: 200;
`;

export const Input = styled.input`
  height: 42px;
  padding: 0 14px;
  border-radius: 18px;
  background: ${palette.card};
  color: ${palette.textPrimary};
  font-size: 15px;
  font-weight: 300;

  border: none;
  outline: none;
  box-shadow: 0 0 4px 0 ${palette.textPhotoBlur};

  ::placeholder {
    color: ${palette.textSecondary};
  }
`;

export const MapBox = styled.div`
  width: 100%;
  height: 360px;
  overflow: hidden;
  background: ${palette.brandBackground};
  border-radius: 18px;
  border: none;
  box-shadow: 0 0 4px 0 ${palette.textPhotoBlur};
`;

export const Row = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 12px;
  flex-direction: column;
`;

export const PickBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 1px;
  height: 36px;
  padding: 0 12px;
  border-radius: 30px;
  background: ${palette.card};
  color: ${palette.textPrimary};
  border: none;
  box-shadow: 0 0 4px 0 ${palette.textPhotoBlur};
  font-size: 14px;
  cursor: pointer;
  svg {
    width: 16px;
    height: 16px;
  }
`;

export const PreviewCardWrap = styled.div`
  box-sizing: border-box;
  margin-left: auto;
  margin-right: auto;
  width: calc(100% + 2 * 20px);
  transform: translateX(-20px);
  margin-top: 4px;
  margin-bottom: -28px;
  padding: 20px 20px 15px;
  background: ${palette.card};
  border-radius: 16px 16px 0 0;
  box-shadow: 0 0 4px 0 ${palette.textPhotoBlur};
`;

export const RegistLabel = styled.span`
  color: ${palette.textPrimary};
  font-size: 14px;
  font-weight: 400;
`;

export const RegistWrapper = styled.div`
  display: flex;
  align-items: center;
  gap: 1px;
  margin-bottom: 10px;

  svg {
    width: 20px;
    height: 20px;
  }
`;

export const Bottom = styled.div`
  margin-top: 10px;
  button,
  div {
    width: 100%;
  }
`;

export const Map = styled.div``;
export const ImgInput = styled.input``;

export const ImageBox = styled.button<{ $hasPreview?: boolean }>`
  width: 90px;
  height: 90px;
  border-radius: 16px;
  display: grid;
  place-items: center;
  position: relative;
  overflow: hidden;
  margin: 8px 0 12px;
  cursor: pointer;
  padding: 0;

  border: ${({ $hasPreview }) => ($hasPreview ? 'none' : '2px dashed #bcd1c7')};
  background: ${({ $hasPreview }) => ($hasPreview ? '#fff' : 'transparent')};

  svg {
    width: 80px;
    height: 80px;
  }

  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
    border-radius: 16px;
    display: block;
  }
`;

export const RemoveBtn = styled.button`
  position: absolute;
  top: 4px;
  right: -5px;
  z-index: 1;
  width: 20px;
  height: 20px;
  border-radius: 50%;
  padding: 0;
  border: none;
  display: grid;
  place-items: center;
  cursor: pointer;

  background: rgba(0, 0, 0, 0.2);
  -webkit-backdrop-filter: blur(5px);
  backdrop-filter: blur(5px);

  svg {
    width: 8px;
    height: 8px;
  }
`;

export const BtnWrapper = styled.div`
  position: relative;
`;
