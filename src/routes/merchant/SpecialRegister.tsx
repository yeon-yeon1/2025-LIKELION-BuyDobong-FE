// Check if special is active (end time is in the future)
const isSpecialActive = (p: any): boolean => {
  if (!p) return false;
  const hasDeal = Number(p.dealPrice) > 0 || !!p.dealStartAt || !!p.dealEndAt;
  if (!hasDeal) return false;
  try {
    if (!p.dealEndAt) return true; // no end -> treat as active
    return new Date(p.dealEndAt).getTime() > Date.now();
  } catch {
    return false;
  }
};
import React, { useEffect, useMemo, useState } from 'react';
import Header from '@components/Header';
import * as C from '@styles/merchant/ProductCreateStyle';
import * as S from '@styles/merchant/SpecialRegisterStyle';
import ProductFields from '@components/merchant/ProductFields';
import type { ProductDraft, ProductFieldKey } from '@components/merchant/ProductFields';
import PreviewPanel from '@components/merchant/PreviewPanel';
import ProductList from '@components/merchant/ProductList';
import type { ProductItem } from '@components/merchant/ProductList';
import InputModeToggle from '@components/merchant/InputModeToggle';
import type { InputMode } from '@components/merchant/InputModeToggle';
import RecordButton from '@components/merchant/RecordButton';
import { useWebSpeechProductWizard } from '@lib/useWebSpeechProductWizard';
import { useLocation, useNavigate } from 'react-router-dom';
import TimeModal from '@components/merchant/TimeModal';
import api from '@lib/api';

// ==== Types & Utils ==========================================================
type NavState = {
  item?: ProductItem;
  from?: string;
  source?: 'home' | 'productRegister' | 'list';
  returnTo?: string;
  mode?: InputMode;
  defaultMode?: InputMode;
};

// 24h "HH:MM" -> "오전/오후 HH:MM"
const formatKoreanTime = (hhmm: string) => {
  if (!hhmm || typeof hhmm !== 'string' || !hhmm.includes(':')) return hhmm ?? '';
  const [hStr, mStr] = hhmm.split(':');
  let h = Number(hStr);
  const meridiem = h < 12 ? '오전' : '오후';
  if (h === 0) h = 12; // 00 -> 12 (오전)
  else if (h > 12) h = h - 12; // 13~23 -> 1~11 (오후)
  const hh = String(h).padStart(2, '0');
  const mm = String(Number(mStr)).padStart(2, '0');
  return `${meridiem} ${hh}:${mm}`;
};

// Time object from modal -> "HH:MM" (24h)
const toHHMM = (val: any): string => {
  if (typeof val === 'string') return val;
  if (!val || typeof val !== 'object') return '';
  const m = val.meridiem;
  let h = Number(val.hour ?? 0);
  const min = Number(val.minute ?? 0);
  if (m === '오전') {
    if (h === 12) h = 0;
  } else if (m === '오후') {
    if (h !== 12) h = h + 12;
  }
  const hh = String(h).padStart(2, '0');
  const mm = String(min).padStart(2, '0');
  return `${hh}:${mm}`;
};

// ISO -> "HH:MM" (24h)
const isoToHHMM = (iso?: string): string => {
  if (!iso || typeof iso !== 'string') return '';
  try {
    const d = new Date(iso);
    const hh = String(d.getHours()).padStart(2, '0');
    const mm = String(d.getMinutes()).padStart(2, '0');
    return `${hh}:${mm}`;
  } catch {
    return '';
  }
};

// Read referrer pathname safely
const getReferrerPath = () => {
  try {
    if (!document.referrer) return '';
    const u = new URL(document.referrer);
    return u.pathname || '';
  } catch {
    return '';
  }
};

// ==== Persistence: per-product default special times =========================
const SPECIAL_TIMES_KEY = 'product:specialTimes';
type SpecialTimesMap = Record<string, { startTime: string; endTime: string; updatedAt: number }>;

const loadSpecialTimes = (name: string): { startTime: string; endTime: string } | null => {
  try {
    const raw = localStorage.getItem(SPECIAL_TIMES_KEY);
    if (!raw) return null;
    const map: SpecialTimesMap = JSON.parse(raw);
    const rec = map?.[name];
    if (!rec || !rec.startTime || !rec.endTime) return null;
    return { startTime: rec.startTime, endTime: rec.endTime };
  } catch {
    return null;
  }
};

const saveSpecialTimes = (name: string, startTime: string, endTime: string) => {
  if (!name.trim()) return;
  try {
    const raw = localStorage.getItem(SPECIAL_TIMES_KEY);
    const map: SpecialTimesMap = raw ? JSON.parse(raw) : {};
    map[name] = { startTime, endTime, updatedAt: Date.now() };
    localStorage.setItem(SPECIAL_TIMES_KEY, JSON.stringify(map));
  } catch {}
};

// ==== Persistence: last special payload per product (by id) ==================
const LAST_SPECIAL_KEY = 'product:lastSpecialById';
type LastSpecialMap = Record<
  string,
  { price: number; unit: string; startTime: string; endTime: string; updatedAt: number }
>;

const loadLastSpecial = (id: string | number) => {
  try {
    const raw = localStorage.getItem(LAST_SPECIAL_KEY);
    if (!raw) return null;
    const map: LastSpecialMap = JSON.parse(raw);
    const rec = map?.[String(id)];
    if (!rec) return null;
    return rec;
  } catch {
    return null;
  }
};

const saveLastSpecial = (
  id: string | number,
  price: number,
  unit: string,
  startTime: string,
  endTime: string
) => {
  try {
    const raw = localStorage.getItem(LAST_SPECIAL_KEY);
    const map: LastSpecialMap = raw ? JSON.parse(raw) : {};
    map[String(id)] = { price, unit, startTime, endTime, updatedAt: Date.now() };
    localStorage.setItem(LAST_SPECIAL_KEY, JSON.stringify(map));
  } catch {}
};

// Present the mode toggle + subtitle + record button
function ModeHeader({
  mode,
  setMode,
  running,
  onStart,
  onStop,
}: {
  mode: InputMode;
  setMode: (m: InputMode) => void;
  running: boolean;
  onStart: () => void;
  onStop: () => void;
}) {
  const isVoice = mode === 'voice';
  const subTitle = isVoice
    ? '물어보는 대로, 답만 하면 등록 끝이에요'
    : '말보다 손이 편할 땐, 직접 입력으로 정확하게 등록해요';
  return (
    <>
      <InputModeToggle value={mode} onChange={setMode} />
      <C.SubTitle>{subTitle}</C.SubTitle>
      {isVoice && (
        <>
          <RecordButton
            status={running ? 'recording' : 'idle'}
            onToggle={(next) => (next === 'recording' ? onStart() : onStop())}
          />
          <C.Gap />
        </>
      )}
    </>
  );
}

function SpecialRegister() {
  // 입력 모드 (음성/텍스트)
  const navigate = useNavigate();

  const location = useLocation();
  const navState = useMemo(() => (location.state ?? {}) as NavState, [location.state]);
  const searchParams = new URLSearchParams(location.search);
  const qsFrom = searchParams.get('from') || undefined;
  const qsReturnTo = searchParams.get('returnTo') || undefined;

  // history usr (for some navigations)
  let histUsr: any = null;
  try {
    histUsr = (window.history.state as any)?.usr || null;
  } catch {}

  const passedItem: ProductItem | undefined =
    (navState as any)?.item ??
    (navState as any)?.passedItem ??
    ((navState as any)?.id && (navState as any)?.name
      ? (navState as unknown as ProductItem)
      : undefined);
  // 세션 후보(sessionStorage)로 즉시 프리필: MerchantHome/ProductList → SpecialRegister 백업 경로
  useEffect(() => {
    const isFromHome = navState?.source === 'home' || navState?.from === '/merchantHome';
    if (isFromHome) return; // 홈 진입은 초기 빈 폼 유지
    // 이미 passedItem으로 충분히 채워졌다면 생략
    const minimalPassed = !passedItem || !(passedItem as any)?.name;
    if (!minimalPassed) return;
    try {
      const raw = sessionStorage.getItem('product:candidate');
      if (!raw) return;
      const c = JSON.parse(raw);
      if (!c || !c.name) return;

      const active = (() => {
        if (c.dealPrice != null && Number(c.dealPrice) > 0) {
          if (c.dealEndAt) {
            const t = new Date(c.dealEndAt).getTime();
            if (!Number.isNaN(t) && Date.now() > t) return false;
          }
          return true;
        }
        return false;
      })();

      const nextPrice = active ? Number(c.dealPrice) : Number(c.regularPrice);
      const nextUnit = String(active ? c.dealUnit ?? c.regularUnit : c.regularUnit || '');

      setDraft((prev) => ({
        ...prev,
        name: c.name,
        price: Number.isFinite(nextPrice) ? nextPrice : prev.price,
        unit: nextUnit || prev.unit,
        stock: prev.stock,
      }));

      if (active) {
        if (typeof c.dealStartAt === 'string') {
          const d = new Date(c.dealStartAt);
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          setStartTime(`${hh}:${mm}`);
        }
        if (typeof c.dealEndAt === 'string') {
          const d = new Date(c.dealEndAt);
          const hh = String(d.getHours()).padStart(2, '0');
          const mm = String(d.getMinutes()).padStart(2, '0');
          setEndTime(`${hh}:${mm}`);
        }
      }

      // 이 경로로 프리필했으면 자동 덮어쓰기 방지
      setPrefilledByItem(true);
      initialNameRef.current = String(c.name);

      // 일회성 사용 후 제거 (스테일 방지)
      sessionStorage.removeItem('product:candidate');
    } catch {}
  }, [passedItem]);

  // 홈 → SpecialRegister 진입 시: 초기엔 프리필하지 않고, 이름 입력 시 채운다. (여기서는 후보만 청소)
  useEffect(() => {
    const isFromHome = navState?.source === 'home' || navState?.from === '/merchantHome';
    if (!isFromHome) return;
    try {
      sessionStorage.removeItem('product:candidate');
    } catch {}
  }, [navState?.source, navState?.from]);

  // 홈에서 들어온 경우: 항상 빈 폼으로 시작 (사용자가 품명을 입력하면 채움)
  useEffect(() => {
    const isFromHome = navState?.source === 'home' || navState?.from === '/merchantHome';
    if (!isFromHome) return;
    try {
      sessionStorage.removeItem('product:candidate');
    } catch {}
    setPrefilledByItem(false);
    initialNameRef.current = null;
    setDraft({ name: '', price: null, unit: '', stock: '충분함' });
    setStartTime('17:00');
    setEndTime('20:00');
  }, [navState?.source, navState?.from]);

  const isEditingSpecial = useMemo(() => {
    const p: any = passedItem as any;
    return !!(p && (p.dealPrice > 0 || p.dealStartAt || p.dealEndAt));
  }, [passedItem]);

  const [mode, setMode] = useState<InputMode>(() => {
    const m = navState.mode ?? navState.defaultMode;
    return m === 'voice' || m === 'text' ? m : 'voice';
  });
  useEffect(() => {
    const m = navState.mode ?? navState.defaultMode;
    if (m === 'voice' || m === 'text') setMode(m);
  }, [navState.mode, navState.defaultMode]);
  const isVoice = mode === 'voice';
  // --- Prefill guard for item-based prefill ---
  const [prefilledByItem, setPrefilledByItem] = useState(false);
  const initialNameRef = React.useRef<string | null>(null);

  // 상품 입력 값 (공용 컴포넌트 그대로 사용)
  const [draft, setDraft] = useState<ProductDraft>({
    name: '',
    price: null,
    unit: '',
    stock: '충분함',
  });

  // 특가 시간 (시작/종료)
  const [startTime, setStartTime] = useState<string>('17:00');
  const [endTime, setEndTime] = useState<string>('20:00');

  const [open, setOpen] = useState(false);
  const [whichPicker, setWhichPicker] = useState<'start' | 'end' | null>(null);

  const wizard = useWebSpeechProductWizard((updater) =>
    setDraft((prev) => (typeof updater === 'function' ? updater(prev) : prev))
  );
  const ask = (field: ProductFieldKey) => {
    const w: any = wizard;
    if (typeof w.startSingle === 'function') return w.startSingle(field);
    if (typeof w.start === 'function') {
      try {
        return w.start(field as any);
      } catch {
        try {
          w.start();
          if (typeof w.setFocusField === 'function') w.setFocusField(field);
          else w.expectedField = field;
        } catch {}
      }
    }
  };

  const decideReturnTo = (): string => {
    const ref = getReferrerPath();
    const saved = sessionStorage.getItem('special:lastFrom') || '';
    const explicit = qsReturnTo || navState.returnTo || (histUsr?.returnTo as string);
    if (explicit) return explicit;
    const src = navState.source || histUsr?.source || qsFrom || navState.from;
    if (
      src === 'productRegister' ||
      navState.from === '/productRegister' ||
      qsFrom === 'productRegister' ||
      ref.includes('/productRegister')
    )
      return '/productRegister';
    if (src === 'home' || navState.from === '/merchantHome' || ref.includes('/merchantHome'))
      return '/merchantHome';
    if (saved) return saved;
    return '/merchantHome';
  };
  const [returnTo, setReturnTo] = useState(decideReturnTo);

  useEffect(() => {
    if (navState.source === 'home') {
      try {
        sessionStorage.removeItem('special:lastFrom');
      } catch {}
    }
  }, [navState.source]);

  useEffect(() => {
    if (returnTo) sessionStorage.setItem('special:lastFrom', returnTo);
  }, [returnTo]);
  useEffect(() => {
    const next = qsReturnTo || navState.returnTo || (histUsr?.returnTo as string) || undefined;
    if (next && next !== returnTo) setReturnTo(next);
  }, [qsReturnTo, navState.returnTo, histUsr, returnTo]);

  useEffect(() => {
    if (!passedItem) return;
    // 홈에서 들어온 경우에는 초기값을 채우지 않고, 사용자가 이름을 입력했을 때만 자동 완성한다
    if (navState?.source === 'home' || navState?.from === '/merchantHome') return;
    const p: any = passedItem as any;

    // 인풋에는 displayPrice/displayUnit 우선 적용 (SpecialRegister 한정 규칙)
    const prefPrice =
      p.displayPrice != null
        ? Number(p.displayPrice)
        : isSpecialActive(p)
        ? Number(p.dealPrice ?? p.price)
        : Number(p.price);
    const prefUnit =
      p.displayUnit != null && String(p.displayUnit).length > 0
        ? String(p.displayUnit)
        : isSpecialActive(p)
        ? String(p.dealUnit || p.unit || '')
        : String(p.unit || '');

    setDraft({
      name: p.name,
      price: prefPrice,
      unit: prefUnit,
      stock: p.stock,
    });

    // 이 초기 프리필은 네비게이션으로 전달된 상품 기준이므로, 로컬 자동완성(useEffect[draft.name])이 덮어쓰지 않게 잠시 잠금
    setPrefilledByItem(true);
    initialNameRef.current = p.name;

    // 특가가 진행 중일 때만 특가 시간 프리필
    if (isSpecialActive(p)) {
      const st = isoToHHMM(p.dealStartAt);
      const et = isoToHHMM(p.dealEndAt);
      if (st) setStartTime(st);
      if (et) setEndTime(et);
      return; // 진행중 특가면 시간은 deal 기준 유지
    }

    // 종료/미설정이면 저장해둔 선호 시간 불러오기
    const t = loadSpecialTimes(passedItem.name);
    if (t) {
      setStartTime(t.startTime);
      setEndTime(t.endTime);
    }
  }, [passedItem]);

  // 홈에서 들어온 경우나 passedItem 정보가 불충분할 때: 서버에서 보강해서 즉시 프리필
  useEffect(() => {
    const p: any = passedItem as any;
    const fromHome = navState?.source === 'home' || navState?.from === '/merchantHome';
    if (fromHome) return; // ✅ 홈에서 진입 시 프리필 금지 (빈 폼 유지)

    // 보강이 필요한 조건: deal 필드가 비어있는 최소 객체(id/name만 있는 경우)
    const needsHydrate =
      !!p &&
      p.id &&
      p.dealPrice == null &&
      !p.dealStartAt &&
      !p.dealEndAt &&
      p.displayPrice == null;

    if (!needsHydrate) return;

    (async () => {
      try {
        const res = await api.get('/api/product/me', { validateStatus: () => true });
        if (res.status === 200 && Array.isArray(res.data)) {
          // id 우선, 없으면 이름으로 찾기
          const found = p?.id
            ? res.data.find((it: any) => String(it.id) === String(p.id))
            : res.data.find((it: any) => String(it.name) === String(p.name));
          if (!found) return;

          // SpecialRegister 표시 규칙: display → (active? deal : regular)
          const isActive = (() => {
            // 우선 dealPrice가 존재하면 특가값을 우선 사용 (종료 시간 파싱 이슈 대비)
            if (found?.dealPrice != null && Number(found.dealPrice) > 0) {
              // 종료 시간이 명확히 현재보다 이전인 경우만 비활성으로 간주
              if (found?.dealEndAt) {
                const t = new Date(found.dealEndAt).getTime();
                if (!Number.isNaN(t) && Date.now() > t) {
                  return false; // 명백히 종료
                }
              }
              return true; // 종료가 명확히 확인되지 않으면 활성 취급
            }
            // dealPrice가 없으면 기존 규칙
            if (!found?.dealEndAt) return !!found?.dealStartAt;
            const t = new Date(found.dealEndAt).getTime();
            return !Number.isNaN(t) && Date.now() < t;
          })();

          const nextPrice =
            found.displayPrice != null
              ? Number(found.displayPrice)
              : isActive
              ? Number(found.dealPrice ?? found.regularPrice ?? found.price)
              : Number(found.regularPrice ?? found.price);
          const nextUnit =
            found.displayUnit != null && String(found.displayUnit).length > 0
              ? String(found.displayUnit)
              : isActive
              ? String(found.dealUnit || found.regularUnit || found.unit || '')
              : String(found.regularUnit || found.unit || '');

          setDraft((prev) => ({
            ...prev,
            name: found.name ?? prev.name,
            price: Number.isFinite(nextPrice) ? nextPrice : prev.price,
            unit: nextUnit || prev.unit,
            stock: prev.stock,
          }));

          // 특가 진행 중이면 시간도 프리필
          if (isActive) {
            const st = typeof found.dealStartAt === 'string' ? found.dealStartAt : undefined;
            const et = typeof found.dealEndAt === 'string' ? found.dealEndAt : undefined;
            if (st) {
              const d = new Date(st);
              const hh = String(d.getHours()).padStart(2, '0');
              const mm = String(d.getMinutes()).padStart(2, '0');
              setStartTime(`${hh}:${mm}`);
            }
            if (et) {
              const d = new Date(et);
              const hh = String(d.getHours()).padStart(2, '0');
              const mm = String(d.getMinutes()).padStart(2, '0');
              setEndTime(`${hh}:${mm}`);
            }
          }

          // 이 경로로 프리필한 경우에도 passedItem 기반 프리필로 간주하여 자동 덮어쓰기 방지
          setPrefilledByItem(true);
          initialNameRef.current = String(found.name ?? p?.name ?? '');
        }
      } catch {}
    })();
  }, [passedItem, navState?.source, navState?.from]);

  // 사용자가 품명만 입력해도 자동 프리필 (정확히 같은 이름일 때만, 특가 정보 우선)
  useEffect(() => {
    const rawName = draft.name;
    const name = rawName.trim();
    if (!name) return;

    // 초기 네비 프리필 가드: 같은 이름이면 자동 덮어쓰기 금지
    if (prefilledByItem && initialNameRef.current === name) return;

    const norm = (s: any) =>
      String(s || '')
        .trim()
        .toLowerCase();
    const nameN = norm(name);

    const fillFrom = (
      p: any,
      opt?: { last?: { price: number; unit: string; startTime: string; endTime: string } | null }
    ) => {
      const last = opt?.last || null;

      // 1) 서버 특가가 "진행 중"일 때만 특가 정보로 채움
      const active = isSpecialActive(p);
      if (active) {
        const price = Number(p.dealPrice);
        const unit = String(p.dealUnit || p.unit || p.regularUnit || '');
        setDraft((prev) => ({ ...prev, name: p.name ?? name, price, unit, stock: prev.stock }));
        if (typeof p.dealStartAt === 'string') {
          const d = new Date(p.dealStartAt);
          setStartTime(
            `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
          );
        }
        if (typeof p.dealEndAt === 'string') {
          const d = new Date(p.dealEndAt);
          setEndTime(
            `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
          );
        }
        setPrefilledByItem(true);
        initialNameRef.current = String(p.name ?? name);
        return;
      }

      // 2) 진행 중 특가가 아니면, 마지막 특가 기록은 사용하지 않고 기본 정보로 진행
      // (last는 과거 기록이므로 종료 후에는 무시)

      // 3) 특가 정보 없으면 정가 + 선호 시간으로 최소 채움
      const regularPrice = Number(p.regularPrice ?? p.price);
      const regularUnit = String(p.regularUnit ?? p.unit ?? '');
      setDraft((prev) => ({
        ...prev,
        name: p.name ?? name,
        price: Number.isFinite(regularPrice) ? regularPrice : prev.price,
        unit: regularUnit || prev.unit,
        stock: prev.stock,
      }));
      const t = loadSpecialTimes(p.name ?? name);
      if (t) {
        setStartTime(t.startTime);
        setEndTime(t.endTime);
      }

      setPrefilledByItem(true);
      initialNameRef.current = String(p.name ?? name);
    };

    // 서버에서 정확히 같은 이름만 찾는다 (자동완성 금지)
    (async () => {
      try {
        const res = await api.get('/api/product/me', { validateStatus: () => true });
        if (res.status === 200 && Array.isArray(res.data)) {
          const list: any[] = res.data;
          const target = list.find((p) => norm(p?.name) === nameN);
          if (!target) return; // 정확히 같은 이름이 없으면 대기

          const last = isSpecialActive(target) ? loadLastSpecial(target.id) : null;
          fillFrom(target, { last });
        }
      } catch {}
    })();
  }, [draft.name, prefilledByItem, navState?.source, navState?.from]);

  useEffect(() => {
    const nm = draft.name.trim();
    if (!nm) return;
    const t = loadSpecialTimes(nm);
    if (t) {
      setStartTime(t.startTime);
      setEndTime(t.endTime);
    }
  }, [draft.name]);

  // 미리보기 가능 여부
  const canPreview = useMemo(
    () => !!draft.name && draft.price !== null && draft.unit.trim().length > 0,
    [draft]
  );

  // 미리보기 아이템 (리스트 재사용)
  const previewItems: ProductItem[] = canPreview
    ? [
        {
          id: 'preview-special',
          name: draft.name,
          price: draft.price as number,
          unit: draft.unit,
          stock: draft.stock,
        },
      ]
    : [];

  // Convert Date to local ISO string (keeps wall-clock time; no "Z")
  const toLocalISOStringNoZ = (d: Date): string => {
    const t = d.getTime() - d.getTimezoneOffset() * 60 * 1000; // shift by TZ offset
    return new Date(t).toISOString().slice(0, 19); // 'YYYY-MM-DDTHH:mm:ss'
  };
  const hhmmToISO = (hhmm: string, base: Date) => {
    const [h, m] = (hhmm || '00:00').split(':').map((v) => Number(v));
    const d = new Date(base.getFullYear(), base.getMonth(), base.getDate(), h || 0, m || 0, 0, 0);
    return toLocalISOStringNoZ(d);
  };

  // 저장(특가 등록 연동)
  const handleSave = async () => {
    if (!canPreview) return;
    console.log('[SpecialRegister] start save', {
      passedItemId: (passedItem as any)?.id,
      passedItemName: (passedItem as any)?.name,
      draftName: draft.name,
      initialName: initialNameRef.current,
      navState,
    });

    // 1) productId 확보 (안전) — 홈에서 진입했다면 passedItem/idFromNav를 무시하고 이름 기준으로 선택
    const fromHome = navState?.source === 'home' || navState?.from === '/merchantHome';

    const idRaw = !fromHome ? (passedItem as any)?.id : undefined;
    const idFromNav = idRaw != null && /^\d+$/.test(String(idRaw)) ? Number(idRaw) : NaN;

    // passedItem이 있으면 그 이름만 신뢰(입력창에서 바꾼 draft.name은 무시)
    // 단, 홈 진입일 때는 nameFromPassed를 쓰지 않고 draft.name으로만 조회 허용
    const nameFromPassed: string | undefined = !fromHome ? (passedItem as any)?.name : undefined;
    const lookupName: string | undefined = fromHome
      ? draft.name
      : nameFromPassed ?? (!passedItem ? draft.name : undefined);

    let productIdNum = idFromNav;
    console.log('[SpecialRegister] resolved initial ids/names', {
      fromHome,
      idRaw,
      idFromNav,
      nameFromPassed,
      lookupName,
      productIdNum_initial: productIdNum,
    });

    // 💡 사용자가 의도적으로 다른 상품명으로 바꿨다면, 그 이름으로 타겟 재설정
    // (idFromNav가 유효하더라도, 입력한 이름이 초기 기준과 다르면 이름 기준으로 재선택)
    try {
      console.log('[SpecialRegister] override-check', {
        typedName: String(draft.name || '').trim(),
        baseName:
          (initialNameRef.current && String(initialNameRef.current)) ||
          ((passedItem as any)?.name ? String((passedItem as any).name) : ''),
      });
      const typedName = String(draft.name || '').trim();
      // 비교 기준: initialNameRef가 있으면 그걸, 없으면 passedItem.name을 사용
      const baseName =
        (initialNameRef.current && String(initialNameRef.current)) ||
        ((passedItem as any)?.name ? String((passedItem as any).name) : '');

      const mustResolveByTyped = fromHome; // 홈 진입 시에는 항상 입력한 이름으로 대상 확정
      const userWantsDifferent = !!typedName && !!baseName && typedName !== baseName;
      console.log('[SpecialRegister] userWantsDifferent =', userWantsDifferent);
      console.log('[SpecialRegister] mustResolveByTyped =', mustResolveByTyped);

      if (mustResolveByTyped || userWantsDifferent) {
        const res = await api.get('/api/product/me', { validateStatus: () => true });
        if (res.status === 200 && Array.isArray(res.data)) {
          console.log('[SpecialRegister] fetched product list for name override', {
            listCount: Array.isArray(res.data) ? res.data.length : -1,
          });
          const matches = res.data.filter((p: any) => String(p?.name) === typedName);
          if (matches.length === 1 && /^\d+$/.test(String(matches[0].id))) {
            productIdNum = Number(matches[0].id); // ★ idFromNav를 덮어쓴다
            console.log('[SpecialRegister] override applied, new productIdNum =', productIdNum);
          } else if (matches.length > 1) {
            alert(
              '같은 이름의 상품이 여러 개라서 대상을 특정할 수 없어요. 상품 상세에서 다시 시도해 주세요.'
            );
            return;
          } else {
            alert('입력한 이름과 정확히 일치하는 상품을 찾지 못했어요.');
            return;
          }
        }
      }
    } catch {
      alert('상품 조회 중 오류가 발생했어요. 다시 시도해 주세요.');
      return;
    }

    if (!Number.isInteger(productIdNum) || productIdNum <= 0) {
      console.log('[SpecialRegister] fallback lookup by lookupName', { lookupName });
      if (lookupName && String(lookupName).trim().length > 0) {
        try {
          const res = await api.get('/api/product/me', { validateStatus: () => true });
          if (res.status === 200 && Array.isArray(res.data)) {
            // 이름 **정확 일치**만 허용 (모호성 방지)
            const matches = res.data.filter((p: any) => String(p?.name) === String(lookupName));
            if (matches.length === 1 && /^\d+$/.test(String(matches[0].id))) {
              productIdNum = Number(matches[0].id);
              console.log('[SpecialRegister] fallback resolved productIdNum =', productIdNum);
            } else if (matches.length > 1) {
              alert('같은 이름의 상품이 여러 개예요. 상품 상세에서 다시 시도해 주세요.');
              return;
            }
          }
        } catch {
          // 무시하고 아래에서 최종 검증
        }
      }
    }

    if (!Number.isInteger(productIdNum) || productIdNum <= 0) {
      alert('특가를 걸 상품을 먼저 선택해 주세요. (상품 ID 확인 실패)');
      return;
    }
    console.log('[SpecialRegister] product id ready for method decision', { productIdNum });

    // 1.5) 서버 상태로 생성/수정 결정 (POST vs PATCH)
    // 1.5) 서버 상태로 생성/수정 결정 (POST vs PATCH) — 인라인 active 판별
    let method: 'post' | 'patch' = 'post';
    try {
      console.log('[SpecialRegister] deciding method via server-state...', { productIdNum });
      const res = await api.get('/api/product/me', { validateStatus: () => true });
      if (res.status === 200 && Array.isArray(res.data)) {
        const found = res.data.find((it: any) => String(it.id) === String(productIdNum));
        if (found) {
          const hasDeal =
            Number(found?.dealPrice) > 0 || !!found?.dealStartAt || !!found?.dealEndAt;
          const notEnded = !found?.dealEndAt || new Date(found.dealEndAt).getTime() > Date.now();
          const active = hasDeal && notEnded; // (= isSpecialActive(found))
          console.log('[SpecialRegister] server-state snapshot', {
            targetId: productIdNum,
            foundId: found?.id,
            name: found?.name,
            dealPrice: found?.dealPrice,
            dealStartAt: found?.dealStartAt,
            dealEndAt: found?.dealEndAt,
            active,
          });
          method = active ? 'patch' : 'post';
          console.log('[SpecialRegister] method decided =', method);
        }
      }
    } catch {}

    // 2) 시간 ISO 변환 (오늘 날짜 기준, 종료가 시작보다 이르면 +1일)
    const now = new Date();

    // Build local "YYYY-MM-DDTHH:mm:ss" strings (no trailing 'Z')
    let startLocal = hhmmToISO(startTime, now);
    let endLocal = hhmmToISO(endTime, now);

    // Compare as local time
    const startDate = new Date(startLocal);
    let endDate = new Date(endLocal);
    if (endDate.getTime() <= startDate.getTime()) {
      endDate = new Date(endDate.getTime() + 24 * 60 * 60 * 1000);
      endLocal = toLocalISOStringNoZ(endDate);
    }

    console.log('[SpecialRegister] time window (local)', {
      startTime,
      endTime,
      startLocal,
      endLocal,
    });

    const payload = {
      dealPrice: Number(draft.price),
      dealUnit: draft.unit,
      dealStartAt: startLocal,
      dealEndAt: endLocal,
    };

    const execSave = async (m: 'post' | 'patch') =>
      m === 'post'
        ? api.post(`/api/product/${productIdNum}/deal`, payload, {
            headers: { 'Content-Type': 'application/json' },
            validateStatus: () => true,
          })
        : api.patch(`/api/product/${productIdNum}/deal`, payload, {
            headers: { 'Content-Type': 'application/json' },
            validateStatus: () => true,
          });

    let res;
    try {
      console.log('[SpecialRegister] upsert special', method.toUpperCase(), productIdNum, payload);
      res = await execSave(method);
      // 상태 불일치 시 한 번 반대로 재시도
      if (res.status >= 400 && res.status < 500) {
        const alt: 'post' | 'patch' = method === 'post' ? 'patch' : 'post';
        console.warn('[SpecialRegister] retry with', alt.toUpperCase(), 'due to', res.status);
        res = await execSave(alt);
      }
      console.log('[SpecialRegister] final response status after optional retry =', res?.status);
    } catch (e) {
      console.error('[SpecialRegister] deal upsert error', e);
      alert('특가 등록 중 오류가 발생했습니다.');
      return;
    }

    console.log('[SpecialRegister] result', res.status, res.data);

    // 응답이 다른 상품 id를 가리키면 즉시 중단 (안전장치)
    try {
      console.log('[SpecialRegister] response id guard check', {
        expected: productIdNum,
        got: res?.data && (res.data as any).id,
      });
      const resId = res?.data && (res.data as any).id ? Number((res.data as any).id) : undefined;
      if (resId != null && Number.isFinite(resId) && String(resId) !== String(productIdNum)) {
        console.warn('[SpecialRegister] Warning: response id mismatch', {
          expected: productIdNum,
          got: resId,
          data: res.data,
        });
        alert('응답의 상품 ID가 일치하지 않습니다. 상품 상세에서 다시 시도해 주세요.');
        return;
      }
    } catch {}

    if (res.status >= 200 && res.status < 300) {
      // per-product 기본 시간 저장(다음에 자동 제안)
      saveSpecialTimes(draft.name, startTime, endTime);
      try {
        saveLastSpecial(productIdNum, Number(draft.price), String(draft.unit), startTime, endTime);
      } catch {}

      // 기존 퍼블리싱용 로컬 상태도 유지(홈 배너 등 임시 UI 호환)
      try {
        localStorage.setItem(
          'merchantHome:specialCurrent',
          JSON.stringify({
            name: draft.name,
            price: draft.price,
            unit: draft.unit,
            startTime,
            endTime,
            createdAt: Date.now(),
          })
        );
      } catch {}

      try {
        sessionStorage.setItem('special:lastFrom', returnTo);
      } catch {}

      navigate(returnTo);
      return;
    }

    const msg =
      typeof res.data === 'string' ? res.data : res.data?.message || '특가 등록에 실패했습니다.';
    alert(msg);
  };

  return (
    <>
      <Header />
      <C.ProductCreate>
        <C.Title>오늘 안 팔면 손해, 특가 상품 등록해요</C.Title>

        {/* Mode toggle + voice record */}
        <ModeHeader
          mode={mode}
          setMode={setMode}
          running={wizard.running}
          onStart={() => wizard.start()}
          onStop={() => wizard.stop()}
        />

        {/* ==== 상품 기본 입력 (품명/가격/단위/재고) ==== */}
        <ProductFields
          value={draft}
          onChange={setDraft}
          disabled={isVoice}
          isVoice={isVoice}
          onVoiceAsk={ask}
          nameClassName="special"
          lockName="auto"
        />

        {/* ==== 특가 시간 입력 ==== */}
        <C.Gap />
        <S.TimeGrid>
          <S.TimeCol>
            <S.TimeButton
              type="button"
              onClick={() => {
                setWhichPicker('start');
                setOpen(true);
              }}
            >
              <S.Label>시작</S.Label>
              <S.Time>{formatKoreanTime(startTime)}</S.Time>
            </S.TimeButton>
            <S.HiddenTimeInput
              id="special-start"
              type="time"
              value={startTime}
              onChange={(e) => setStartTime(e.target.value)}
            />
          </S.TimeCol>

          <S.TimeCol>
            <S.TimeButton
              type="button"
              onClick={() => {
                setWhichPicker('end');
                setOpen(true);
              }}
            >
              <S.Label>종료</S.Label>
              <S.Time>{formatKoreanTime(endTime)}</S.Time>
            </S.TimeButton>
            <S.HiddenTimeInput
              id="special-end"
              type="time"
              value={endTime}
              onChange={(e) => setEndTime(e.target.value)}
            />
          </S.TimeCol>
        </S.TimeGrid>

        <TimeModal
          open={open}
          title={whichPicker === 'start' ? '몇 시부터 이렇게 팔까요?' : '몇 시까지 이렇게 팔까요?'}
          onCancel={() => {
            setOpen(false);
            setWhichPicker(null);
          }}
          onSave={(t) => {
            const hhmm = toHHMM(t);
            if (whichPicker === 'start') setStartTime(hhmm || startTime);
            else if (whichPicker === 'end') setEndTime(hhmm || endTime);

            setOpen(false);
            setWhichPicker(null);
          }}
        />

        {/* 미리보기 패널(확인 버튼 누르면 저장) */}
        <C.Gap />
        {canPreview && (
          <PreviewPanel title="이렇게 특가 설정할게요" onConfirm={handleSave}>
            <ProductList title={undefined} items={previewItems} showAddButton={false} />
          </PreviewPanel>
        )}
      </C.ProductCreate>
    </>
  );
}

export default SpecialRegister;
