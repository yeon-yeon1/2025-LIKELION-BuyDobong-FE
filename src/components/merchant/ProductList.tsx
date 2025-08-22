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

const HIDDEN_IDS_KEY = 'product:hiddenIds';

export type StockState = '충분함' | '적음' | '없음';

export interface ProductItem {
  id: string;
  name: string;
  price: number;
  unit: string;
  stock: StockState;
  hidden?: boolean;
  viewed?: boolean;
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

  // helper: unify "특가 종료" 처리 (부모 프롭 우선, 없으면 로컬 폴백)
  const endSpecialFor = (pid: string, pname: string) => {
    if (onSpecialEnd) {
      onSpecialEnd(pid);
      return;
    }
    // Fallback: UI에서 즉시 제거 + 로컬 스토리지 정리
    setEndedSpecialIds((prev) => new Set(prev).add(pid));
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
      console.warn('[ProductList] endSpecialFor fallback failed', e);
    }
  };

  const toggleHidden = (id: string, nextHidden: boolean, wasExpanded: boolean) => {
    // 1) UI state toggle
    setHiddenIds((prev) => {
      const next = new Set(prev);
      if (nextHidden) next.add(id);
      else next.delete(id);
      return next;
    });

    // 2) persist hidden flag into product:list
    updateProductHiddenInStorage(id, nextHidden);

    // 3) manage hidden order
    let order = loadHiddenOrder();
    if (nextHidden) {
      order.push(id);
    } else {
      order = order.filter((x) => x !== id);
    }
    saveHiddenOrder(order);

    // 3.5) 특가 진행 중인 상품을 숨기면 자동으로 특가 종료
    if (nextHidden) {
      const wasSpecial = !!specialsById?.[id] && !endedSpecialIds.has(id);
      if (wasSpecial) {
        const pname = findNameById(id);
        endSpecialFor(id, pname);
      }
    }

    // 4) collapse if it was expanded
    if (wasExpanded) onRowClick(id);
  };

  const unhideIfHidden = (id: string) => {
    if (!hiddenIds.has(id)) return;
    toggleHidden(id, false, false);
  };

  const hiddenOrderRaw = localStorage.getItem(HIDDEN_IDS_KEY + ':order');
  let hiddenOrder: string[] = [];
  try {
    if (hiddenOrderRaw) hiddenOrder = JSON.parse(hiddenOrderRaw);
  } catch {}

  const sortedItems = [...(items ?? [])].sort((a, b) => {
    const ah = hiddenIds.has(a.id) ? 1 : 0;
    const bh = hiddenIds.has(b.id) ? 1 : 0;
    if (ah !== bh) return ah - bh;
    if (ah === 1 && bh === 1) {
      return hiddenOrder.indexOf(a.id) - hiddenOrder.indexOf(b.id);
    }
    return 0;
  });

  const isEmpty = (items?.length ?? 0) === 0;

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
              const expanded = expandedId === it.id;
              const isHidden = hiddenIds.has(it.id);
              const isSpecial = !!specialsById?.[it.id] && !endedSpecialIds.has(it.id);
              return (
                <Fragment key={it.id}>
                  <S.RowWrap $expanded={expanded} $hidden={isHidden} $isSpecial={isSpecial}>
                    <S.Row role="listitem" onClick={() => onRowClick(it.id)}>
                      <S.Cell $hidden={isHidden}>{it.name}</S.Cell>
                      <S.Cell $hidden={isHidden}>
                        <S.PriceText>
                          {formatPrice(it.price)} <S.PriceTextSpan> / </S.PriceTextSpan>
                          {it.unit}
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
                        <S.SpecialTagSpan>
                          {specialsById![it.id].startTime} - {specialsById![it.id].endTime}
                        </S.SpecialTagSpan>
                      </S.SpecialTag>
                    )}
                    {expanded && (
                      <>
                        <S.ActionBar>
                          <S.PrimaryBtn
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              if (isSpecial) {
                                endSpecialFor(it.id, it.name);
                                // 특가 종료 후 행 접기
                                onRowClick(it.id);
                              } else {
                                // 특가 설정 시, 숨김 상태라면 자동으로 숨김 해제
                                unhideIfHidden(it.id);
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
                            onClick={(e) => {
                              e.stopPropagation();
                              toggleHidden(it.id, !isHidden, expanded);
                              onView(it.id); // 상위 알림 (필요 시 boolean 전달로 확장 가능)
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
                  onDelete(deleteTarget.id);
                  setDeleteTarget(null);
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
