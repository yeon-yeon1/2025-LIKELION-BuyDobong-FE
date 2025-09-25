import React from 'react';
import styled from 'styled-components';
import palette from '@lib/colorPalette';
import RandomBtn from '@assets/RandomBtn.svg?react';
import DefaultStoreImage from '@assets/StoreImage.svg?react';
const Container = styled.div`
  margin: 18px 0;
`;

const SectionHeader = styled.div`
  display: flex;
  align-items: center;
  margin-bottom: 12px;
`;

const SectionTitle = styled.h3`
  font-size: 18px;
  font-weight: 600;
  color: ${palette.textPrimary};
  margin: 0;
`;

const RefreshButton = styled.button`
  background: none;
  border: none;
  color: ${palette.textSecondary};
  cursor: pointer;
  display: flex;
  align-items: center;
  transition: all 0.2s ease;

  &:active {
    transform: scale(0.95);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const StoresContainer = styled.div`
  display: flex;
  gap: 16px;
  overflow-x: auto;
  padding: 4px 0;

  &::-webkit-scrollbar {
    display: none;
  }
  -ms-overflow-style: none;
  scrollbar-width: none;
`;

const StoreWrapper = styled.div`
  flex-shrink: 0;
  width: 125px;
  display: flex;
  flex-direction: column;
  gap: 3px;
  transition: all 0.2s ease;
  &:hover {
    transform: translateY(-2px);
  }

  &:active {
    transform: translateY(0);
  }
`;

const ImageCard = styled.div`
  width: 125px;
  aspect-ratio: 1;
  border: 1px solid var(--card, #fff);
  border-radius: 12px;
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.08);
  overflow: hidden;
  cursor: pointer;
`;

const StoreImage = styled.img`
  width: 100%;
  height: 100%;
  object-fit: cover;
  background: ${palette.brandPrimary10};
`;

const InfoCardWrapper = styled.div`
  position: relative;
`;

const InfoCard = styled.div`
  border-radius: 12px;
  padding: 12px 0;
  cursor: pointer;
  transition: all 0.2s ease;
`;

const StoreName = styled.div`
  font-size: 16px;
  font-weight: 700;
  color: ${palette.textPrimary};
  margin-bottom: 8px;
  display: flex;
  align-items: center;
`;

const StoreMeta = styled.div`
  display: flex;
  align-items: center;
  gap: 3px;
`;

const MarketName = styled.span`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${palette.card};
  color: ${palette.textPrimary};
  font-weight: 400;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  display: inline-block;
  max-width: 80px;
`;

const StatusChip = styled.span<{ $open: boolean }>`
  font-size: 12px;
  padding: 4px 8px;
  border-radius: 12px;
  background: ${(props) => (props.$open ? palette.brandPrimary20 : '#f5f5f5')};
  color: ${(props) => (props.$open ? palette.brandPrimary : palette.textSecondary)};
  display: flex;
  align-items: center;
  gap: 3px;
  font-weight: 500;
  white-space: nowrap;
`;

const StatusDot = styled.span<{ $open: boolean }>`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: ${(props) => (props.$open ? palette.brandPrimary : '#ccc')};
`;

const RightArrow = styled.svg`
  width: 16px;
  height: 16px;
  color: ${palette.textSecondary};
`;

export interface NearbyStore {
  id: number;
  name: string;
  market: string;
  imageUrl: string;
  open: boolean;
}

interface NearbyStoresProps {
  stores: NearbyStore[];
  onStoreClick: (store: NearbyStore) => void;
  onRefresh?: () => void;
  loading?: boolean;
}

const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 20px;
  color: ${palette.textSecondary};
  font-size: 14px;
`;

export default function NearbyStores({
  stores,
  onStoreClick,
  onRefresh,
  loading = false,
}: NearbyStoresProps) {
  return (
    <Container>
      <SectionHeader>
        <SectionTitle>우리 동네 상점 둘러보기</SectionTitle>
        {onRefresh && (
          <RefreshButton onClick={onRefresh} aria-label="새로고침" disabled={loading}>
            <RandomBtn />
          </RefreshButton>
        )}
      </SectionHeader>
      <StoresContainer>
        {loading ? (
          <LoadingContainer>불러오는 중...</LoadingContainer>
        ) : (
          stores.map((store) => (
            <StoreWrapper key={store.id}>
              <ImageCard onClick={() => onStoreClick(store)}>
                {store.imageUrl && store.imageUrl.trim() !== '' ? (
                  <StoreImage src={store.imageUrl} alt={store.name} loading="lazy" />
                ) : (
                  <DefaultStoreImage style={{ width: '100%', height: '100%' }} />
                )}
              </ImageCard>
              <InfoCardWrapper>
                <InfoCard onClick={() => onStoreClick(store)}>
                  <StoreName>
                    {store.name}
                    <RightArrow viewBox="0 0 24 24" fill="currentColor">
                      <path d="M8.59 16.59L13.17 12L8.59 7.41L10 6l6 6-6 6-1.41-1.41z" />
                    </RightArrow>
                  </StoreName>
                  <StoreMeta>
                    <MarketName>{store.market}</MarketName>
                    <StatusChip $open={store.open}>
                      <StatusDot $open={store.open} />
                      {store.open ? '영업중' : '영업 종료'}
                    </StatusChip>
                  </StoreMeta>
                </InfoCard>
              </InfoCardWrapper>
            </StoreWrapper>
          ))
        )}
      </StoresContainer>
    </Container>
  );
}
