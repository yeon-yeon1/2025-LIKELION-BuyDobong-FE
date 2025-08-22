/**
 * TimeModal (휠/다이얼 타임 피커)
 * - iOS 타이머처럼 스르륵 스크롤되는 3열 휠(오전/오후, 시, 분)
 * - 스타일은 TimeModalStyle.ts로 분리
 *
 * @example
 * import TimeModal from '@components/merchant/TimeModal';
 * <TimeModal open={open} onCancel={close} onSave={(t)=>console.log(t)} />
 */

import React, { useEffect, useMemo, useRef, useState } from 'react';
import * as S from '@styles/merchant/component/TimeModalStyle';

export type Meridiem = '오전' | '오후';

export interface TimeModalProps {
  open: boolean;
  title?: string;
  /** 24시간제 입력 값 (예: '17:30') */
  value?: string;
  onCancel: () => void;
  /** 24시간제 출력 값 (예: 'HH:MM') */
  onSave: (hhmm: string) => void;
  className?: string;
}

const ITEM_H = 44; // 리스트 아이템 높이(px)

function pad2(n: number) {
  return `${n}`.padStart(2, '0');
}

function to12(h: number) {
  const v = h % 12;
  return v === 0 ? 12 : v;
}

/** 'HH:MM' -> { meridiem, hour(24h), minute } */
function parse24(hhmm: string) {
  const m = /^(\d{2}):(\d{2})$/.exec(hhmm || '');
  if (!m) return { meridiem: '오전' as Meridiem, hour: 0, minute: 0 };
  const H = Number(m[1]);
  const M = Number(m[2]);
  return {
    meridiem: H < 12 ? ('오전' as Meridiem) : ('오후' as Meridiem),
    hour: H,
    minute: M,
  };
}

/** { meridiem, hour(24h), minute } -> 'HH:MM' */
function to24h(meridiem: Meridiem, hour24: number, minute: number) {
  // hour24는 내부 상태를 24시간 값으로 유지
  return `${pad2(hour24)}:${pad2(minute)}`;
}

function clamp(idx: number, max: number) {
  if (idx < 0) return 0;
  if (idx > max) return max;
  return idx;
}

function scrollToIndex(
  el: HTMLUListElement | null,
  idx: number,
  behavior: ScrollBehavior = 'smooth'
) {
  if (!el) return;
  el.scrollTo({ top: idx * ITEM_H, behavior });
}

export default function TimeModal({
  open,
  title = '몇 시부터 이렇게 팔까요?',
  value,
  onCancel,
  onSave,
  className,
}: TimeModalProps) {
  const parsed = useMemo(() => parse24(value ?? ''), [value]);
  const [meridiem, setMeridiem] = useState<Meridiem>(parsed.meridiem);
  const [hour24, setHour24] = useState<number>(parsed.hour);
  const [minute, setMinute] = useState<number>(parsed.minute);

  // props.value가 바뀌면 내부 상태 동기화
  useEffect(() => {
    setMeridiem(parsed.meridiem);
    setHour24(parsed.hour);
    setMinute(parsed.minute);
  }, [parsed.meridiem, parsed.hour, parsed.minute]);

  const hours = useMemo(() => Array.from({ length: 12 }, (_, i) => i + 1), []); // 1~12
  const minutes = useMemo(() => Array.from({ length: 60 }, (_, i) => i), []);

  // refs
  const merRef = useRef<HTMLUListElement>(null);
  const hourRef = useRef<HTMLUListElement>(null);
  const minRef = useRef<HTMLUListElement>(null);

  // 초기 스크롤 위치
  useEffect(() => {
    if (!open) return;
    scrollToIndex(merRef.current, meridiem === '오전' ? 0 : 1, 'auto');
    scrollToIndex(hourRef.current, to12(hour24) - 1, 'auto');
    scrollToIndex(minRef.current, minute, 'auto');
  }, [open]);

  const onScrollEnd = (el: HTMLUListElement, onPick: (idx: number) => void) => {
    const idx = Math.round(el.scrollTop / ITEM_H);
    scrollToIndex(el, idx);
    onPick(idx);
  };

  const handleClickMeridiem = (idx: number) => {
    scrollToIndex(merRef.current, idx);
    const next = idx === 0 ? '오전' : '오후';
    setMeridiem(next);
    setHour24((prev) => {
      if (next === '오전') {
        // 13~23 -> 1~11, 12 -> 0
        return prev >= 12 ? (prev === 12 ? 0 : prev - 12) : prev;
      } else {
        // 0 -> 12, 1~11 -> 13~23
        return prev < 12 ? (prev === 0 ? 12 : prev + 12) : prev;
      }
    });
  };

  const handleClickHour = (idx: number) => {
    scrollToIndex(hourRef.current, idx);
    const twelve = (idx + 1) % 12; // 0..11 -> 1..12 모듈러 변환용
    const h = twelve === 0 ? 12 : twelve; // 1..12
    if (meridiem === '오전') {
      // 오전 12시는 0시
      setHour24(h === 12 ? 0 : h);
    } else {
      // 오후 12시는 12시
      setHour24(h === 12 ? 12 : h + 12);
    }
  };

  const handleClickMinute = (idx: number) => {
    scrollToIndex(minRef.current, idx);
    setMinute(idx);
  };

  const handleScrollMeridiem = (el: HTMLUListElement) => {
    const raw = Math.round(el.scrollTop / ITEM_H);
    const idx = clamp(raw, 1);
    const next = idx === 0 ? '오전' : '오후';
    if (next !== meridiem) {
      setMeridiem(next);
      setHour24((prev) => {
        if (next === '오전') return prev >= 12 ? (prev === 12 ? 0 : prev - 12) : prev;
        return prev < 12 ? (prev === 0 ? 12 : prev + 12) : prev;
      });
    }
  };

  const handleScrollHour = (el: HTMLUListElement) => {
    const raw = Math.round(el.scrollTop / ITEM_H);
    const idx = clamp(raw, 11);
    const twelve = (idx + 1) % 12;
    const h = twelve === 0 ? 12 : twelve;
    if (meridiem === '오전') {
      setHour24(h === 12 ? 0 : h);
    } else {
      setHour24(h === 12 ? 12 : h + 12);
    }
  };

  const handleScrollMinute = (el: HTMLUListElement) => {
    const raw = Math.round(el.scrollTop / ITEM_H);
    const idx = clamp(raw, 59);
    setMinute(idx);
  };

  if (!open) return null;

  return (
    <S.Backdrop onClick={onCancel}>
      <S.Sheet
        role="dialog"
        aria-modal="true"
        onClick={(e) => e.stopPropagation()}
        className={className}
      >
        <S.Title>{title}</S.Title>

        <S.PickerWrap>
          <S.CenterBar />

          <S.Column>
            <S.List
              ref={merRef}
              onScroll={(e) => {
                handleScrollMeridiem(e.currentTarget);
                debounce(() =>
                  onScrollEnd(e.currentTarget, (i) => setMeridiem(i === 0 ? '오전' : '오후'))
                );
              }}
            >
              {['오전', '오후'].map((m, i) => (
                <S.Item
                  key={m}
                  aria-selected={m === meridiem}
                  onClick={() => handleClickMeridiem(i)}
                >
                  {m}
                </S.Item>
              ))}
            </S.List>
          </S.Column>

          <S.Column>
            <S.List
              ref={hourRef}
              onScroll={(e) => {
                handleScrollHour(e.currentTarget);
                debounce(() =>
                  onScrollEnd(e.currentTarget, (i) => {
                    const twelve = (i + 1) % 12;
                    const h = twelve === 0 ? 12 : twelve;
                    if (meridiem === '오전') {
                      setHour24(h === 12 ? 0 : h);
                    } else {
                      setHour24(h === 12 ? 12 : h + 12);
                    }
                  })
                );
              }}
            >
              {hours.map((h, i) => (
                <S.Item
                  key={h}
                  aria-selected={to12(hour24) === h}
                  onClick={() => handleClickHour(i)}
                >
                  {pad2(h)}
                </S.Item>
              ))}
            </S.List>
          </S.Column>

          <S.Column>
            <S.List
              ref={minRef}
              onScroll={(e) => {
                handleScrollMinute(e.currentTarget);
                debounce(() => onScrollEnd(e.currentTarget, (i) => setMinute(i)));
              }}
            >
              {minutes.map((m, i) => (
                <S.Item key={m} aria-selected={m === minute} onClick={() => handleClickMinute(i)}>
                  {pad2(m)}
                </S.Item>
              ))}
            </S.List>
          </S.Column>
        </S.PickerWrap>

        <S.Footer>
          <S.BtnGhost type="button" onClick={onCancel}>
            취소
          </S.BtnGhost>
          <S.BtnPrimary type="button" onClick={() => onSave(to24h(meridiem, hour24, minute))}>
            저장
          </S.BtnPrimary>
        </S.Footer>
      </S.Sheet>
    </S.Backdrop>
  );
}

let t: number | null = null;
function debounce(fn: () => void, delay = 80) {
  if (t) window.clearTimeout(t);
  t = window.setTimeout(() => {
    fn();
    t = null;
  }, delay);
}
