import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import HeartOn from '@assets/InterestedOn.svg?react';
import HeartAdd from '@assets/GrayHeart.svg?react';
import palette from '@lib/colorPalette';
import { createKeyword, deleteKeyword, listKeywords } from '@lib/api/keywords';

type Props = {
  show: boolean;
  keyword: string;
  interested?: boolean; // 외부 제어값 있으면 우선
  bottomOffset?: number;
  restoreFocusTo?: () => HTMLElement | null; // 숨길 때 포커스 되돌릴 대상
};

export default function InterestNudge({
  show,
  keyword,
  interested,
  bottomOffset = 96,
  restoreFocusTo,
}: Props) {
  const wrapRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  // 내 관심 키워드 Set (소문자/trim 정규화)
  const [kwSet, setKwSet] = useState<Set<string>>(new Set());
  const [on, setOn] = useState(!!interested);
  const fetchedRef = useRef(false);
  const norm = (w: string) => w.trim().toLowerCase();

  // inert + 포커스 복구
  useEffect(() => {
    const el = wrapRef.current;
    if (!el) return;

    if (!show) {
      el.setAttribute('inert', '');
      const active = document.activeElement as HTMLElement | null;
      if (active && el.contains(active)) {
        const t = restoreFocusTo?.();
        if (t) t.focus();
        else active.blur();
      }
    } else {
      el.removeAttribute('inert');
    }
  }, [show, restoreFocusTo]);

  // 처음 열릴 때 1회 목록 조회 (이미 가져왔으면 생략)
  useEffect(() => {
    if (!show || fetchedRef.current) return;
    fetchedRef.current = true;
    (async () => {
      try {
        const list = await listKeywords();
        setKwSet(new Set(list.map((it) => norm(it.word))));
      } catch {
        // 조회 실패해도 UI는 계속
      }
    })();
  }, [show]);

  // keyword / interested / kwSet 변동 시 on 상태 계산
  useEffect(() => {
    const k = norm(keyword);
    if (!k) {
      setOn(false);
      return;
    }
    if (typeof interested === 'boolean') {
      setOn(interested);
      return;
    }
    setOn(kwSet.has(k));
  }, [keyword, interested, kwSet]);

  // 등록
  const handleAdd = async () => {
    const kRaw = keyword.trim();
    const k = norm(kRaw);
    if (!k || saving) return;

    // 이미 있다면 서버 안 두드리고 즉시 on
    if (kwSet.has(k)) {
      setOn(true);
      return;
    }

    setSaving(true);
    try {
      await createKeyword(kRaw);
      // 낙관적 업데이트
      setKwSet((prev) => new Set(prev).add(k));
      setOn(true);
    } catch (e: any) {
      // 중복(409)도 성공으로 간주
      if (e?.response?.status === 409) {
        setKwSet((prev) => new Set(prev).add(k));
        setOn(true);
      }
    } finally {
      setSaving(false);
    }
  };

  // 해제
  const handleRemove = async () => {
    const kRaw = keyword.trim();
    const k = norm(kRaw);
    if (!k || saving) return;

    // 없다면 서버 안 두드리고 즉시 off
    if (!kwSet.has(k)) {
      setOn(false);
      return;
    }

    setSaving(true);
    try {
      await deleteKeyword(kRaw);
      // 낙관적 업데이트
      setKwSet((prev) => {
        const next = new Set(prev);
        next.delete(k);
        return next;
      });
      setOn(false);
    } finally {
      setSaving(false);
    }
  };

  const disabled = saving || !show;

  return (
    <Wrap
      ref={wrapRef}
      data-show={show ? 'y' : undefined}
      style={{ bottom: `calc(env(safe-area-inset-bottom, 0px) + ${bottomOffset}px)` }}
    >
      {on ? (
        <Circle
          type="button"
          aria-label="관심 키워드 해제"
          onMouseDown={(e) => e.preventDefault()} // 인풋 blur 방지
          onClick={handleRemove}
          disabled={disabled}
        >
          <HeartOn />
        </Circle>
      ) : (
        <Pill
          type="button"
          aria-label="관심키워드 등록"
          onMouseDown={(e) => e.preventDefault()} // 인풋 blur 방지
          onClick={handleAdd}
          disabled={disabled}
        >
          <Icon aria-hidden>
            <HeartAdd />
          </Icon>
          <Label>관심키워드 등록</Label>
        </Pill>
      )}
    </Wrap>
  );
}

/* ===== styled ===== */
const Wrap = styled.div`
  position: fixed;
  left: 12px;
  z-index: 2000;
  opacity: 0;
  transform: translateY(8px);
  transition: opacity 160ms ease, transform 160ms ease;
  pointer-events: none;

  &[data-show='y'] {
    opacity: 1;
    transform: translateY(0);
    pointer-events: auto;
  }
`;

const Pill = styled.button`
  display: inline-flex;
  align-items: center;
  gap: 10px;
  padding: 12px 16px 12px 12px;
  border: none;
  border-radius: 999px;
  background: #fff;
  color: #555e62;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  cursor: pointer;
`;

const Icon = styled.span`
  display: inline-grid;
  place-items: center;
  width: 32px;
  height: 32px;
  border-radius: 999px;
  background: #f2f4f5;
  color: #b8bfc3;
  & > svg {
    display: block;
    width: 18px;
    height: 18px;
  }
  & > svg * {
    fill: currentColor;
    stroke: currentColor;
  }
`;

const Label = styled.span`
  font-size: 14px;
  font-weight: 600;
  color: ${palette.textSecondary};
`;

const Circle = styled.button`
  width: 44px;
  height: 44px;
  border: none;
  box-shadow: 0 6px 18px rgba(0, 0, 0, 0.15);
  display: grid;
  place-items: center;
  cursor: pointer;
  & > svg {
    width: 44px;
    height: 44px;
    display: block;
  }
`;
