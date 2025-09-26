import React, { useState, useEffect } from 'react';
import styled, { keyframes } from 'styled-components';
import palette from '@lib/colorPalette';

const Container = styled.div`
  margin: 0 0 18px;
  background: ${palette.brandPrimary10};
  border-radius: 12px;
  padding: 10px 20px;
  position: relative;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 20px 0 0 0;
`;

// 뉴스티커 컨테이너 - overflow hidden으로 보이는 영역 제한
const TickerContainer = styled.div`
  height: 24px;
  overflow: hidden;
  position: relative;

  border-radius: 8px;
`;

// 자연스러운 위로 슬라이드 애니메이션 (다음 키워드가 아래에서 위로)
const slideUpAnimation = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-24px);
    opacity: 1;
  }
`;

// 자연스러운 아래로 슬라이드 애니메이션 (현재 키워드가 사라질 때)
const slideDownAnimation = keyframes`
  0% {
    transform: translateY(0);
    opacity: 1;
  }
  100% {
    transform: translateY(-100%);
    opacity: 0;
  }
`;

// 뉴스티커 래퍼
const TickerWrapper = styled.div`
  position: relative;
  height: 24px;
  overflow: hidden;
`;

// 현재 키워드
const CurrentKeyword = styled.div<{ $isSliding: boolean }>`
  position: absolute;
  top: 0;
  left: 0;
  right: 0;
  height: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  padding: 0 8px;
  transition: color 0.2s ease;
  white-space: nowrap;
  animation: ${(props) => (props.$isSliding ? slideDownAnimation : 'none')} 0.3s ease-in-out;

  &:hover {
    color: ${palette.brandPrimary};
  }
`;

// 다음 키워드 (아래에서 올라올 준비)
const NextKeyword = styled.div<{ $isSliding: boolean }>`
  position: absolute;
  top: 24px;
  left: 0;
  right: 0;
  height: 24px;
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
  cursor: pointer;
  padding: 0 8px;
  transition: color 0.2s ease;
  white-space: nowrap;
  animation: ${(props) => (props.$isSliding ? slideUpAnimation : 'none')} 0.3s ease-in-out;

  &:hover {
    color: ${palette.brandPrimary};
  }
`;

const KeywordNumber = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${palette.textPrimary};
  min-width: 16px;
`;

// 펼쳐서 보기 버튼
const ExpandButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: #333;
  }
`;

// 펼쳐진 상태의 키워드 그리드
const KeywordsContainer = styled.div<{ $collapsed: boolean }>`
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 8px;
  max-height: ${(props) => (props.$collapsed ? '0' : '300px')};
  overflow: hidden;
  transition: max-height 0.3s ease, opacity 0.3s ease;
  margin-top: ${(props) => (props.$collapsed ? '0' : '12px')};
  opacity: ${(props) => (props.$collapsed ? '0' : '1')};
`;

const KeywordItem = styled.div`
  font-size: 14px;
  color: #333;
  padding: 4px 0;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 8px;

  &:hover {
    color: ${palette.brandPrimary};
  }
`;

const CollapseButton = styled.button`
  position: absolute;
  top: 16px;
  right: 16px;
  background: none;
  border: none;
  color: #666;
  font-size: 12px;
  cursor: pointer;
  display: flex;
  align-items: center;
  gap: 4px;
  transition: color 0.2s ease;

  &:hover {
    color: #333;
  }
`;

interface PopularKeywordsProps {
  keywords: string[];
  onKeywordClick: (keyword: string) => void;
  onCollapse?: () => void;
}

export default function PopularKeywords({
  keywords,
  onKeywordClick,
  onCollapse,
}: PopularKeywordsProps) {
  const [isCollapsed, setIsCollapsed] = useState(true);
  const [currentIndex, setCurrentIndex] = useState(0);
  const [isSliding, setIsSliding] = useState(false);

  // 자연스러운 뉴스티커 로직
  useEffect(() => {
    if (isCollapsed && keywords.length > 1) {
      const interval = setInterval(() => {
        // 슬라이딩 애니메이션 시작
        setIsSliding(true);

        // 애니메이션 완료 후 다음 키워드로 변경
        setTimeout(() => {
          setCurrentIndex((prevIndex) => (prevIndex + 1) % Math.min(keywords.length, 10));
          setIsSliding(false);
        }, 300); // 0.3초 애니메이션 시간
      }, 3000); // 3초마다 전환

      return () => clearInterval(interval);
    }
  }, [isCollapsed, keywords.length]);

  const handleToggleCollapse = () => {
    setIsCollapsed(!isCollapsed);
    if (onCollapse) {
      onCollapse();
    }
  };

  return (
    <>
      <SectionTitle>인기 상품 키워드</SectionTitle>
      <Container>
        {isCollapsed && (
          <>
            {/* 뉴스티커 영역 */}
            <TickerContainer onClick={handleToggleCollapse}>
              {keywords.length > 0 ? (
                <TickerWrapper>
                  {/* 현재 키워드 */}
                  <CurrentKeyword
                    $isSliding={isSliding}
                    onClick={(e) => {
                      e.stopPropagation();
                      onKeywordClick(keywords[currentIndex]);
                    }}
                  >
                    <KeywordNumber>{currentIndex + 1}.</KeywordNumber>
                    {keywords[currentIndex] || keywords[0] || '키워드 없음'}
                  </CurrentKeyword>

                  {/* 다음 키워드 (아래에서 올라올 준비) */}
                  <NextKeyword
                    $isSliding={isSliding}
                    onClick={(e) => {
                      e.stopPropagation();
                      const nextIndex = (currentIndex + 1) % Math.min(keywords.length, 10);
                      onKeywordClick(keywords[nextIndex]);
                    }}
                  >
                    <KeywordNumber>
                      {((currentIndex + 1) % Math.min(keywords.length, 10)) + 1}.
                    </KeywordNumber>
                    {keywords[(currentIndex + 1) % Math.min(keywords.length, 10)] ||
                      keywords[0] ||
                      '키워드 없음'}
                  </NextKeyword>
                </TickerWrapper>
              ) : (
                <CurrentKeyword $isSliding={false}>
                  <KeywordNumber>1.</KeywordNumber>
                  키워드 로딩 중...
                </CurrentKeyword>
              )}
            </TickerContainer>

            {/* 펼쳐서 보기 버튼 */}
            <ExpandButton onClick={handleToggleCollapse}>
              펼쳐서 보기
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </ExpandButton>
          </>
        )}

        {!isCollapsed && (
          <>
            <CollapseButton onClick={handleToggleCollapse}>
              접기
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M7 14l5-5 5 5H7z" />
              </svg>
            </CollapseButton>
          </>
        )}

        <KeywordsContainer $collapsed={isCollapsed}>
          {/* 왼쪽 열: 1-5위 */}
          {keywords.slice(0, 5).map((keyword, index) => (
            <KeywordItem key={index} onClick={() => onKeywordClick(keyword)}>
              <KeywordNumber>{index + 1}</KeywordNumber>
              {keyword}
            </KeywordItem>
          ))}
          {/* 오른쪽 열: 6-10위 */}
          {keywords.slice(5, 10).map((keyword, index) => (
            <KeywordItem key={index + 5} onClick={() => onKeywordClick(keyword)}>
              <KeywordNumber>{index + 6}</KeywordNumber>
              {keyword}
            </KeywordItem>
          ))}
        </KeywordsContainer>
      </Container>
    </>
  );
}
