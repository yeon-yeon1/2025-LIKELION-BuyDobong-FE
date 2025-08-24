import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Header from '@components/Header';
import * as C from '@styles/customer/CustomerHomeStyle';
import SearchIcon from '@assets/SearchIcon.svg?react';

const ChevronRight = (props: React.SVGProps<SVGSVGElement>) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth={2} {...props}>
    <path d="M9 6l6 6-6 6" />
  </svg>
);

function CustomerHome() {
  const [q, setQ] = useState(''); //검색어 입력 상태 관리
  const [notify, setNotify] = useState(true);
  const navigate = useNavigate();

  const onSearch = (e: React.FormEvent) => {
    e.preventDefault();
    const keyword = q.trim();
    if (!keyword) return;
    navigate({ pathname: '/keywordSearch', search: `?query=${encodeURIComponent(keyword)}` });
  };

  const onInterest = (e: React.FormEvent) => {
    e.preventDefault();
    navigate({ pathname: '/interestMarket' });
  };

  return (
    <>
      <Header />
      <C.Page>
        {/* 검색창 */}
        <C.SearchForm onSubmit={onSearch}>
          <C.SearchInput
            placeholder="지금 이런 걸 팔고 있어요"
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
          <C.IconButton type="submit" aria-label="검색">
            <SearchIcon width={22} height={22} />
          </C.IconButton>
        </C.SearchForm>

        {/* 관심 키워드·상점 확인하기 */}
        <C.ActionCard type="button" onClick={onInterest}>
          <C.CardText>관심 키워드·상점 확인하기</C.CardText>
          <ChevronRight width={20} height={20} />
        </C.ActionCard>

        {/* 특가 알림 토글 */}
        <C.ToggleRow>
          <C.ToggleLabel>특가가 뜨면 알려드릴게요</C.ToggleLabel>
          <C.Switch
            type="button"
            aria-pressed={notify}
            $on={notify}
            onClick={() => setNotify((v) => !v)}
          />
        </C.ToggleRow>
      </C.Page>
    </>
  );
}

export default CustomerHome;
