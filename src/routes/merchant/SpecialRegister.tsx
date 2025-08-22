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
    ((navState as any)?.id && (navState as any)?.name
      ? (navState as unknown as ProductItem)
      : undefined);

  const [mode, setMode] = useState<InputMode>(() => {
    const m = navState.mode ?? navState.defaultMode;
    return m === 'voice' || m === 'text' ? m : 'voice';
  });
  useEffect(() => {
    const m = navState.mode ?? navState.defaultMode;
    if (m === 'voice' || m === 'text') setMode(m);
  }, [navState.mode, navState.defaultMode]);
  const isVoice = mode === 'voice';

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
    if (passedItem) {
      setDraft({
        name: passedItem.name,
        price: passedItem.price,
        unit: passedItem.unit,
        stock: passedItem.stock,
      });
      const t = loadSpecialTimes(passedItem.name);
      if (t) {
        setStartTime(t.startTime);
        setEndTime(t.endTime);
      }
    }
  }, [passedItem]);

  // 사용자가 품명만 입력해도 기존 상품 목록(localStorage: 'product:list')에서
  // 동일 품명을 찾아 가격/단위/재고를 자동 채움
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
      }
    } catch {}
  }, [draft.name]);

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

  // 저장(퍼블리싱용 로컬 스토리지 예시)
  const handleSave = () => {
    if (!canPreview) return;

    // 1) 특가 목록에 누적 저장 (퍼블리싱 용)
    try {
      const raw = localStorage.getItem('product:specials');
      const specials: any[] = raw ? JSON.parse(raw) : [];
      const entry = {
        id: `sp-${Date.now()}`,
        name: draft.name,
        price: draft.price,
        unit: draft.unit,
        stock: draft.stock,
        startTime, // already HH:MM (24-hour)
        endTime, // already HH:MM (24-hour)
        createdAt: Date.now(),
      };
      specials.unshift(entry);
      localStorage.setItem('product:specials', JSON.stringify(specials));

      // 2) 홈 화면 배너/카드에서 바로 사용할 "현재 진행중 특가" 단일 상태도 저장
      //    MerchantHome에서는 아래 키를 읽어 시간 뱃지를 24시간 형태(HH:MM - HH:MM)로 그대로 표시하면 됩니다.
      localStorage.setItem(
        'merchantHome:specialCurrent',
        JSON.stringify({
          name: draft.name,
          price: draft.price,
          unit: draft.unit,
          startTime,
          endTime,
          createdAt: entry.createdAt,
        })
      );

      saveSpecialTimes(draft.name, startTime, endTime);
    } catch {}

    try {
      sessionStorage.setItem('special:lastFrom', returnTo);
    } catch {}

    // 3) 저장 후 이전 화면으로 이동 (결정된 returnTo 사용)
    navigate(returnTo);
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
