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
export type TimeValue = { meridiem: Meridiem; hour: number; minute: number };

export interface TimeModalProps {
  open: boolean;
  title?: string;
  initial?: TimeValue;
  onCancel: () => void;
  onSave: (time: TimeValue) => void;
  className?: string;
}

const ITEM_H = 44; // 리스트 아이템 높이(px)

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
  initial = { meridiem: '오전', hour: 2, minute: 28 },
  onCancel,
  onSave,
  className,
}: TimeModalProps) {
  const [meridiem, setMeridiem] = useState<Meridiem>(initial.meridiem);
  const [hour, setHour] = useState<number>(initial.hour);
  const [minute, setMinute] = useState<number>(initial.minute);

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
    scrollToIndex(hourRef.current, to12(hour) - 1, 'auto');
    scrollToIndex(minRef.current, minute, 'auto');
  }, [open]);

  const onScrollEnd = (el: HTMLUListElement, onPick: (idx: number) => void) => {
    const idx = Math.round(el.scrollTop / ITEM_H);
    scrollToIndex(el, idx);
    onPick(idx);
  };

  const handleClickMeridiem = (idx: number) => {
    scrollToIndex(merRef.current, idx);
    setMeridiem(idx === 0 ? '오전' : '오후');
  };

  const handleClickHour = (idx: number) => {
    scrollToIndex(hourRef.current, idx);
    setHour(meridiem === '오전' ? (idx + 1) % 12 : ((idx + 1) % 12) + 12);
  };

  const handleClickMinute = (idx: number) => {
    scrollToIndex(minRef.current, idx);
    setMinute(idx);
  };

  const handleScrollMeridiem = (el: HTMLUListElement) => {
    const raw = Math.round(el.scrollTop / ITEM_H);
    const idx = clamp(raw, 1); // 0~1
    setMeridiem(idx === 0 ? '오전' : '오후');
  };

  const handleScrollHour = (el: HTMLUListElement) => {
    const raw = Math.round(el.scrollTop / ITEM_H);
    const idx = clamp(raw, 11); // 0~11
    setHour(meridiem === '오전' ? (idx + 1) % 12 : ((idx + 1) % 12) + 12);
  };

  const handleScrollMinute = (el: HTMLUListElement) => {
    const raw = Math.round(el.scrollTop / ITEM_H);
    const idx = clamp(raw, 59); // 0~59
    setMinute(idx);
  };

  const pad2 = (n: number) => `${n}`.padStart(2, '0');
  const to12 = (h: number) => {
    const v = h % 12;
    return v === 0 ? 12 : v;
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
                  onScrollEnd(e.currentTarget, (i) =>
                    setHour(meridiem === '오전' ? (i + 1) % 12 : ((i + 1) % 12) + 12)
                  )
                );
              }}
            >
              {hours.map((h, i) => (
                <S.Item key={h} aria-selected={to12(hour) === h} onClick={() => handleClickHour(i)}>
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
          <S.BtnPrimary type="button" onClick={() => onSave({ meridiem, hour, minute })}>
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
