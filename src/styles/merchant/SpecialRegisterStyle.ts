import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const SpecialRegister = styled.section`
  width: 100%;
  display: flex;
  flex-direction: column;
  padding: 88px 16px 20px; /* 헤더 높이(56px) + 여백(12px) + 기존 패딩(20px) */
  max-width: 350px;
  margin: 0 auto;
  min-height: 100vh;
`;

export const Title = styled.h3`
  font-size: 20px;
  font-weight: 700;
  color: ${palette.textPrimary};
  margin: 0 0 12px;
`;

export const SubTitle = styled.p`
  font-size: 14px;
  font-weight: 300;
  color: ${palette.textSecondary};
  margin: 0 0 16px;
`;

export const Gap = styled.div`
  height: 16px;
`;

export const TimePickerGroup = styled.div`
  display: flex;
  justify-content: space-between;
  margin-top: 16px;
  gap: 12px;
`;

export const TimePicker = styled.button`
  flex: 1;
  height: 48px;
  border-radius: 12px;
  background: ${palette.card};
  border: 1px solid ${palette.textDisabled2};
  color: ${palette.textPrimary};
  font-size: 16px;
  cursor: pointer;
`;

export const PreviewWrap = styled.div`
  margin-top: 20px;
`;

export const ConfirmBtn = styled.button`
  margin-top: 20px;
  width: 100%;
  height: 51px;
  border-radius: 28px;
  font-size: 16px;
  font-weight: 500;
  background: ${palette.brandPrimary};
  color: ${palette.card};
  border: none;
  cursor: pointer;
`;

// 시간 모달 부분

export const Label = styled.div`
  display: flex;
  margin-bottom: 9px;
  color: ${palette.textPrimary};
`;

export const TimeGrid = styled.div`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 12px;
`;

export const TimeCol = styled.div`
  position: relative;
`;

export const TimeButton = styled.button`
  width: 100%;
  border-radius: 12px;
  border: none;
  background: ${palette.card};
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
  font-size: 16px;
  padding: 15px 17px;
`;

export const HiddenTimeInput = styled.input`
  position: absolute;
  opacity: 0;
  pointer-events: none;
`;

export const Time = styled.div`
  padding: 8px 11px;

  color: ${palette.brandPrimary};
  text-align: center;

  font-size: 16px;
  font-weight: 300;

  border-radius: 12px;
  border: 1px solid ${palette.brandPrimary20};
  background: ${palette.brandBackground};

  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
`;
