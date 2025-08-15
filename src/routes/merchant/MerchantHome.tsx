import React, { useState } from 'react';
import Header from '@components/Header';
import EmptyStoreCard from '@components/merchant/EmptyStoreCard';
import * as M from '@styles/merchant/MerchantHomeStyle';

function MerchantHome() {
  const [stores, setStores] = useState([]);

  return (
    <>
      <Header />
      <M.MerchantHome>{stores.length === 0 && <EmptyStoreCard />}</M.MerchantHome>
    </>
  );
}

export default MerchantHome;
