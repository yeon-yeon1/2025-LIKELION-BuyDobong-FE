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
import api from '@lib/api';

type ApiStockLevel = 'ENOUGH' | 'LOW' | 'NONE';
const uiToApiStock = (s: ProductDraft['stock']): ApiStockLevel =>
  s === '충분함' ? 'ENOUGH' : s === '적음' ? 'LOW' : 'NONE';

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
    // 홈에서 온 경우: 항상 빈 폼으로 시작 (품명 입력 시 자동 프리필 로직이 채움)
    if (state?.source === 'home') {
      try {
        sessionStorage.removeItem('edit:lastId');
      } catch {}
      try {
        sessionStorage.removeItem('product:candidate');
      } catch {}
      setOrigin(null);
      setDraft({ name: '', price: null, unit: '', stock: '충분함' });
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

  // 서버 최신 스냅샷으로 재동기화 (수정 직후 편집 화면 진입 시 구 값이 보이는 문제 방지)
  useEffect(() => {
    // 새 작성 플로우는 제외
    if (state?.source === 'home') return;

    // 1) 우선 id를 확보
    const idRaw = origin?.id ?? state?.id ?? sessionStorage.getItem('edit:lastId');
    if (!idRaw) return;
    const idNum = /^(\d+)$/.test(String(idRaw)) ? Number(String(idRaw)) : NaN;

    (async () => {
      try {
        const res = await api.get('/api/product/me', { validateStatus: () => true });
        if (res.status === 200 && Array.isArray(res.data)) {
          let fresh: any | undefined;
          if (!Number.isNaN(idNum)) {
            fresh = res.data.find((p: any) => Number(p?.id) === idNum);
          }
          if (!fresh && draft?.name) {
            fresh = res.data.find((p: any) => String(p?.name) === String(draft.name));
          }
          if (fresh) {
            // 최신값으로 origin/draft 동기화
            const next: ProductItem = {
              id: String(fresh.id),
              name: fresh.name,
              price: Number(fresh.regularPrice ?? fresh.price ?? 0),
              unit: String(fresh.regularUnit ?? fresh.unit ?? ''),
              stock: ((): ProductItem['stock'] => {
                const s = String(fresh.stockLevel || '').toUpperCase();
                return s === 'LOW' ? '적음' : s === 'NONE' ? '없음' : '충분함';
              })(),
            };
            setOrigin(next);
            setDraft({
              name: next.name,
              price: next.price,
              unit: next.unit,
              stock: next.stock,
            });
            sessionStorage.setItem('edit:lastId', next.id);
          }
        }
      } catch (e) {
        // 네트워크 실패 시 조용히 무시 (기존 stateItem/로컬 스냅샷 유지)
      }
    })();
    // origin.id, state.id, draft.name이 바뀌면 최신값으로 다시 맞춤
  }, [origin?.id, state?.id, draft.name, state?.source]);

  // 품명 입력 시 자동 프리필: (home에서 온 경우 서버 우선) localStorage → 서버 보강 (비어있는 필드만 채움)
  useEffect(() => {
    const name = draft.name.trim();
    if (!name) return;

    const fromHome = state?.source === 'home';

    const needPrice = !(Number.isFinite(draft.price as any) && Number(draft.price) > 0);
    const needUnit = !draft.unit;
    const needStock = !draft.stock;
    if (!needPrice && !needUnit && !needStock) return; // 이미 유저가 채운 경우 유지

    const applyFrom = (p: any) => {
      setDraft((prev) => ({
        ...prev,
        price: needPrice ? Number(p.regularPrice ?? p.price ?? prev.price) : prev.price,
        unit: needUnit ? String(p.regularUnit ?? p.unit ?? (prev.unit || '')) : prev.unit,
        stock: needStock
          ? ((): ProductDraft['stock'] => {
              const s = String(p.stockLevel || p.stock || '').toUpperCase();
              return s === 'LOW' ? '적음' : s === 'NONE' ? '없음' : '충분함';
            })()
          : prev.stock,
      }));
      // origin도 최신 기준으로 동기화(미리보기에 반영)
      setOrigin(
        (prev) =>
          ({
            id: String(p.id ?? prev?.id ?? 'preview-edit'),
            name: name,
            price: Number(p.regularPrice ?? p.price ?? draft.price ?? 0),
            unit: String(p.regularUnit ?? p.unit ?? draft.unit ?? ''),
            stock: ((): ProductItem['stock'] => {
              const s = String(p.stockLevel || p.stock || '').toUpperCase();
              return s === 'LOW' ? '적음' : s === 'NONE' ? '없음' : '충분함';
            })(),
          } as ProductItem)
      );
    };

    // (1) home에서 온 경우엔 로컬 캐시를 건너뛰고 서버만 조회
    if (!fromHome) {
      try {
        const raw = localStorage.getItem('product:list');
        if (raw) {
          const list: any[] = JSON.parse(raw);
          if (Array.isArray(list)) {
            const found = list.find((p) => String(p?.name) === name);
            if (found) {
              applyFrom(found); // 임시 프리필 (이후 서버로 보강)
            }
          }
        }
      } catch {}
    }

    // (2) 서버에서 최신값으로 보강/덮어쓰기
    (async () => {
      try {
        const res = await api.get('/api/product/me', { validateStatus: () => true });
        if (res.status === 200 && Array.isArray(res.data)) {
          const found = res.data.find((p: any) => String(p?.name) === name);
          if (found) {
            applyFrom(found); // 서버 값으로 덮어써서 수정 후에도 최신 반영
          }
        }
      } catch {}
    })();
  }, [draft.name, state?.source]);

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

  const handleSave = async () => {
    if (!draft.name || draft.price === null || !draft.unit) {
      alert('품명/가격/단위를 모두 입력해 주세요.');
      return;
    }

    // 1) 가격 기초 검증: 숫자, 정수, 1 이상
    const priceNum = Number(draft.price);
    if (!Number.isFinite(priceNum)) {
      alert('가격이 숫자가 아닙니다. 숫자만 입력해 주세요.');
      return;
    }
    if (priceNum <= 0) {
      alert('가격은 1 이상의 정수여야 합니다.');
      return;
    }
    if (!Number.isInteger(priceNum)) {
      alert('가격은 정수만 가능합니다.');
      return;
    }

    // 2) 활성 특가 대비 검증: 진행 중 특가가 있으면 regularPrice는 dealPrice보다 커야 함
    try {
      const resCheck = await api.get('/api/product/me', { validateStatus: () => true });
      if (resCheck.status === 200 && Array.isArray(resCheck.data)) {
        const cur = (() => {
          // id 우선, 없으면 이름으로 찾기
          const idRaw = origin?.id ?? state?.id;
          if (idRaw && /^\d+$/.test(String(idRaw))) {
            return resCheck.data.find((p: any) => Number(p?.id) === Number(idRaw));
          }
          return resCheck.data.find((p: any) => String(p?.name) === String(draft.name));
        })();
        if (cur && cur.dealEndAt) {
          const endTs = new Date(cur.dealEndAt).getTime();
          const now = Date.now();
          const active = !Number.isNaN(endTs) && now < endTs;
          const dealPriceNum = Number(cur.dealPrice);
          if (active && Number.isFinite(dealPriceNum) && priceNum <= dealPriceNum) {
            alert(
              `진행 중 특가가 있어요. 정가는 특가가(${dealPriceNum.toLocaleString()}원)보다 커야 합니다.\n- 특가 종료 후 수정하거나\n- 특가 가격을 먼저 조정해 주세요.`
            );
            return;
          }
        }
      }
    } catch {
      // 체크 실패는 저장 차단하지 않음 (서버에서 한 번 더 검증)
    }

    const productIdRaw = origin?.id ?? state?.id; // UI id (string일 수 있음)
    // 숫자 path param만 PATCH 허용. 그 외(id가 없거나 문자열 형식)는 신규 등록으로 폴백
    let productIdStr = productIdRaw != null ? String(productIdRaw).trim() : '';
    let productIdNum = /^\d+$/.test(productIdStr) ? Number(productIdStr) : NaN;

    // ⚠️ 편집 화면으로 들어올 때 로컬/프리뷰 id("p-..."/"preview-edit")인 경우가 있어
    // 서버에서 내 상품 목록을 조회해 같은 이름의 상품이 있으면 그 id를 우선 사용한다.
    if (!(Number.isInteger(productIdNum) && productIdNum > 0)) {
      try {
        const resFind = await api.get('/api/product/me', { validateStatus: () => true });
        if (resFind.status === 200 && Array.isArray(resFind.data)) {
          const found = resFind.data.find((p: any) => String(p?.name) === String(draft.name));
          if (found && /^\d+$/.test(String(found.id))) {
            productIdStr = String(found.id);
            productIdNum = Number(productIdStr);
            console.log(
              '[ProductEdit] resolved productId from server by name',
              draft.name,
              productIdNum
            );
          }
        }
      } catch (e) {
        // ignore; fallback remains POST
      }
    }

    const payload = {
      name: draft.name,
      regularPrice: priceNum,
      regularUnit: draft.unit,
      stockLevel: uiToApiStock(draft.stock),
    };
    console.log('[ProductEdit] payload', payload);

    try {
      let res;
      if (Number.isInteger(productIdNum) && productIdNum > 0) {
        console.log('[ProductEdit] PATCH /api/product/:id', productIdNum, payload, {
          raw: productIdRaw,
        });
        res = await api.patch(`/api/product/${productIdNum}`, payload, {
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true,
        });
      } else {
        console.log('[ProductEdit] POST /api/product (fallback create)', payload, {
          rawId: productIdRaw,
        });
        res = await api.post('/api/product', payload, {
          headers: { 'Content-Type': 'application/json' },
          validateStatus: () => true,
        });
      }
      console.log('[ProductEdit] result', res.status, res.data);

      if (res.status >= 200 && res.status < 300) {
        alert(productIdNum ? '상품이 수정되었습니다.' : '상품이 등록되었습니다.');

        // 로컬 캐시(product:list) 최신화
        try {
          const raw = localStorage.getItem('product:list');
          const list: any[] = raw ? JSON.parse(raw) : [];
          const idToUse = String(productIdNum || res.data?.id || origin?.id || '');
          const idx = list.findIndex(
            (p) => String(p?.id) === idToUse || String(p?.name) === String(draft.name)
          );
          const nextItem = {
            id: idToUse || (idx >= 0 ? list[idx].id : `p-${Date.now()}`),
            name: draft.name,
            price: Number(draft.price),
            unit: draft.unit,
            stock: draft.stock,
          };
          if (idx >= 0) list[idx] = { ...list[idx], ...nextItem };
          else list.unshift(nextItem);
          localStorage.setItem('product:list', JSON.stringify(list));
        } catch {}

        if (state?.source === 'home') {
          navigate('/merchantHome');
        } else {
          navigate('/productRegister');
        }
        return;
      }

      const msg =
        typeof res.data === 'string' ? res.data : res.data?.message || '상품 저장에 실패했습니다.';
      alert(msg);
    } catch (e: any) {
      const status = e?.response?.status;
      const data = e?.response?.data;
      console.error('[ProductEdit] save error', e);
      alert(
        status
          ? `상품 저장 실패(${status}) ${typeof data === 'string' ? data : data?.message ?? ''}`
          : '네트워크 오류로 상품 저장에 실패했습니다.'
      );
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
