import React, { useState } from 'react';
import styled from 'styled-components';
import palette from '@lib/colorPalette';

const Container = styled.div`
  margin: 0 0 18px;
  background: ${palette.brandPrimary10};
  border-radius: 12px;
  padding: 16px;
  position: relative;
`;

const SectionTitle = styled.h3`
  font-size: 16px;
  font-weight: 600;
  color: #333;
  margin: 20px 0 0 0;
`;

const CollapsedView = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  border-radius: 8px;
  cursor: pointer;
  transition: all 0.2s ease;

  &:hover {
    background: #ddd;
  }
`;

const CollapsedKeyword = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 14px;
  color: #333;
`;

const ExpandButton = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #666;
`;

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

const KeywordNumber = styled.span`
  font-size: 14px;
  font-weight: 700;
  color: ${palette.textPrimary};
  min-width: 16px;
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
  const [isCollapsed, setIsCollapsed] = useState(false);

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
          // 접었을 때: 1위 키워드와 "펼쳐서 보기" 버튼
          <CollapsedView onClick={handleToggleCollapse}>
            <CollapsedKeyword>
              <KeywordNumber>1.</KeywordNumber>
              {keywords[0]}
            </CollapsedKeyword>
            <ExpandButton>
              펼쳐서 보기
              <svg viewBox="0 0 24 24" width="12" height="12" fill="currentColor">
                <path d="M7 10l5 5 5-5H7z" />
              </svg>
            </ExpandButton>
          </CollapsedView>
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
