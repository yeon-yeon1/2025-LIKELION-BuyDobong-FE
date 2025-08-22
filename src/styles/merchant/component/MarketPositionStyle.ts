import DropDownSvg from '@assets/DropDown.svg?react';
import DropUpSvg from '@assets/DropUp.svg?react';
import styled from 'styled-components';
import palette from '@lib/colorPalette';

export const Wrap = styled.div`
  position: relative;
  width: 100%;
`;

export const SelectButton = styled.button`
  width: 100%;
  height: 42px;
  border-radius: 18px;
  border: none;
  padding: 0 16px;

  display: flex;
  align-items: center;
  justify-content: space-between;

  background: ${palette.card};
  color: ${palette.textPrimary};
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.2);
  font-size: 16px;
  font-weight: 300;
`;

export const DropDownImg = styled(DropDownSvg)`
  width: 20px;
  height: 20px;
`;
export const DropUpImg = styled(DropUpSvg)`
  width: 20px;
  height: 20px;
`;

export const Dropdown = styled.ul`
  position: absolute;
  left: 0;
  right: 0;
  margin-top: 8px;
  background: ${palette.card};
  border-radius: 16px;
  list-style: none;
  padding: 0;
  max-height: 320px;
  overflow-y: auto;
  box-shadow: 0 10px 30px rgba(0, 0, 0, 0.12);
  z-index: 20;

  &::-webkit-scrollbar {
    width: 0;
    height: 0;
  }
`;

export const Option = styled.li`
  padding: 16px 18px;
  cursor: pointer;
  font-size: 16px;
  letter-spacing: -0.01em;
  color: ${palette.textPrimary};

  &[aria-selected='true'] {
    font-weight: 700;
  }

  &:hover {
    background: ${palette.brandBackground};
  }

  &:first-child:hover {
    border-radius: 16px 16px 0 0;
    background: ${palette.brandBackground};
  }

  &:last-child:hover {
    border-radius: 0 0 16px 16px;
    background: ${palette.brandBackground};
  }
`;
