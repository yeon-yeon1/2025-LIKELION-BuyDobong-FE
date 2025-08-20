import ProductFields, {
  type ProductDraft,
  type ProductFieldKey,
} from '@components/merchant/ProductFields';
import React, { useState, useMemo } from 'react';
import Header from '@components/Header';
import * as C from '@styles/merchant/ProductCreateStyle';

import InputModeToggle, { type InputMode } from '@components/merchant/InputModeToggle';
import RecordButton from '@components/merchant/RecordButton';
import PreviewPanel from '@components/merchant/PreviewPanel';
import ProductList, { type ProductItem } from '@components/merchant/ProductList';

import { useWebSpeechProductWizard } from '@lib/useWebSpeechProductWizard';
import { useNavigate, useLocation } from 'react-router-dom';

function ProductCreate() {
  const navigate = useNavigate();
  const location = useLocation();
  type NavState = { defaultMode?: InputMode } | null;
  const { defaultMode } = (location.state as NavState) ?? {};
  const [mode, setMode] = useState<InputMode>(() =>
    defaultMode === 'voice' || defaultMode === 'text' ? defaultMode : 'voice'
  );
  const [draft, setDraft] = useState<ProductDraft>({
    name: '',
    price: null,
    unit: '',
    stock: '충분함',
  });
  const isVoice = mode === 'voice';

  const handleVoiceAsk = (field: ProductFieldKey) => {
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
    }
  };

  React.useEffect(() => {
    if (defaultMode === 'voice' || defaultMode === 'text') {
      setMode(defaultMode);
    }
  }, [defaultMode]);

  const canPreview = useMemo(
    () => !!draft.name && draft.price !== null && draft.unit.trim().length > 0,
    [draft.name, draft.price, draft.unit]
  );
  const previewItems: ProductItem[] = canPreview
    ? [
        {
          id: 'preview-0',
          name: draft.name,
          price: draft.price as number,
          unit: draft.unit,
          stock: draft.stock,
        },
      ]
    : [];

  const handleConfirm = () => {
    if (!draft.name || draft.price === null || !draft.unit) return;

    // Check for duplicate product name in localStorage
    try {
      const raw = localStorage.getItem('product:list');
      const list: ProductItem[] = raw ? JSON.parse(raw) : [];
      const duplicate = list.some((item) => item.name === draft.name);
      if (duplicate) {
        alert('이미 등록된 상품입니다');
        return;
      }
    } catch (e) {
      console.warn('[ProductCreate] failed to check duplicates', e);
    }

    // 1) 백엔드 기대 포맷으로 변환 (퍼블리싱 단계에서는 콘솔로만 확인)
    const toStockLevel = (s: ProductDraft['stock']) =>
      s === '충분함' ? 'ENOUGH' : s === '적음' ? 'LOW' : 'NONE';

    const payload = {
      name: draft.name,
      regularPrice: draft.price as number,
      unit: draft.unit,
      stockLevel: toStockLevel(draft.stock),
    } as const;

    console.log('[ProductCreate] submit payload', payload);

    // 2) 화면용 리스트 저장 (ProductRegister/ProductList가 사용하는 로컬 포맷)
    //    ProductItem: { id, name, price, unit, stock }
    const uiItem: ProductItem = {
      id: `p-${Date.now()}`,
      name: draft.name,
      price: draft.price as number,
      unit: draft.unit,
      stock: draft.stock,
    };

    try {
      const raw = localStorage.getItem('product:list');
      const list: ProductItem[] = raw ? JSON.parse(raw) : [];
      const next = [uiItem, ...list];
      localStorage.setItem('product:list', JSON.stringify(next));

      // localStorage.setItem('product:originalList', JSON.stringify(next));
    } catch (e) {
      console.warn('[ProductCreate] failed to save product:list', e);
    }

    // 3) 저장 후 상품 등록(목록) 페이지로 이동
    navigate('/productRegister');
  };

  const wizard = useWebSpeechProductWizard((updater) =>
    setDraft((prev) => (typeof updater === 'function' ? updater(prev) : prev))
  );

  return (
    <>
      <Header />
      <C.ProductCreate>
        <C.Title>팔고 싶은 상품을 등록해요</C.Title>
        <InputModeToggle
          value={mode} // 현재 모드 ('voice' | 'text')
          onChange={(next) => setMode(next)} // 모드 변경 핸들러
        />
        <C.SubTitle>
          {isVoice
            ? '물어보는 대로, 답만 하면 등록 끝이에요'
            : '말보다 손이 편할 땐, 직접 입력으로 정확하게 등록해요'}
        </C.SubTitle>
        {isVoice && (
          <>
            <RecordButton
              status={wizard.running ? 'recording' : 'idle'}
              onToggle={(next) => (next === 'recording' ? wizard.start() : wizard.stop())}
            />
            <C.Gap />
          </>
        )}
        <ProductFields
          value={draft}
          onChange={setDraft}
          disabled={isVoice}
          isVoice={isVoice}
          onVoiceAsk={handleVoiceAsk}
        />
        <C.Gap />
        <C.Gap />

        {canPreview && (
          <PreviewPanel title="이렇게 등록할게요" onConfirm={handleConfirm}>
            <ProductList title={undefined} items={previewItems} showAddButton={false} />
          </PreviewPanel>
        )}
      </C.ProductCreate>
    </>
  );
}

export default ProductCreate;
