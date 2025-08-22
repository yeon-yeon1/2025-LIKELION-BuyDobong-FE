import React, { useState } from 'react';
import Header from '@components/Header';
import * as I from '@styles/customer/InterestMarketStyle';
import DeleteBtn from '@assets/deleteButton.svg?react'; // ← 방금 준 SVG 파일명으로 저장

type Store = {
  id: number;
  name: string;
  market: string;
  open: boolean;
  thumb: string;
};

// ── mock (API 붙이면 교체)
const INIT_KEYWORDS = ['사과', '사과', '사과', '바나나', '귤', '포도', '배', '딸기'];
const INIT_STORES: Store[] = [
  {
    id: 1,
    name: '은지네 과일 가게',
    market: '신도봉시장',
    open: true,
    thumb: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=256&q=80',
  },
  {
    id: 2,
    name: '은지네 과일 가게',
    market: '신도봉시장',
    open: true,
    thumb: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=256&q=80',
  },
  {
    id: 3,
    name: '은지네 과일 가게',
    market: '신도봉시장',
    open: true,
    thumb: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=256&q=80',
  },
  {
    id: 4,
    name: '은지네 과일 가게',
    market: '신도봉시장',
    open: true,
    thumb: 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=256&q=80',
  },
];

export default function InterestMarket() {
  // 본 데이터
  const [keywords, setKeywords] = useState<string[]>(INIT_KEYWORDS);
  const [favStores, setFavStores] = useState<Store[]>(INIT_STORES);
  const [recentStores] = useState<Store[]>(INIT_STORES);

  // “더보기” 표기용
  const [kwVisible, setKwVisible] = useState(3);
  const [favVisible, setFavVisible] = useState(3);
  const [recentVisible, setRecentVisible] = useState(3);

  // 편집 상태 + 드래프트
  const [kwEditing, setKwEditing] = useState(false);
  const [kwDraft, setKwDraft] = useState<string[]>([]);
  const [favEditing, setFavEditing] = useState(false);
  const [favDraft, setFavDraft] = useState<Store[]>([]);

  // 편집 토글
  const toggleKwEdit = () => {
    if (!kwEditing) {
      setKwDraft(keywords);
      setKwEditing(true);
    } else {
      setKeywords(kwDraft);
      setKwEditing(false);
    } // 완료(저장)
  };
  const toggleFavEdit = () => {
    if (!favEditing) {
      setFavDraft(favStores);
      setFavEditing(true);
    } else {
      setFavStores(favDraft);
      setFavEditing(false);
    } // 완료(저장)
  };

  // 삭제 핸들러(편집 중)
  const removeKw = (idx: number) => setKwDraft((list) => list.filter((_, i) => i !== idx));

  const removeFav = (id: number) => setFavDraft((list) => list.filter((s) => s.id !== id));

  // 표시 목록 계산 (편집 중에는 전부 노출, 아니면 more 수 만큼)
  const kwList = kwEditing ? kwDraft : keywords.slice(0, kwVisible);
  const favList = favEditing ? favDraft : favStores.slice(0, favVisible);
  const recentList = recentStores.slice(0, recentVisible);

  const showKwMore = !kwEditing && kwVisible < keywords.length;
  const showFavMore = !favEditing && favVisible < favStores.length;
  const showRecentMore = recentVisible < recentStores.length;

  return (
    <>
      <Header />
      <I.Page>
        {/* 관심 키워드 */}
        <I.Section>
          <I.SectionHead>
            <I.SectionTitle>관심 키워드</I.SectionTitle>
            <I.EditBtn type="button" onClick={toggleKwEdit}>
              {kwEditing ? '완료' : '편집'}
            </I.EditBtn>
          </I.SectionHead>

          {kwList.length === 0 ? (
            <I.Empty>
              <I.EmptyIcon>!</I.EmptyIcon>
              아직 관심 키워드가 없어요
            </I.Empty>
          ) : (
            <I.KeywordList>
              {kwList.map((k, i) => (
                <I.KeywordRow key={`${k}-${i}`}>
                  <span>{k}</span>
                  {kwEditing ? (
                    <I.RemoveBtn
                      $size="sm"
                      type="button"
                      onClick={() => removeKw(i)}
                      aria-label="키워드 삭제"
                    >
                      <DeleteBtn width={16} height={16} />
                    </I.RemoveBtn>
                  ) : (
                    <I.SearchIcon aria-hidden viewBox="0 0 24 24">
                      <circle
                        cx="11"
                        cy="11"
                        r="7"
                        stroke="currentColor"
                        strokeWidth="2"
                        fill="none"
                      />
                      <line
                        x1="21"
                        y1="21"
                        x2="16.65"
                        y2="16.65"
                        stroke="currentColor"
                        strokeWidth="2"
                      />
                    </I.SearchIcon>
                  )}
                </I.KeywordRow>
              ))}
            </I.KeywordList>
          )}

          {showKwMore && (
            <I.MoreBtn onClick={() => setKwVisible((v) => Math.min(v + 3, keywords.length))}>
              <I.DownIcon>▾</I.DownIcon> 더보기
            </I.MoreBtn>
          )}
        </I.Section>

        {/* 관심 상점 */}
        <I.Section>
          <I.SectionHead>
            <I.SectionTitle>관심 상점</I.SectionTitle>
            <I.EditBtn type="button" onClick={toggleFavEdit}>
              {favEditing ? '완료' : '편집'}
            </I.EditBtn>
          </I.SectionHead>

          {favList.length === 0 ? (
            <I.Empty>
              <I.EmptyIcon>!</I.EmptyIcon>
              아직 관심 상점이 없어요
            </I.Empty>
          ) : (
            <I.List>
              {favList.map((s) => (
                <I.Card key={s.id} onClick={() => !favEditing && console.log('go store', s.id)}>
                  <I.Thumb src={s.thumb} alt="" />
                  <I.Info>
                    <I.Title>{s.name}</I.Title>
                    <I.MetaRow>
                      <I.Chip>{s.market}</I.Chip>
                      {s.open && (
                        <I.Chip $green>
                          <I.Dot /> 영업중
                        </I.Chip>
                      )}
                    </I.MetaRow>
                  </I.Info>

                  {favEditing ? (
                    <I.RemoveBtn
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeFav(s.id);
                      }}
                      aria-label="상점 삭제"
                    >
                      <DeleteBtn width={16} height={16} />
                    </I.RemoveBtn>
                  ) : (
                    <I.Chevron aria-hidden>›</I.Chevron>
                  )}
                </I.Card>
              ))}
            </I.List>
          )}

          {showFavMore && (
            <I.MoreBtn onClick={() => setFavVisible((v) => Math.min(v + 3, favStores.length))}>
              <I.DownIcon>▾</I.DownIcon> 더보기
            </I.MoreBtn>
          )}
        </I.Section>

        {/* 최근 본 상점 (편집 없음, 비었을 때는 그냥 리스트만 안 뜸) */}
        <I.Section>
          <I.SectionHead>
            <I.SectionTitle>최근 본 상점</I.SectionTitle>
            <span /> {/* 우측 여백 맞춤 */}
          </I.SectionHead>

          <I.List>
            {recentList.map((s) => (
              <I.Card key={`r-${s.id}`} onClick={() => console.log('go store', s.id)}>
                <I.Thumb src={s.thumb} alt="" />
                <I.Info>
                  <I.Title>{s.name}</I.Title>
                  <I.MetaRow>
                    <I.Chip>{s.market}</I.Chip>
                    {s.open && (
                      <I.Chip $green>
                        <I.Dot /> 영업중
                      </I.Chip>
                    )}
                  </I.MetaRow>
                </I.Info>
                <I.Chevron aria-hidden>›</I.Chevron>
              </I.Card>
            ))}
          </I.List>

          {showRecentMore && (
            <I.MoreBtn
              onClick={() => setRecentVisible((v) => Math.min(v + 3, recentStores.length))}
            >
              <I.DownIcon>▾</I.DownIcon> 더보기
            </I.MoreBtn>
          )}
        </I.Section>
      </I.Page>
    </>
  );
}
