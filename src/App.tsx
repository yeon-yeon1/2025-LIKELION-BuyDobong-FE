import { Routes, Route } from 'react-router-dom';
// 소비자
import CustomerHome from '@routes/customer/CustomerHome';
import KeywordSearch from '@routes/customer/KeywordSearch';
import MarketDetail from '@routes/customer/MarketDetail';
import MarketSearch from '@routes/customer/MarketSearch';
import ProductSearch from '@routes/customer/ProductSearch';
// 상인
import MerchantHome from '@routes/merchant/MerchantHome';
import ProductRegister from '@routes/merchant/ProductRegister';
import SpecialRegister from '@routes/merchant/SpecialRegister';
import StoreRegister from '@routes/merchant/StoreRegister';
// 로그인, 회원가입
import LoginHome from '@routes/LoginHome';
import Login from '@routes/Login';
import Signup from '@routes/Signup';

function App() {
  return (
    <>
      <Routes>
        {/* 어드민 */}
        <Route path="/" element={<LoginHome />} />
        <Route path="/login" element={<Login />} />
        <Route path="/signup" element={<Signup />} />
        {/* 소비자 */}
        <Route path="/customerHome" element={<CustomerHome />} />
        <Route path="/keywordSearch" element={<KeywordSearch />} />
        <Route path="/marketDetail" element={<MarketDetail />} />
        <Route path="/marketSearch" element={<MarketSearch />} />
        <Route path="/productSearch" element={<ProductSearch />} />
        {/* 상인 */}
        <Route path="/merchantHome" element={<MerchantHome />} />
        <Route path="/productRegister" element={<ProductRegister />} />
        <Route path="/specialRegister" element={<SpecialRegister />} />
        <Route path="/storeRegister" element={<StoreRegister />} />
      </Routes>
    </>
  );
}

export default App;
