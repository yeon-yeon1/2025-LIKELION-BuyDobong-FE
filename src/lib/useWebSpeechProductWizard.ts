import { useCallback, useRef, useState } from 'react';
import { speak, createRecognition } from './webSpeech';
import type { ProductDraft } from '@components/merchant/ProductFields';

// 음성으로 채울 수 있는 항목 키
export type StepKey = 'name' | 'price' | 'unit' | 'stock';

const steps: { key: StepKey; prompt: string }[] = [
  { key: 'name', prompt: '품명을 말씀해주세요.' },
  { key: 'price', prompt: '가격을 말씀해주세요.' },
  { key: 'unit', prompt: '단위를 말씀해주세요.' },
  { key: 'stock', prompt: '재고는 충분함, 적음, 없음 중에 말씀해주세요.' },
];

const parsePrice = (s: string) => {
  const onlyNum = s.replace(/[^\d]/g, '');
  return onlyNum ? Number(onlyNum) : null;
};
const normalizeUnit = (s: string) => s.replace(/\s+/g, ' ').trim();
const mapStock = (s: string): ProductDraft['stock'] => {
  const t = s.toLowerCase();
  if (t.includes('없')) return '없음';
  if (t.includes('적') || t.includes('부족')) return '적음';
  return '충분함';
};

export function useWebSpeechProductWizard(
  setDraft: (updater: (prev: ProductDraft) => ProductDraft) => void
) {
  const [running, setRunning] = useState(false);
  const [prompt, setPrompt] = useState('마이크 버튼으로 시작하세요.');
  const recRef = useRef<SpeechRecognition | null>(null);

  // 외부에서 "이 항목만 물어봐" 힌트를 줄 때 보관
  const focusFieldRef = useRef<StepKey | null>(null);

  const recognizeOnce = () =>
    new Promise<string>((resolve, reject) => {
      const rec = createRecognition();
      if (!rec) return reject(new Error('이 브라우저는 음성 인식을 지원하지 않습니다.'));
      recRef.current = rec;
      rec.onresult = (e) => resolve(e.results[0][0].transcript || '');
      rec.onerror = (e: any) => reject(e.error || 'recognition error');
      rec.onend = () => {};
      rec.start();
    });

  const applyHeard = useCallback(
    (key: StepKey, heard: string) => {
      setDraft((prev) => {
        const next = { ...prev };
        if (key === 'name') next.name = heard || prev.name;
        if (key === 'price') next.price = parsePrice(heard) ?? prev.price;
        if (key === 'unit') next.unit = normalizeUnit(heard) || prev.unit;
        if (key === 'stock') next.stock = mapStock(heard);
        return next;
      });
    },
    [setDraft]
  );

  const askStep = useCallback(
    async (key: StepKey) => {
      const s = steps.find((st) => st.key === key)!;
      setPrompt(s.prompt);
      speak(s.prompt);
      const heard = await recognizeOnce();
      applyHeard(key, heard);
    },
    [applyHeard]
  );

  // 전체 진행 or 지정된 항목만 진행
  const start = useCallback(
    async (field?: StepKey) => {
      if (running) return;
      if (!createRecognition()) {
        setPrompt('이 브라우저는 음성 인식을 지원하지 않습니다.');
        return;
      }

      setRunning(true);
      try {
        const target: StepKey | null = field ?? focusFieldRef.current ?? null;
        if (target) {
          // 단일 항목만 질문
          await askStep(target);
        } else {
          // 전체 순서대로 질문
          for (const s of steps) {
            await askStep(s.key);
          }
        }
        setPrompt('완료되었습니다.');
      } catch {
        setPrompt('인식이 중단되었습니다.');
      } finally {
        setRunning(false);
        try {
          recRef.current?.abort();
        } catch {}
        // 단일 포커스는 1회성으로 사용
        focusFieldRef.current = null;
      }
    },
    [askStep, running]
  );

  // 외부에서 "이 항목만"을 지정하고 싶을 때 사용
  const startSingle = useCallback(
    async (field: StepKey) => {
      return start(field);
    },
    [start]
  );

  const setFocusField = useCallback((field: StepKey | null) => {
    focusFieldRef.current = field;
  }, []);

  const stop = useCallback(() => {
    try {
      recRef.current?.abort();
    } catch {}
    setRunning(false);
    setPrompt('중지했습니다.');
  }, []);

  return { running, prompt, start, stop, startSingle, setFocusField };
}
