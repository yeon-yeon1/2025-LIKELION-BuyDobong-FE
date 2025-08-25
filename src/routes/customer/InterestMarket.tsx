// src/pages/customer/InterestMarket.tsx
import React, { useEffect, useState } from 'react';
import Header from '@components/Header';
import { listKeywords, deleteKeyword } from '@lib/api/keywords';
import { listFavoriteStores, unfavoriteStore, type FavStore } from '@lib/api/favorites';
import { listRecentStores, removeRecentStore, type RecentStore } from '@lib/api/recent';
import * as I from '@styles/customer/InterestMarketStyle';
import DeleteBtn from '@assets/deleteButton.svg?react';
import { useNavigate } from 'react-router-dom';

type Store = {
  id: number;
  name: string;
  market: string;
  open: boolean;
  thumb: string;
};

export default function InterestMarket() {
  /* ---------- 상세 상점 이동 ---------- */
  const navigate = useNavigate();

  /* ---------- 관심 키워드 ---------- */
  const [keywords, setKeywords] = useState<string[]>([]);
  const [kwLoading, setKwLoading] = useState(false);
  const [kwSaving, setKwSaving] = useState(false);
  const [kwEditing, setKwEditing] = useState(false);
  const [kwDraft, setKwDraft] = useState<string[]>([]);
  const [kwVisible, setKwVisible] = useState(3);

  useEffect(() => {
    (async () => {
      setKwLoading(true);
      try {
        const list = await listKeywords();
        setKeywords(list.map((k) => k.word));
        setKwVisible(3);
      } finally {
        setKwLoading(false);
      }
    })();
  }, []);

  const toggleKwEdit = async () => {
    if (!kwEditing) {
      setKwDraft(keywords);
      setKwEditing(true);
      return;
    }
    setKwSaving(true);
    try {
      const removed = keywords.filter((w) => !kwDraft.includes(w));
      if (removed.length) {
        await Promise.allSettled(removed.map((w) => deleteKeyword(w)));
      }
      setKeywords(kwDraft);
      setKwVisible((v) => Math.min(3, kwDraft.length));
    } finally {
      setKwSaving(false);
      setKwEditing(false);
    }
  };

  const removeKw = (idx: number) => setKwDraft((list) => list.filter((_, i) => i !== idx));
  const kwList = kwEditing ? kwDraft : keywords.slice(0, kwVisible);
  const showKwMore = !kwEditing && kwVisible < keywords.length;

  /* ---------- 관심 상점 ---------- */
  const [favStores, setFavStores] = useState<Store[]>([]);
  const [favLoading, setFavLoading] = useState(false);
  const [favSaving, setFavSaving] = useState(false);
  const [favEditing, setFavEditing] = useState(false);
  const [favDraft, setFavDraft] = useState<Store[]>([]);
  const [favVisible, setFavVisible] = useState(3);

  const MARKET_KEY_TO_LABEL: Record<string, string> = {
    SINDOBONG: '신도봉시장',
    CHANGDONG: '창동골목시장',
    BANGHAKDONG_DOKKEBI: '방학동도깨비시장',
    SINCHANG: '신창시장',
    SSANGMUN: '쌍문시장',
    BAEGUN: '백운시장',
  };

  const toMarketLabel = (market: string, marketLabel?: string) =>
    marketLabel || MARKET_KEY_TO_LABEL[market] || market; // 라벨 우선, 없으면 코드→라벨, 그래도 없으면 원본

  const mapFavToStore = (s: FavStore): Store => ({
    id: s.id,
    name: s.name,
    market: toMarketLabel(s.market, s.marketLabel),
    open: s.open,
    thumb: s.imageUrl || 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=256&q=80',
  });

  useEffect(() => {
    (async () => {
      setFavLoading(true);
      try {
        const list = await listFavoriteStores();
        const mapped = list.map(mapFavToStore);
        setFavStores(mapped);
        setFavVisible(3);
      } finally {
        setFavLoading(false);
      }
    })();
  }, []);

  const toggleFavEdit = async () => {
    if (!favEditing) {
      setFavDraft(favStores);
      setFavEditing(true);
      return;
    }
    setFavSaving(true);
    try {
      const removedIds = favStores
        .filter((s) => !favDraft.some((d) => d.id === s.id))
        .map((s) => s.id);
      if (removedIds.length) {
        await Promise.allSettled(removedIds.map((id) => unfavoriteStore(id)));
      }
      setFavStores(favDraft);
      setFavVisible((v) => Math.min(3, favDraft.length));
    } finally {
      setFavSaving(false);
      setFavEditing(false);
    }
  };

  const removeFav = (id: number) => setFavDraft((list) => list.filter((s) => s.id !== id));
  const favList = favEditing ? favDraft : favStores.slice(0, favVisible);
  const showFavMore = !favEditing && favVisible < favStores.length;

  /* ---------- 최근 본 상점 (API) ---------- */
  const [recentStores, setRecentStores] = useState<Store[]>([]);
  const [recentLoading, setRecentLoading] = useState(false);
  const [recentSaving, setRecentSaving] = useState(false);
  const [recentEditing, setRecentEditing] = useState(false);
  const [recentDraft, setRecentDraft] = useState<Store[]>([]);
  const [recentVisible, setRecentVisible] = useState(3);

  const mapRecentToStore = (s: RecentStore): Store => ({
    id: s.id,
    name: s.name,
    market: toMarketLabel(s.market, s.marketLabel),
    open: s.open,
    thumb: s.imageUrl || 'https://images.unsplash.com/photo-1506806732259-39c2d0268443?w=256&q=80',
  });

  useEffect(() => {
    (async () => {
      setRecentLoading(true);
      try {
        const list = await listRecentStores(); // GET /api/consumer/recent
        setRecentStores(list.map(mapRecentToStore)); // 화면용 매핑
        setRecentVisible(3);
      } finally {
        setRecentLoading(false);
      }
    })();
  }, []);

  const toggleRecentEdit = async () => {
    if (!recentEditing) {
      setRecentDraft(recentStores);
      setRecentEditing(true);
      return;
    }
    setRecentSaving(true);
    try {
      const removedIds = recentStores
        .filter((s) => !recentDraft.some((d) => d.id === s.id))
        .map((s) => s.id);
      if (removedIds.length) {
        await Promise.allSettled(removedIds.map((id) => removeRecentStore(id))); // DELETE /recent/{id}
      }
      setRecentStores(recentDraft);
      setRecentVisible((v) => Math.min(3, recentDraft.length));
    } finally {
      setRecentSaving(false);
      setRecentEditing(false);
    }
  };

  const removeRecent = (id: number) => setRecentDraft((list) => list.filter((s) => s.id !== id));

  const recentList = recentEditing ? recentDraft : recentStores.slice(0, recentVisible);
  const showRecentMore = !recentEditing && recentVisible < recentStores.length;

  /* ---------- 렌더 ---------- */
  return (
    <>
      <Header />
      <I.Page>
        {/* 관심 키워드 */}
        <I.Section>
          <I.SectionHead>
            <I.SectionTitle>관심 키워드</I.SectionTitle>
            <I.EditBtn type="button" onClick={toggleKwEdit} disabled={kwLoading || kwSaving}>
              {kwEditing ? '완료' : '편집'}
            </I.EditBtn>
          </I.SectionHead>

          {kwLoading ? (
            <I.Empty>불러오는 중…</I.Empty>
          ) : kwList.length === 0 ? (
            <I.Empty>
              <I.EmptyIcon>!</I.EmptyIcon>아직 관심 키워드가 없어요
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

          {!kwLoading && showKwMore && (
            <I.MoreBtn onClick={() => setKwVisible((v) => Math.min(v + 3, keywords.length))}>
              <I.DownIcon>▾</I.DownIcon> 더보기
            </I.MoreBtn>
          )}
        </I.Section>

        {/* 관심 상점 */}
        <I.Section>
          <I.SectionHead>
            <I.SectionTitle>관심 상점</I.SectionTitle>
            <I.EditBtn type="button" onClick={toggleFavEdit} disabled={favLoading || favSaving}>
              {favEditing ? '완료' : '편집'}
            </I.EditBtn>
          </I.SectionHead>

          {favLoading ? (
            <I.Empty>불러오는 중…</I.Empty>
          ) : favList.length === 0 ? (
            <I.Empty>
              <I.EmptyIcon>!</I.EmptyIcon>아직 관심 상점이 없어요
            </I.Empty>
          ) : (
            <I.List>
              {favList.map((s) => (
                <I.Card
                  key={s.id}
                  onClick={() => {
                    if (!favEditing) navigate(`/marketDetail/${s.id}`);
                  }}
                >
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

          {!favLoading && showFavMore && (
            <I.MoreBtn onClick={() => setFavVisible((v) => Math.min(v + 3, favStores.length))}>
              <I.DownIcon>▾</I.DownIcon> 더보기
            </I.MoreBtn>
          )}
        </I.Section>

        {/* 최근 본 상점 */}
        <I.Section>
          <I.SectionHead>
            <I.SectionTitle>최근 본 상점</I.SectionTitle>
            <I.EditBtn
              type="button"
              onClick={toggleRecentEdit}
              disabled={recentLoading || recentSaving}
            >
              {recentEditing ? '완료' : '편집'}
            </I.EditBtn>
          </I.SectionHead>

          {recentLoading ? (
            <I.Empty>불러오는 중…</I.Empty>
          ) : recentList.length === 0 ? (
            <I.Empty>
              <I.EmptyIcon>!</I.EmptyIcon>최근 본 상점이 없어요
            </I.Empty>
          ) : (
            <I.List>
              {recentList.map((s) => (
                <I.Card
                  key={`r-${s.id}`}
                  onClick={() => {
                    if (!recentEditing) navigate(`/marketDetail/${s.id}`);
                  }}
                >
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

                  {recentEditing ? (
                    <I.RemoveBtn
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation();
                        removeRecent(s.id);
                      }}
                      aria-label="최근 본 상점 삭제"
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

          {!recentLoading && showRecentMore && (
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
