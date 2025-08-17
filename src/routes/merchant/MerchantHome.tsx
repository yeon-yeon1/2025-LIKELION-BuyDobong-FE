import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@components/Header';
import EmptyStoreCard from '@components/merchant/EmptyStoreCard';
import MarketCard from '@components/merchant/MarketCard';
import * as M from '@styles/merchant/MerchantHomeStyle';

import BusinessStatusToggle, {
  type BusinessStatus,
} from '@components/merchant/BusinessStatusToggle';

// Type for a stored store object
type StoredStore = {
  name: string;
  market: string;
  imageUrl?: string | null;
};

// Helper to map market code to display name
const marketDisplayName = (market: string) => {
  switch (market) {
    case 'SINDOBONG':
      return '신도봉시장';
    case 'BANGHAKDONG':
      return '방학동도깨비시장';
    case 'SINCHANG':
      return '신창시장';
    case 'CHANDONG':
      return '창동골목시장';
    case 'SSANGMUN':
      return '쌍문시장';
    case 'BAEGUN':
      return '백운시장';
    default:
      return market;
  }
};

function MerchantHome() {
  const [stores, setStores] = useState<StoredStore[]>([]);
  const [status, setStatus] = useState<BusinessStatus>(() => {
    const saved = localStorage.getItem('merchantHome:status');
    return saved === 'open' || saved === 'closed' ? (saved as BusinessStatus) : 'open';
  });
  const navigate = useNavigate();

  useEffect(() => {
    const lastBody = localStorage.getItem('storeRegister:lastBody');
    if (lastBody) {
      try {
        const parsed = JSON.parse(lastBody);
        if (parsed && typeof parsed === 'object' && parsed.name && parsed.market) {
          setStores([{ name: parsed.name, market: parsed.market, imageUrl: parsed.imageUrl }]);
        }
      } catch (e) {
        // Ignore parse errors
      }
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('merchantHome:status', status);
  }, [status]);

  return (
    <>
      <Header />
      <M.MerchantHome>
        {stores.length === 0 ? (
          <EmptyStoreCard />
        ) : (
          <>
            <BusinessStatusToggle
              value={status}
              onChange={(next) => setStatus(next)}
              labels={{ open: '영업중', closed: '영업종료' }}
            />
            <M.Space />
            <M.MarketCardWrapper
              onClick={() => navigate('/storeRegister', { state: { ...stores[0], status } })}
              style={{ cursor: 'pointer' }}
            >
              <MarketCard
                name={stores[0].name}
                marketName={marketDisplayName(stores[0].market)}
                status={status}
                imageUrl={stores[0].imageUrl}
                showArrow={true}
              />
            </M.MarketCardWrapper>
            <M.SmallSpace />
          </>
        )}
      </M.MerchantHome>
    </>
  );
}

export default MerchantHome;
