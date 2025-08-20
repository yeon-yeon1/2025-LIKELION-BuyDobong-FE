import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import Header from '@components/Header';
import * as P from '@styles/merchant/ProductRegisterStyle';

import PlusButton from '@components/merchant/PlusButton';
import ProductList, { type ProductItem } from '@components/merchant/ProductList';

function ProductRegister() {
  const navigate = useNavigate();
  const location = useLocation();
  const navState = (location.state || {}) as any;
  const defaultMode: 'voice' | 'text' =
    navState?.defaultMode ??
    navState?.mode ??
    (sessionStorage.getItem('route:mode') as any) ??
    'voice';

  // Keep the last chosen mode around (so refresh or intermediate pages preserve it)
  useEffect(() => {
    try {
      if (defaultMode) sessionStorage.setItem('route:mode', defaultMode);
    } catch {}
  }, [defaultMode]);
  const [items, setItems] = useState<ProductItem[]>([]);
  const [expandedId, setExpandedId] = useState<string | null>(null);

  // 특가 정보 맵(id -> {startTime, endTime}) (state 기반)
  const [specialsById, setSpecialsById] = useState<
    Record<string, { startTime: string; endTime: string }>
  >({});

  // specialsById 빌드 함수
  function buildSpecialsById(currentItems: ProductItem[]) {
    const byId: Record<string, { startTime: string; endTime: string }> = {};
    try {
      const raw = localStorage.getItem('product:specials');
      const specials: any[] = raw ? JSON.parse(raw) : [];

      // 최신순(내림차순)으로 정렬한 뒤, 같은 이름은 "가장 최신 한 건"만 보관
      specials.sort((a, b) => (b?.createdAt ?? 0) - (a?.createdAt ?? 0));

      const latestByName = new Map<string, { startTime: string; endTime: string }>();
      for (const sp of specials) {
        if (!sp || !sp.name) continue;
        // 최초 1회만 세팅 (최신순 배열이므로 가장 처음 만난 것이 최신)
        if (!latestByName.has(sp.name)) {
          latestByName.set(sp.name, { startTime: sp.startTime, endTime: sp.endTime });
        }
      }

      // 현재 리스트의 id로 매핑 (동일 이름 매칭)
      currentItems.forEach((it) => {
        const hit = latestByName.get(it.name);
        if (hit) byId[it.id] = hit;
      });
    } catch {}
    return byId;
  }

  // items가 바뀔 때 specialsById 재구성
  useEffect(() => {
    setSpecialsById(buildSpecialsById(items));
  }, [items]);

  // 로컬스토리지에서 상품 목록 + 특가 맵 동시 로드 (items 내용이 동일해도 특가 즉시 반영)
  const loadProducts = () => {
    try {
      const raw = localStorage.getItem('product:list');
      if (!raw) {
        setItems([]);
        setSpecialsById({});
        return;
      }
      const parsed: ProductItem[] = JSON.parse(raw);
      if (Array.isArray(parsed)) {
        setItems(parsed);
        // items 변경 여부와 관계없이 최신 특가 맵을 함께 구성
        setSpecialsById(buildSpecialsById(parsed));
      } else {
        setItems([]);
        setSpecialsById({});
      }
    } catch {
      setItems([]);
      setSpecialsById({});
    }
  };

  useEffect(() => {
    loadProducts();
  }, []);

  // BFCache/뒤로가기 복귀 시에도 즉시 최신 특가 반영
  useEffect(() => {
    const onPageShow = () => {
      setSpecialsById(buildSpecialsById(itemsRef.current));
    };
    window.addEventListener('pageshow', onPageShow);
    return () => window.removeEventListener('pageshow', onPageShow);
  }, []);

  const itemsRef = React.useRef<ProductItem[]>([]);
  useEffect(() => {
    itemsRef.current = items;
  }, [items]);

  // 페이지로 돌아왔을 때/특가 변경 시 즉시 갱신
  useEffect(() => {
    const onFocus = () => loadProducts();

    const onStorage = (e: StorageEvent) => {
      if (e.key === 'product:specials' || e.key === 'product:list') {
        // 어떤 변경이든 항상 동기 로드하여 최신 상태 반영
        loadProducts();
      }
    };

    window.addEventListener('focus', onFocus);
    window.addEventListener('storage', onStorage);
    return () => {
      window.removeEventListener('focus', onFocus);
      window.removeEventListener('storage', onStorage);
    };
  }, []);

  const loc = useLocation();
  useEffect(() => {
    // 라우터 이동(뒤로가기/특가 저장 후 복귀 등) 시 최신 목록/특가 동시 반영
    loadProducts();
  }, [loc.key]);

  const appendChangeLog = (entry: any) => {
    try {
      const raw = localStorage.getItem('product:changes');
      const changes: any[] = raw ? JSON.parse(raw) : [];
      changes.push(entry);
      localStorage.setItem('product:changes', JSON.stringify(changes));
    } catch {}
  };

  const handleDelete = React.useCallback(
    (id: string) => {
      const now = Date.now();
      const removed = items.find((x) => x.id === id) || null;

      const next = items.filter((x) => x.id !== id);
      setItems(next);
      localStorage.setItem('product:list', JSON.stringify(next));

      // 변경 로그에 삭제 기록 추가
      const before = removed
        ? { name: removed.name, price: removed.price, unit: removed.unit, stock: removed.stock }
        : null;
      appendChangeLog({ id, updatedAt: now, before, after: null });
    },
    [items]
  );

  const handleRowClick = (id: string) => setExpandedId((prev) => (prev === id ? null : id));

  const handleSpecial = (id: string, m?: 'voice' | 'text') => {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    const modeToSend = (m as 'voice' | 'text') ?? defaultMode;
    navigate('/specialRegister', {
      state: { item, mode: modeToSend, returnTo: '/productRegister' },
    });
  };

  const handleEdit = (id: string, m?: 'voice' | 'text') => {
    const item = items.find((x) => x.id === id);
    if (!item) return;
    const modeToSend = (m as 'voice' | 'text') ?? defaultMode;
    navigate('/product/edit', {
      state: {
        item,
        mode: modeToSend,
        source: 'productRegister',
        returnTo: '/productRegister',
      },
    });
  };

  const handleAddClick = () =>
    navigate('/product/new', { state: { defaultMode, mode: defaultMode } });

  return (
    <>
      <Header />
      <P.ProductRegister>
        <P.Title>지금 이런 걸 팔고 있어요</P.Title>
        <ProductList
          items={items}
          expandedId={expandedId}
          onRowClick={handleRowClick}
          forwardMode={defaultMode}
          onSpecial={handleSpecial}
          onEdit={handleEdit}
          onView={(id) => console.log('보기:', id)}
          onDelete={handleDelete}
          specialsById={specialsById}
        />
        <P.PlusButtonWrapper>
          <PlusButton onClick={handleAddClick} />
        </P.PlusButtonWrapper>
      </P.ProductRegister>
    </>
  );
}

export default ProductRegister;
