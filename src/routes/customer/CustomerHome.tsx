import React from 'react';
import Header from '@components/Header';
import * as C from '@styles/customer/CustomerHomeStyle';

function CustomerHome() {
  return (
    <>
      <Header />
      <C.CustomerHome>소비자 홈 페이지</C.CustomerHome>
    </>
  );
}

export default CustomerHome;
