import styled from 'styled-components';
import { rgba } from 'polished';
import palette from '@lib/colorPalette';
import deleteBtn from '@assets/deleteButton.svg?react'; // 방금 준 SVG 파일명으로 저장

/* 페이지/섹션 */
export const Page = styled.main`
  padding: 12px 16px 32px;
  display: flex;
  flex-direction: column;
  gap: 18px;
`;

export const PageWithHeader = styled.main`
  padding: 68px 16px 32px; /* 헤더 높이(56px) + 여백(12px) */
  display: flex;
  flex-direction: column;
  gap: 18px;
  min-height: 100vh;
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
  border-radius: 12px;
  background-color: ${palette.brandPrimary20};
`;
export const SectionTitle = styled.h2`
  font-size: 14px;
  font-weight: 400;
  color: ${palette.textPrimary};
  margin: 0 5px;
`;
export const EditBtn = styled.button`
  border: 0;
  background: transparent;
  color: ${palette.brandPrimary};
  font-size: 14px;
  font-weight: 400;
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
export const Dot = styled.span<{ $gray?: boolean }>`
  width: 8px;
  height: 8px;
  border-radius: 50%;
  background: ${({ $gray }) => ($gray ? palette.textSecondary : palette.brandPrimary)};
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

/* 새로운 마이페이지 컴포넌트들 */
export const PageTitle = styled.h1`
  font-size: 18px;
  font-weight: 600;
  color: ${palette.textPrimary};
  margin: 0;
  padding: 16px 0;
`;
/* 푸시 알림 토글 */
export const ToggleRow = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-radius: 18px;
  background: ${palette.card};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
`;

export const ToggleLabel = styled.span`
  font-size: 16px;
  font-weight: 500;
  color: ${palette.textPrimary};
`;

export const Switch = styled.button<{ $on: boolean }>`
  position: relative;
  width: 52px;
  height: 28px;
  border-radius: 14px;
  border: 0;
  background: ${({ $on }) => ($on ? palette.brandPrimary : '#e5e5e5')};
  cursor: pointer;
  transition: background-color 0.2s ease;

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  &::after {
    content: '';
    position: absolute;
    top: 2px;
    left: ${({ $on }) => ($on ? '26px' : '2px')};
    width: 24px;
    height: 24px;
    border-radius: 50%;
    background: white;
    transition: left 0.2s ease;
    box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
  }
`;

/* 로그인 안내 카드 */
export const LoginCard = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12px;
  padding: 24px;
  border-radius: 12px;
  background: ${palette.card};
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.06);
`;

export const LoginText = styled.p`
  margin: 0;
  font-size: 14px;
  font-weight: 400;
  color: ${palette.textPrimary};
  text-align: center;
`;

/* 플레이스홀더 컴포넌트들 */
export const PlaceholderCard = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  border-radius: 12px;
  background: ${palette.card};
`;

export const PlaceholderBar = styled.div`
  width: 120px;
  height: 12px;
  border-radius: 6px;
  background: #e5e5e5;
`;

export const PlaceholderToggle = styled.div`
  width: 52px;
  height: 28px;
  border-radius: 14px;
  background: #e5e5e5;
`;

export const PlaceholderStoreCard = styled.div`
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 12px;
  border-radius: 12px;
  background: ${palette.card};
`;

export const PlaceholderImage = styled.div`
  width: 56px;
  height: 56px;
  border-radius: 12px;
  background: #e5e5e5;
`;

export const PlaceholderInfo = styled.div`
  flex: 1;
  display: flex;
  flex-direction: column;
  gap: 8px;
`;

/* 하단 버튼들 */
export const BottomButtons = styled.div`
  display: flex;
  gap: 12px;
  margin-top: 24px;
`;

export const LoginButton = styled.button`
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  background: ${palette.brandPrimary20};
  border: 0;
  color: ${palette.textPrimary};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

export const StartButton = styled.button`
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  background: ${palette.brandPrimary};
  border: 0;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

export const LogoutButton = styled.button`
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  background: ${palette.brandPrimary20};
  border: 0;
  color: ${palette.textPrimary};
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;

export const WithdrawButton = styled.button`
  flex: 1;
  padding: 16px;
  border-radius: 12px;
  background: #ff6b6b;
  border: 0;
  color: white;
  font-size: 16px;
  font-weight: 600;
  cursor: pointer;
`;
