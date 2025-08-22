import styled from 'styled-components';
import { rgba } from 'polished';
import palette from '@lib/colorPalette';
import deleteBtn from '@assets/deleteButton.svg?react'; // ← 방금 준 SVG 파일명으로 저장

/* 페이지/섹션 */
export const Page = styled.main`
  padding: 12px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;
export const Section = styled.section`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
export const SectionHead = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 10px 14px;
  border-radius: 14px;
  background: ${palette.brandBackground};
`;
export const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 700;
  color: ${palette.textPrimary};
  margin: 0 5px;
`;
export const EditBtn = styled.button`
  border: 0;
  background: transparent;
  color: ${palette.textPrimary};
  font-size: 14px;
  font-weight: 700;
  cursor: pointer;
`;

/* 키워드 */
export const KeywordList = styled.div`
  display: flex;
  flex-direction: column;
  gap: 10px;
`;
export const KeywordRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  text-align: left;
  padding: 10px 15px;
  border-radius: 12px;
  background: ${palette.card};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  color: ${palette.textPrimary};
  font-size: 16px;
`;
export const SearchIcon = styled.svg`
  width: 22px;
  height: 22px;
  color: ${palette.brandPrimary};
`;

/* 공통 카드(상점) */
export const List = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
`;
export const Card = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  display: flex;
  align-items: center;
  gap: 12px;
  background: ${palette.card};
  border: 0;
  cursor: pointer;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
`;
export const Thumb = styled.img`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  object-fit: cover;
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
  font-weight: 700;
  color: ${palette.textPrimary};
`;
export const MetaRow = styled.div`
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;
export const Chip = styled.span<{ $green?: boolean }>`
  display: inline-flex;
  align-items: center;
  gap: 6px;
  padding: 6px 10px;
  border-radius: 9999px;
  font-size: 13px;
  background: ${({ $green }) => ($green ? 'rgba(47,125,105,0.15)' : '#edf0f2')};
  color: ${({ $green }) => ($green ? palette.brandPrimary : palette.textSecondary)};
`;
export const Dot = styled.span`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${palette.brandPrimary};
`;
export const Chevron = styled.div`
  color: ${palette.textSecondary};
  font-size: 22px;
  line-height: 1;
`;

/* 삭제 버튼(–) */
export const RemoveBtn = styled.button<{ $size?: 'sm' | 'md' }>`
  border: 0;
  background: transparent;
  padding: 0;
  display: grid;
  place-items: center;
  cursor: pointer;
`;

export const MinusSvg = styled(deleteBtn)<{ $size?: 'sm' | 'md' }>`
  width: ${({ $size }) => ($size === 'sm' ? '32px' : '40px')};
  height: ${({ $size }) => ($size === 'sm' ? '32px' : '40px')};
`;

/* 더보기 */
export const MoreBtn = styled.button`
  width: 100%;
  padding: 12px;
  border-radius: 12px;
  background: #f7fbfa;
  border: 1px solid ${rgba(palette.brandPrimary, 0.3)};
  color: ${palette.brandPrimary};
  font-weight: 700;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  cursor: pointer;
  box-shadow: 0 0 4px 0 rgba(0, 0, 0, 0.08);
`;
export const DownIcon = styled.span`
  font-size: 14px;
  font-weight: 700;
  line-height: 1;
`;

/* 빈 상태 */
export const Empty = styled.div`
  padding: 26px 14px;
  border-radius: 18px;
  background: ${palette.card};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 10px;
  color: ${palette.textSecondary};
  font-size: 18px;
  font-weight: 700;
`;
export const EmptyIcon = styled.span`
  width: 28px;
  height: 28px;
  border-radius: 50%;
  background: #8a8f91;
  color: #fff;
  display: grid;
  place-items: center;
  font-weight: 900;
`;
