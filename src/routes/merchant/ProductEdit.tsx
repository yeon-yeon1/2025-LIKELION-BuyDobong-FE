import React, { useEffect, useMemo, useState } from 'react';
import Header from '@components/Header';
import * as C from '@styles/merchant/ProductCreateStyle';
import ProductFields, {
  type ProductDraft,
  type ProductFieldKey,
} from '@components/merchant/ProductFields';
import PreviewPanel from '@components/merchant/PreviewPanel';
import ProductList, { type ProductItem } from '@components/merchant/ProductList';
import { useNavigate, useLocation } from 'react-router-dom';
import InputModeToggle, { type InputMode } from '@components/merchant/InputModeToggle';
import RecordButton from '@components/merchant/RecordButton';
import { useWebSpeechProductWizard } from '@lib/useWebSpeechProductWizard';

function ProductEdit() {
  const navigate = useNavigate();
  const location = useLocation();
  const state = (location.state ?? {}) as {
    item?: ProductItem;
    id?: string;
    source?: 'home' | 'list' | 'productRegister';
    mode?: InputMode;
    defaultMode?: InputMode;
  };
  const stateItem = state.item;

  const [origin, setOrigin] = useState<ProductItem | null>(null);
  const [draft, setDraft] = useState<ProductDraft>({
    name: '',
    price: null,
    unit: '',
    stock: '충분함',
  });

  // 기본 모드 우선순위: state.mode → state.defaultMode → 'voice'
  const [mode, setMode] = useState<InputMode>(state?.mode ?? state?.defaultMode ?? 'voice');
  useEffect(() => {
    const next = state?.mode ?? state?.defaultMode;
    if (next && next !== mode) {
      setMode(next);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [state?.mode, state?.defaultMode]);
  const isVoice = mode === 'voice';
  const wizard = useWebSpeechProductWizard((updater) =>
    setDraft((prev) => (typeof updater === 'function' ? updater(prev) : prev))
  );

  const handleAskField = (field: ProductFieldKey) => {
    // 단일 질문 API가 있으면 우선 사용, 없으면 start(field) → start() 순으로 폴백
    if (typeof (wizard as any).startSingle === 'function') {
      (wizard as any).startSingle(field);
      return;
    }
    if (typeof (wizard as any).start === 'function') {
      try {
        (wizard as any).start(field as any);
      } catch {
        try {
          (wizard as any).start();
          if (typeof (wizard as any).setFocusField === 'function') {
            (wizard as any).setFocusField(field);
          } else {
            (wizard as any).expectedField = field;
          }
        } catch {}
      }
      return;
    }
  };

  // 1) state.item 우선 반영 + 새로고침 대비 id 백업
  useEffect(() => {
    // 홈에서 온 경우: 항상 새로 작성 (복구/초기화 스킵)
    if (state?.source === 'home') {
      sessionStorage.removeItem('edit:lastId');
      setOrigin(null);
      setDraft({
        name: '',
        price: null,
        unit: '',
        stock: '충분함',
      });
      return;
    }

    if (stateItem) {
      setOrigin(stateItem);
      setDraft({
        name: stateItem.name,
        price: stateItem.price,
        unit: stateItem.unit,
        stock: stateItem.stock,
      });
      if (stateItem.id) sessionStorage.setItem('edit:lastId', stateItem.id);
      return;
    }

    if (state?.id) {
      try {
        const raw = localStorage.getItem('product:list');
        const list: ProductItem[] = raw ? JSON.parse(raw) : [];
        const found = list.find((p) => p.id === state.id);
        if (found) {
          setOrigin(found);
          setDraft({
            name: found.name,
            price: found.price,
            unit: found.unit,
            stock: found.stock,
          });
          sessionStorage.setItem('edit:lastId', found.id);
          return;
        }
      } catch {}
    }

    // 2) state 없으면 sessionStorage의 id로 복구
    const lastId = sessionStorage.getItem('edit:lastId');
    if (lastId) {
      try {
        const raw = localStorage.getItem('product:list');
        const list: ProductItem[] = raw ? JSON.parse(raw) : [];
        const found = list.find((p) => p.id === lastId);
        if (found) {
          setOrigin(found);
          setDraft({
            name: found.name,
            price: found.price,
            unit: found.unit,
            stock: found.stock,
          });
          return;
        }
      } catch {}
    }
    // 3) 아무 정보도 없으면 비워둠(홈 등에서 바로 들어온 케이스): 품명 자동완성에 맡김
  }, [stateItem, state?.source, state?.id]);

  // 품명 입력 시 자동 완성(동일 품명 존재하면 가격/단위/재고 채움)
  useEffect(() => {
    const name = draft.name.trim();
    if (!name) return;
    try {
      const raw = localStorage.getItem('product:list');
      const list: ProductItem[] = raw ? JSON.parse(raw) : [];
      const found = list.find((p) => p.name === name);
      if (found) {
        setDraft((prev) => ({
          ...prev,
          price: found.price,
          unit: found.unit,
          stock: found.stock,
        }));
        setOrigin(found); // 기준 아이템 갱신
      }
    } catch {}
  }, [draft.name]);

  const canPreview = useMemo(
    () => !!draft.name && draft.price !== null && draft.unit.trim().length > 0,
    [draft]
  );

  const previewItems: ProductItem[] = canPreview
    ? [
        {
          id: origin?.id || 'preview-edit',
          name: draft.name,
          price: draft.price as number,
          unit: draft.unit,
          stock: draft.stock,
        },
      ]
    : [];

  const handleSave = () => {
    if (!draft.name || draft.price === null || !draft.unit) return;

    try {
      const raw = localStorage.getItem('product:list');
      const list: ProductItem[] = raw ? JSON.parse(raw) : [];

      // 덮어쓸 대상 id: origin 우선, 없으면 동일 품명 항목, 그래도 없으면 새로 생성
      const existingByName = list.find((p) => p.name === draft.name);
      const targetId = origin?.id ?? existingByName?.id ?? `p-${Date.now()}`;

      // 동일 이름 중복 방지(자기 자신 제외)
      const duplicated = list.some((p) => p.id !== targetId && p.name === draft.name);
      if (duplicated) {
        alert('이미 등록된 상품명입니다.');
        return;
      }

      // 변경 전 스냅샷
      const before = list.find((p) => p.id === targetId) || null;
      const now = Date.now();

      // 업데이트 객체 (updatedAt 포함)
      const updated: ProductItem & { updatedAt?: number } = {
        id: targetId,
        name: draft.name,
        price: draft.price as number,
        unit: draft.unit,
        stock: draft.stock,
        updatedAt: now,
      };

      let next: ProductItem[];
      const idx = list.findIndex((p) => p.id === targetId);
      if (idx >= 0) {
        next = [...list];
        next[idx] = updated;
      } else {
        next = [updated, ...list];
      }

      // 저장
      localStorage.setItem('product:list', JSON.stringify(next));

      // 변경 로그 기록
      try {
        const changesRaw = localStorage.getItem('product:changes');
        const changes: any[] = changesRaw ? JSON.parse(changesRaw) : [];
        const after = {
          name: updated.name,
          price: updated.price,
          unit: updated.unit,
          stock: updated.stock,
        };
        const beforeSlim = before
          ? { name: before.name, price: before.price, unit: before.unit, stock: before.stock }
          : null;
        changes.push({ id: targetId, updatedAt: now, before: beforeSlim, after });
        localStorage.setItem('product:changes', JSON.stringify(changes));
      } catch {}

      sessionStorage.setItem('edit:lastId', targetId);
      if (state?.source === 'home') {
        navigate('/merchantHome');
      } else {
        navigate('/productRegister');
      }
    } catch (e) {
      console.warn('[ProductEdit] failed to save item', e);
    }
  };

  const subTitleText = isVoice
    ? '물어보는 대로, 답만 하면 등록 끝이에요'
    : '말보다 손이 편할 땐, 직접 입력으로 정확하게 등록해요';

  const voiceControls = isVoice ? (
    <>
      <RecordButton
        status={wizard.running ? 'recording' : 'idle'}
        onToggle={(next) => (next === 'recording' ? wizard.start() : wizard.stop())}
      />
      <C.Gap />
    </>
  ) : null;

  const previewBlock = canPreview ? (
    <PreviewPanel title="이렇게 바뀔게요" onConfirm={handleSave}>
      <ProductList title={undefined} items={previewItems} showAddButton={false} />
    </PreviewPanel>
  ) : null;

  return (
    <>
      <Header />
      <C.ProductCreate>
        <C.Title>바뀐 상품만 골라 등록해요</C.Title>

        <InputModeToggle value={mode} onChange={(next) => setMode(next)} />
        <C.SubTitle>{subTitleText}</C.SubTitle>
        {voiceControls}

        <ProductFields
          value={draft}
          onChange={setDraft}
          disabled={isVoice}
          isVoice={isVoice}
          onVoiceAsk={handleAskField}
        />
        <C.Gap />
        <C.Gap />

        {previewBlock}
      </C.ProductCreate>
    </>
  );
}

export default ProductEdit;
