import styled, { css } from 'styled-components';
import palette from '@lib/colorPalette';
import { rgba } from 'polished';
import FilterSvg from '@assets/FilterButton.svg?react';

/* 썸네일 크기 옵션 */
export const Thumb = styled.img<{ small?: boolean }>`
  width: ${({ small }) => (small ? 32 : 56)}px;
  height: ${({ small }) => (small ? 32 : 56)}px;
  border-radius: 12px;
  object-fit: cover;
`;

export const Container = styled.div`
  padding: 68px 16px 32px; /* 헤더 높이(56px) + 여백(12px) */
  max-width: 350px;
  margin: 0 auto;
`;

/* ---------------- 상품 모드 ---------------- */
export const PCard = styled.div`
  padding: 12px;
  border-radius: 18px;
  background: ${palette.card};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  gap: 10px;
`;

export const StoreBar = styled.div`
  display: flex;
  align-items: center;
  gap: 10px;
  background: ${palette.brandBackground};
  border-radius: 12px;
  padding: 8px 10px;
  color: ${palette.textPrimary};
  font-weight: 400;
  cursor: pointer;
`;

export const StoreName = styled.div`
  flex: 1;
  font-size: 14px;
`;

export const ProductList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 14px;
  padding: 4px 8px 0;
`;

export const ProductRow = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const PName = styled.div`
  flex: 1;
  font-size: 16px;
  font-weight: 600;
  color: ${palette.textPrimary};
`;

export const PPrice = styled.div`
  font-size: 14px;
  color: ${palette.textPrimary};
  white-space: nowrap;
`;

export const Slash = styled.span`
  display: inline-block;
  margin: 0 4px;
  color: ${palette.textSecondary};
`;

export const MoreBtn = styled.button`
  margin-top: 6px;
  width: 100%;
  padding: 10px 12px;
  border-radius: 12px;
  background: #f7fbfa;
  border: 1px solid ${rgba(palette.brandPrimary, 0.3)};
  color: ${palette.brandPrimary};
  font-weight: 600;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.1);
`;

export const DownIcon = styled.span`
  font-size: 14px;
  font-weight: 500;
  align-items: center;
`;

/* ------ 기존 것 (참고, 없으면 추가) ------ */
export const KeywordSearch = styled.main`
  display: flex;
  flex-direction: column;
  gap: 14px;
  min-height: 100vh;
`;

export const SearchForm = styled.form`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 6px 14px;
  border-radius: 50px;
  background: ${palette.card};
`;
export const SearchInput = styled.input`
  flex: 1;
  border: 0;
  outline: 0;
  background: transparent;
  font-size: 16px;
  line-height: 22px;
  -webkit-text-size-adjust: 100%;
  color: ${palette.textDisabled};
  &::placeholder {
    color: ${palette.textSecondary};
    opacity: 0.9;
  }
`;
export const SearchButton = styled.button`
  display: grid;
  place-items: center;
  width: 34px;
  height: 34px;
  border: none;
  color: ${palette.brandPrimary};
  background: ${palette.card};
  cursor: pointer;
`;

export const ResultBar = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 2px 2px 0;
`;
export const Query = styled.div`
  font-size: 14px;
  color: ${palette.textPrimary};
`;
export const Em = styled.span`
  color: ${palette.brandPrimary};
  font-weight: 600;
`;

export const ToggleWrap = styled.div`
  padding: 8px;
  border-radius: 16px;
`;

export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;

export const Card = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 18px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${palette.card};
  border: 0;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
`;

export const Info = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 6px;
  text-align: left;
`;
export const Title = styled.div`
  font-size: 16px;
  font-weight: 600;
  color: ${palette.textPrimary};
`;
export const MetaRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const Chip = styled.span<{ $green?: boolean; $gray?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 9999px;
  font-size: 13px;

  background: ${({ $green, $gray }) =>
    $green
      ? 'rgba(47,125,105,0.15)' /* 영업중(초록) */
      : $gray
      ? '#ddd' /* 영업종료(회색) */
      : '#eee'}; /* 기본 */

  color: ${({ $green, $gray }) =>
    $green
      ? palette.brandPrimary /* 영업중 텍스트 */
      : $gray
      ? '#6B6B6F' /* 영업종료 텍스트(회색) */
      : palette.textSecondary}; /* 기본 */
`;

export const Dot = styled.span<{ $green?: boolean; $gray?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $green, $gray }) =>
    $green ? palette.brandPrimary : $gray ? '#9AA3A6' : palette.textSecondary};
`;

export const Chevron = styled.div`
  color: ${palette.textSecondary};
`;

/* ResultBar 안 버튼들 */
export const SortGroup = styled.div`
  display: flex;
  align-items: center;
`;
export const SortBtn = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 8px 12px;
  border-radius: 9999px;
  background: #fff;
  border: 1px solid rgba(0, 0, 0, 0.08);
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.2);
  color: ${palette.textPrimary};
  font-size: 14px;
  cursor: pointer;
`;

/* 오른쪽 필터 아이콘 버튼 */
export const FilterButton = styled.button<{ $active?: boolean }>`
  cursor: pointer;
  background-color: transparent;
  border: none;
  padding: 0;
  display: flex;
  align-items: center;
`;

export const FilterIcon = styled(FilterSvg)<{ $active?: boolean }>`
  width: 36px;
  height: 28px;
  pointer-events: none; /* 클릭 타깃은 버튼 */
`;

/* ----------------- 공통 모달 ----------------- */
export const Backdrop = styled.div`
  position: fixed;
  inset: 0;
  background: rgba(0, 0, 0, 0.45);
  display: grid;
  place-items: center;
  z-index: 1000;
`;
export const Modal = styled.div`
  width: min(520px, calc(100% - 100px));
  background: #fff;
  border-radius: 22px;
  padding: 18px;
  box-shadow: 0 12px 32px rgba(0, 0, 0, 0.2);
`;
export const ModalBody = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
export const ModalActions = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 16px;
`;
export const Primary = styled.button`
  flex: 1;
  height: 52px;
  border-radius: 18px;
  background: ${palette.brandPrimary};
  color: #fff;
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
`;
export const Secondary = styled.button`
  flex: 1;
  height: 52px;
  border-radius: 18px;
  background: #fff;
  color: ${palette.textPrimary};
  border: 1.5px solid rgba(47, 125, 105, 0.25);
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
`;

/* 정렬 옵션 버튼 */
export const Option = styled.button<{ $selected?: boolean }>`
  width: 100%;
  padding: 14px 16px;
  border-radius: 14px;
  border: none;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;
  background: ${({ $selected }) => ($selected ? 'rgba(47,125,105,0.12)' : '#eef3f1')};
  color: ${({ $selected }) => ($selected ? palette.textPrimary : '#b7bfc1')};

  &:disabled {
    cursor: not-allowed;
    background: #fff;
    color: #c1c7c9;
  }
`;

/* 필터용 핏칩들 */
export const PillRow = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
`;
export const PillWrap = styled.div`
  display: flex;
  gap: 10px;
  flex-wrap: wrap;
  margin-top: 8px;
`;
export const Pill = styled.button<{ $selected?: boolean; $big?: boolean }>`
  position: relative;
  display: inline-flex;
  align-items: center;
  gap: 3px;
  border-radius: 28px;
  border: 1.5px solid ${({ $selected }) => ($selected ? palette.brandPrimary : 'rgba(0,0,0,0.12)')};
  background: ${({ $selected }) => ($selected ? 'rgba(47,125,105,0.08)' : '#fff')};
  color: ${({ $selected }) => ($selected ? palette.brandPrimary : palette.textSecondary)};
  font-weight: 700;
  cursor: pointer;
  padding: ${({ $big }) => ($big ? '10px 18px' : '8px 14px')};
`;

export const SectionTitle = styled.div`
  margin-top: 6px;
  color: ${palette.textPrimary};
  font-weight: 700;
`;

/* 스크롤 픽커(정렬) */
export const ScrollPicker = styled.div`
  max-height: 220px;
  overflow-y: auto;
  padding: 8px;
  border-radius: 14px;
  background: #f2f5f4;
`;

export const PickItem = styled.button<{ $selected?: boolean }>`
  width: 100%;
  text-align: center;
  padding: 14px 10px;
  margin: 6px 0;
  border: none;
  border-radius: 14px;
  font-size: 16px;
  font-weight: 700;
  cursor: pointer;

  background: ${({ $selected }) => ($selected ? 'rgba(47,125,105,0.12)' : '#eef3f1')};
  color: ${({ $selected }) => ($selected ? palette.textPrimary : '#8fa3a0')};

  &:focus-visible {
    outline: 2px solid ${palette.brandPrimary};
    outline-offset: 2px;
  }
`;

/* 필터 — 시장 단일 선택 리스트 */
export const CheckList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
  margin-top: 8px;
`;

export const CheckItem = styled.button<{ $selected?: boolean }>`
  display: flex;
  align-items: center;
  gap: 10px;
  padding: 12px 14px;
  border-radius: 14px;
  border: 1px solid rgba(0, 0, 0, 0.12);
  background: #fff;
  font-size: 16px;
  cursor: pointer;
  color: ${({ $selected }) => ($selected ? palette.textPrimary : palette.textSecondary)};

  /* 왼쪽 체크 아이콘 */
  &::before {
    display: inline-block;
    width: 18px;
    text-align: center;
    color: ${palette.brandPrimary};
    font-weight: 900;
  }
`;

export const ErrorText = styled.div``;

export const Loading = styled.div``;
