import React from 'react';
import Header from '@components/Header';
import * as M from '@styles/merchant/MerchantHomeStyle';

function MerchantHome() {
  return (
    <>
      <Header />
      <M.MerchantHome>상인 홈 페이지</M.MerchantHome>
    </>
  );
}

export default MerchantHome;
