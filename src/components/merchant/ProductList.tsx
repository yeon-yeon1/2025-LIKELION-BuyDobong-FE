import React, { Fragment, useState, useEffect } from 'react';
import type { InputMode } from '@components/merchant/InputModeToggle';
import * as S from '@styles/merchant/component/ProductListStyle';
import NoProductIcon from '@assets/NoProduct.svg?react';
import ThreeDotIcon from '@assets/ThreeDot.svg?react';
import GreenLessIcon from '@assets/GreenLess.svg?react';
import RedNoneIcon from '@assets/RedNone.svg?react';
import ViewIcon from '@assets/View.svg?react';
import HideIcon from '@assets/Hide.svg?react';
import RemoveIcon from '@assets/Remove.svg?react';
import Tag from '@assets/Tag.svg?react';
import api from '@lib/api';

const HIDDEN_IDS_KEY = 'product:hiddenIds';

// 서버에 특가 종료 요청
const endDealOnServer = async (pid: string) => {
  try {
    console.log('[ProductList] end deal -> PATCH /api/product/:id/deal/end', pid);
    const res = await api.patch(`/api/product/${pid}/deal/end`, {}, { validateStatus: () => true });
    console.log('[ProductList] end deal result', res.status, res.data);
    if (!(res.status >= 200 && res.status < 300)) {
      const msg = (res.data && (res.data.message || res.data.error)) || '특가 종료에 실패했습니다.';
      alert(msg);
      return false;
    }
    return true;
  } catch (e) {
    console.error('[ProductList] end deal error', e);
    alert('특가 종료 중 오류가 발생했습니다.');
    return false;
  }
};

export type StockState = '충분함' | '적음' | '없음';

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: StockState;
  hidden?: boolean;
  viewed?: boolean;
  isSpecial?: boolean;
  dealStartAt?: string;
  dealEndAt?: string;
  dealPrice?: number;
  dealUnit?: string;
  displayPrice?: number;
  displayUnit?: string;
}

export interface ProductListProps {
  title?: string;
  items?: ProductItem[];
  onAdd?: () => void;
  onMenuClick?: (id: string) => void;
  onRowClick?: (id: string) => void;
  showAddButton?: boolean;
  expandedId?: string | null;
  onSpecial?: (id: string, mode?: InputMode) => void;
  onSpecialEnd?: (id: string) => void;
  onEdit?: (id: string, mode?: InputMode) => void;
  onView?: (id: string) => void;
  onDelete?: (id: string) => void;
  forwardMode?: InputMode;
  specialsById?: Record<string, { startTime: string; endTime: string }>;
}

const formatPrice = (price: number) => `${price.toLocaleString()}원`;

export default function ProductList({
  title,
  items = [],
  onRowClick = () => {},
  expandedId = null,
  onSpecial = () => {},
  onSpecialEnd,
  onEdit = () => {},
  onView = () => {},
  onDelete = () => {},
  forwardMode,
  specialsById,
}: ProductListProps) {
  const [hiddenIds, setHiddenIds] = useState<Set<string>>(new Set());
  const [deleteTarget, setDeleteTarget] = useState<ProductItem | null>(null);
  const [endedSpecialIds, setEndedSpecialIds] = useState<Set<string>>(new Set());
  const [deleting, setDeleting] = useState(false);
  const [removedIds, setRemovedIds] = useState<Set<string>>(new Set());
  const [editedById, setEditedById] = useState<Record<string, Partial<ProductItem>>>({});
  // 강제 접힘 상태 (parent expandedId 갱신 전에도 즉시 접히게)
  const [forceCollapsed, setForceCollapsed] = useState<Set<string>>(new Set());

  // tick for time-based special end check (every 30s)
  const [, setNowTick] = useState<number>(Date.now());
  useEffect(() => {
    const t = setInterval(() => setNowTick(Date.now()), 30_000);
    return () => clearInterval(t);
  }, []);

  // ISO → HH:MM
  const fmtHM = (iso?: string) => {
    if (!iso) return '';
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  };

  useEffect(() => {
    // 1) load previously hidden ids from storage
    let initial = new Set<string>();
    try {
      const raw = localStorage.getItem(HIDDEN_IDS_KEY);
      if (raw) {
        const arr: string[] = JSON.parse(raw);
        if (Array.isArray(arr)) initial = new Set(arr);
      }
    } catch {}
    // 2) also respect incoming items that have hidden: true
    for (const i of items ?? []) {
      if (i.hidden) initial.add(i.id);
    }
    setHiddenIds(initial);
  }, [items]);

  useEffect(() => {
    try {
      localStorage.setItem(HIDDEN_IDS_KEY, JSON.stringify([...hiddenIds]));
    } catch {}
  }, [hiddenIds]);

  useEffect(() => {
    const onUpdated = (ev: Event) => {
      const e = ev as CustomEvent<Partial<ProductItem> & { id: string }>;
      const detail = e.detail;
      if (!detail || !detail.id) return;
      console.log('[ProductList] product:updated received', detail);
      setEditedById((prev) => ({
        ...prev,
        [detail.id]: { ...prev[detail.id], ...detail },
      }));
    };
    window.addEventListener('product:updated', onUpdated as EventListener);
    return () => {
      window.removeEventListener('product:updated', onUpdated as EventListener);
    };
  }, []);

  const updateProductHiddenInStorage = (id: string, nextHidden: boolean) => {
    try {
      const raw = localStorage.getItem('product:list');
      if (!raw) return;
      const list = JSON.parse(raw);
      if (!Array.isArray(list)) return;
      const updated = list.map((p: any) => (p && p.id === id ? { ...p, hidden: nextHidden } : p));
      localStorage.setItem('product:list', JSON.stringify(updated));
    } catch {}
  };

  const loadHiddenOrder = (): string[] => {
    try {
      const rawOrder = localStorage.getItem(HIDDEN_IDS_KEY + ':order');
      if (!rawOrder) return [];
      const arr = JSON.parse(rawOrder);
      return Array.isArray(arr) ? arr : [];
    } catch {
      return [];
    }
  };

  const saveHiddenOrder = (order: string[]) => {
    try {
      localStorage.setItem(HIDDEN_IDS_KEY + ':order', JSON.stringify(order));
    } catch {}
  };

  // helper: find product name by id (for storage cleanup)
  const findNameById = (pid: string) => {
    const f = (items ?? []).find((x) => x.id === pid);
    return f ? f.name : '';
  };

  // helper: unify "특가 종료" 처리 (서버 성공 시에만 로컬/UI 반영)
  const endSpecialFor = async (
    pid: string,
    pname: string,
    opts?: { silent?: boolean }
  ): Promise<boolean> => {
    const silent = !!opts?.silent;
    try {
      console.log('[ProductList] end deal -> PATCH /api/product/:id/deal/end', pid);
      const res = await api.patch(
        `/api/product/${pid}/deal/end`,
        {},
        { validateStatus: () => true }
      );
      console.log('[ProductList] end deal result', res.status, res.data);
      const ok = res.status >= 200 && res.status < 300;
      if (!ok) {
        if (!silent) {
          const msg =
            (res.data && (res.data.message || res.data.error)) || '특가 종료에 실패했습니다.';
          alert(msg);
        }
        return false;
      }

      // 부모 콜백 통지 (성공 시에만)
      if (onSpecialEnd) onSpecialEnd(pid);

      // 로컬 표시/스토리지 정리 (즉시 UI 반영)
      setEndedSpecialIds((prev) => new Set(prev).add(pid));
      setEditedById((prev) => ({
        ...prev,
        [pid]: {
          ...(prev[pid] || {}),
          isSpecial: false,
          dealPrice: undefined,
          dealStartAt: undefined,
          dealEndAt: undefined,
        },
      }));
      try {
        const raw = localStorage.getItem('product:specials');
        if (raw) {
          const arr = JSON.parse(raw);
          if (Array.isArray(arr)) {
            const filtered = arr.filter((s) => !(s && s.name === pname));
            localStorage.setItem('product:specials', JSON.stringify(filtered));
          }
        }
        const curRaw = localStorage.getItem('merchantHome:specialCurrent');
        if (curRaw) {
          const cur = JSON.parse(curRaw);
          if (cur && cur.name === pname) {
            localStorage.removeItem('merchantHome:specialCurrent');
          }
        }
      } catch (e) {
        console.warn('[ProductList] endSpecialFor cleanup failed', e);
      }

      // 전역 이벤트 브로드캐스트
      try {
        window.dispatchEvent(new Event('special:ended'));
        window.dispatchEvent(
          new CustomEvent('product:updated', {
            detail: {
              id: pid,
              isSpecial: false,
              dealPrice: 0,
              dealStartAt: undefined,
              dealEndAt: undefined,
            },
          })
        );
      } catch {}

      return true;
    } catch (e) {
      if (!silent) {
        console.error('[ProductList] end deal error', e);
        alert('특가 종료 중 오류가 발생했습니다.');
      }
      return false;
    }
  };

  const toggleHidden = async (
    id: string,
    nextHidden: boolean,
    wasExpanded: boolean,
    skipAutoEnd?: boolean
  ) => {
    // ---- 0) optimistic UI 업데이트 ----
    const rollback = () => {
      setHiddenIds((prev) => {
        const next = new Set(prev);
        if (nextHidden) next.delete(id);
        else next.add(id);
        return next;
      });
      updateProductHiddenInStorage(id, !nextHidden);
      // hidden order 롤백
      let order = loadHiddenOrder();
      if (nextHidden) {
        // 우리가 추가했었으면 제거
        order = order.filter((x) => x !== id);
      } else {
        // 우리가 제거했었으면 복구(맨 뒤)
        order.push(id);
      }
      saveHiddenOrder(order);
    };

    // 1) UI state toggle (optimistic)
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (nextHidden) next.add(id);
      else next.delete(id);
      return next;
    });

    // 2) persist hidden flag into product:list
    updateProductHiddenInStorage(id, nextHidden);

    // 3) manage hidden order (optimistic)
    let order = loadHiddenOrder();
    if (nextHidden) {
      order.push(id);
    } else {
      order = order.filter((x) => x !== id);
    }
    saveHiddenOrder(order);

    // 3.5) 특가 진행 중인 상품을 숨기면 자동으로 특가 종료 (UI 동작은 기존 유지)
    if (nextHidden && !skipAutoEnd) {
      // 서버/매핑 양쪽 모두 확인
      const srvSpecial = (items?.find((x) => x.id === id)?.dealPrice ?? 0) > 0;
      const mapSpecial = !!specialsById?.[id] && !endedSpecialIds.has(id);
      const wasSpecial = srvSpecial || mapSpecial;
      if (wasSpecial) {
        const pname = findNameById(id);
        void endSpecialFor(id, pname);
      }
    }

    // 4) collapse if it was expanded
    if (wasExpanded) onRowClick(id);

    // 5) 서버 동기화
    try {
      console.log('[ProductList] hide toggle -> POST /api/product/:id/hide', id, {
        hidden: nextHidden,
      });
      const res = await api.post(
        `/api/product/${id}/hide`,
        { hidden: nextHidden },
        { validateStatus: () => true }
      );
      console.log('[ProductList] hide result', res.status, res.data);
      if (!(res.status >= 200 && res.status < 300)) {
        const msg =
          (res.data && (res.data.message || res.data.error)) || '숨김 상태 변경에 실패했습니다.';
        alert(msg);
        rollback();
      }
    } catch (e) {
      console.error('[ProductList] hide error', e);
      alert('숨김 상태 변경 중 오류가 발생했습니다.');
      rollback();
    }
  };

  const unhideIfHidden = (id: string) => {
    if (!hiddenIds.has(id)) return;
    void toggleHidden(id, false, false);
  };

  // 다음 페이지 프리필용 후보를 세션에 저장 (라우트 state가 없을 때 백업)
  const saveCandidateForNextPage = (p: ProductItem) => {
    try {
      const candidate = {
        id: p.id,
        name: p.name,
        // 정가/단위(표시용 값 우선)
        regularPrice: p.displayPrice ?? p.price,
        regularUnit: p.displayUnit ?? p.unit,
        // 재고 레벨 → 서버 포맷 힌트
        stockLevel: p.stock === '없음' ? 'NONE' : p.stock === '적음' ? 'LOW' : 'ENOUGH',
        // 특가 힌트
        dealPrice: p.dealPrice,
        dealUnit: p.dealUnit,
        dealStartAt: p.dealStartAt,
        dealEndAt: p.dealEndAt,
        // UI 플래그
        isSpecial: p.isSpecial,
      };
      sessionStorage.setItem('product:candidate', JSON.stringify(candidate));
      // SPA 내 다른 구간에도 브로드캐스트
      window.dispatchEvent(new CustomEvent('product:candidate', { detail: candidate }) as Event);
      console.log('[ProductList] saved candidate for next page', candidate);
    } catch (e) {
      console.warn('[ProductList] saveCandidate failed', e);
    }
  };

  const hiddenOrderRaw = localStorage.getItem(HIDDEN_IDS_KEY + ':order');
  let hiddenOrder: string[] = [];
  try {
    if (hiddenOrderRaw) hiddenOrder = JSON.parse(hiddenOrderRaw);
  } catch {}

  const mergedItems = (items ?? []).map((it) => {
    const override = editedById[it.id];
    return override ? { ...it, ...override } : it;
  });

  const sortedItems = [...mergedItems]
    .filter((it) => !removedIds.has(it.id))
    .sort((a, b) => {
      const ah = hiddenIds.has(a.id) ? 1 : 0;
      const bh = hiddenIds.has(b.id) ? 1 : 0;
      if (ah !== bh) return ah - bh;
      if (ah === 1 && bh === 1) {
        return hiddenOrder.indexOf(a.id) - hiddenOrder.indexOf(b.id);
      }
      return 0;
    });

  const isEmpty = (items?.length ?? 0) === 0;

  const confirmDelete = async (pid: string) => {
    if (deleting) return;
    try {
      setDeleting(true);
      console.log('[ProductList] delete request', pid);
      const res = await api.delete(`/api/product/${pid}`, { validateStatus: () => true });
      console.log('[ProductList] delete result', res.status, res.data);
      if (res.status >= 200 && res.status < 300) {
        // 부모에 알림(있으면 목록 갱신은 부모가 담당)
        if (onDelete) onDelete(pid);
        else setRemovedIds((prev) => new Set(prev).add(pid));
      } else {
        const msg =
          (res.data && (res.data.message || res.data.error)) || '상품 삭제에 실패했습니다.';
        alert(msg);
      }
    } catch (e) {
      console.error('[ProductList] delete error', e);
      alert('상품 삭제 중 오류가 발생했습니다.');
    } finally {
      setDeleting(false);
      setDeleteTarget(null);
    }
  };

  return (
    <S.Wrap>
      {title && <S.Title>{title}</S.Title>}

      <S.Table role="region" aria-label="상품 목록">
        <S.Head>
          <S.HeadCell style={{ textAlign: 'left' }}>품명</S.HeadCell>
          <S.HeadCell>가격 (단위)</S.HeadCell>
          <S.HeadCell>재고</S.HeadCell>
          <ThreeDotIcon />
        </S.Head>

        {isEmpty ? (
          <S.Empty>
            <S.EmptyIcon>
              <NoProductIcon />
            </S.EmptyIcon>
            <S.EmptyTitle>등록된 상품이 아직 없어요</S.EmptyTitle>
            <S.EmptyDesc>판매할 상품을 추가해보세요</S.EmptyDesc>
          </S.Empty>
        ) : (
          <S.Body role="list">
            {sortedItems.map((it) => {
              const expandedProp = expandedId === it.id;
              const expanded = expandedProp && !forceCollapsed.has(it.id);
              const isHidden = hiddenIds.has(it.id);
              // 특가 상태: 서버 제공 정보와 화면 임시 상태를 모두 반영 + 종료시간 경과 시 자동 해제 표시
              const serverHasSpecial =
                (it.dealPrice ?? 0) > 0 && !!it.dealStartAt && !!it.dealEndAt;
              const mapHasSpecial = !!specialsById?.[it.id] && !endedSpecialIds.has(it.id);

              // 종료 시간 경과 여부 (dealEndAt 기준)
              const endedByTime = (() => {
                const endIso = it.dealEndAt || (mapHasSpecial ? specialsById![it.id].endTime : '');
                if (!endIso) return false;
                const endMs = new Date(endIso).getTime();
                if (Number.isNaN(endMs)) return false;
                return Date.now() >= endMs;
              })();

              // 사용자가 방금 종료한 경우 즉시 UI 반영
              const locallyEnded = endedSpecialIds.has(it.id);

              const isSpecial = Boolean(
                (it.isSpecial || serverHasSpecial || mapHasSpecial) && !endedByTime && !locallyEnded
              );

              // 특가 태그 시간도 로컬 종료 시 표시 제거
              const spStart = locallyEnded
                ? ''
                : mapHasSpecial
                ? specialsById![it.id].startTime
                : serverHasSpecial
                ? fmtHM(it.dealStartAt)
                : '';
              const spEnd = locallyEnded
                ? ''
                : mapHasSpecial
                ? specialsById![it.id].endTime
                : serverHasSpecial
                ? fmtHM(it.dealEndAt)
                : '';
              return (
                <Fragment key={it.id}>
                  <S.RowWrap $expanded={expanded} $hidden={isHidden} $isSpecial={isSpecial}>
                    <S.Row
                      role="listitem"
                      onClick={() => {
                        // 사용자가 직접 클릭해 펼치면 강제 접힘 해제
                        setForceCollapsed((prev) => {
                          if (!prev.has(it.id)) return prev;
                          const next = new Set(prev);
                          next.delete(it.id);
                          return next;
                        });
                        onRowClick(it.id);
                      }}
                    >
                      <S.Cell $hidden={isHidden}>{it.name}</S.Cell>
                      <S.Cell $hidden={isHidden}>
                        <S.PriceText>
                          {formatPrice(it.displayPrice ?? it.price)}{' '}
                          <S.PriceTextSpan> / </S.PriceTextSpan>
                          {it.displayUnit ?? it.unit}
                        </S.PriceText>
                      </S.Cell>
                      <S.Cell $hidden={isHidden}>
                        <S.StockBadge $hidden={isHidden} data-state={it.stock}>
                          {it.stock === '적음' && <GreenLessIcon />}
                          {it.stock === '없음' && <RedNoneIcon />}
                          {it.stock}
                        </S.StockBadge>
                      </S.Cell>
                      <S.Cell $hidden={isHidden}>
                        <S.MenuBtn>
                          <ThreeDotIcon />
                        </S.MenuBtn>
                      </S.Cell>
                    </S.Row>
                    {isSpecial && (
                      <S.SpecialTag>
                        <Tag />
                        <S.SpecialTagSpan>특가 상품</S.SpecialTagSpan>
                        <S.Gap> </S.Gap>
                        {(spStart || spEnd) && (
                          <S.SpecialTagSpan>
                            {spStart} - {spEnd}
                          </S.SpecialTagSpan>
                        )}
                      </S.SpecialTag>
                    )}
                    {expanded && (
                      <>
                        <S.ActionBar>
                          <S.PrimaryBtn
                            type="button"
                            onClick={async (e) => {
                              e.stopPropagation();
                              if (isSpecial) {
                                const ok = await endSpecialFor(it.id, it.name);
                                if (ok) {
                                  // 서버 성공 시에만 접기
                                  onRowClick(it.id);
                                  setForceCollapsed((prev) => new Set(prev).add(it.id));
                                }
                              } else {
                                // 특가 설정 시, 숨김 상태라면 자동으로 숨김 해제
                                unhideIfHidden(it.id);
                                // 다음 페이지 프리필 힌트 저장
                                saveCandidateForNextPage(it);
                                onSpecial(it.id, forwardMode);
                              }
                            }}
                          >
                            {isSpecial ? '특가 종료' : '특가 설정'}
                          </S.PrimaryBtn>
                          <S.GhostBtn
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              // 다음 페이지 프리필 힌트 저장
                              saveCandidateForNextPage(it);
                              if (isSpecial) {
                                // 특가 진행 중인 상품: 특가 설정 화면으로 이동(기존 특가 값으로 수정)
                                onSpecial(it.id, forwardMode);
                              } else {
                                // 일반 상품: 수정 화면으로 이동
                                onEdit(it.id, forwardMode);
                              }
                            }}
                          >
                            수정
                          </S.GhostBtn>
                          <S.IconBtn
                            aria-label={isHidden ? '숨김 해제' : '숨김'}
                            onClick={async (e) => {
                              e.stopPropagation();
                              const willHide = !isHidden;

                              if (!willHide) {
                                setForceCollapsed((prev) => {
                                  if (!prev.has(it.id)) return prev;
                                  const next = new Set(prev);
                                  next.delete(it.id);
                                  return next;
                                });
                              }

                              if (willHide) {
                                // 숨김 전환 시, 특가 종료를 우선 시도하고 결과에 따라 UI 결정
                                await endSpecialFor(it.id, it.name, { silent: false });
                                // 특가 종료 성공 여부와 관계없이 UX 일관성을 위해 접기
                                if (expanded) onRowClick(it.id);
                                // UI 즉시 접힘 보장
                                setForceCollapsed((prev) => new Set(prev).add(it.id));
                              }

                              // 서버 동기화: wasExpanded=true로 전달해 내부에서도 접기 보장, 자동 종료는 스킵
                              await toggleHidden(it.id, willHide, true, true);
                              onView(it.id);
                            }}
                          >
                            {isHidden ? <HideIcon /> : <ViewIcon />}
                          </S.IconBtn>
                          <S.IconBtn
                            aria-label="삭제"
                            onClick={(e) => {
                              e.stopPropagation();
                              setDeleteTarget(it);
                            }}
                          >
                            <RemoveIcon />
                          </S.IconBtn>
                        </S.ActionBar>
                      </>
                    )}
                  </S.RowWrap>
                </Fragment>
              );
            })}
          </S.Body>
        )}
      </S.Table>

      {deleteTarget && (
        <S.ModalOverlay onClick={() => setDeleteTarget(null)}>
          <S.ModalContent onClick={(e) => e.stopPropagation()}>
            <S.ModalTitle>정말 삭제할까요?</S.ModalTitle>
            <S.ModalDesc>삭제하면 아래 항목이 사라져요.</S.ModalDesc>
            <S.ItemPreview>
              {/* 미리보기: 품명 / 가격 / 단위 / 재고 */}
              <S.ItemPreviewRow>
                <S.PreviewName>{deleteTarget.name}</S.PreviewName>
                <S.PreviewPriceUnit>
                  {deleteTarget.price.toLocaleString()}원 / {deleteTarget.unit}
                </S.PreviewPriceUnit>
                <S.PreviewStock>{deleteTarget.stock}</S.PreviewStock>
              </S.ItemPreviewRow>
            </S.ItemPreview>
            <S.ModalActions>
              <S.CancelButton type="button" onClick={() => setDeleteTarget(null)}>
                취소
              </S.CancelButton>
              <S.DangerButton
                type="button"
                onClick={() => {
                  if (deleteTarget) {
                    void confirmDelete(deleteTarget.id);
                  }
                }}
              >
                삭제
              </S.DangerButton>
            </S.ModalActions>
          </S.ModalContent>
        </S.ModalOverlay>
      )}
    </S.Wrap>
  );
}
