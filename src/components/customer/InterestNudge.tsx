import React, { useEffect, useRef, useState } from 'react';
import styled from 'styled-components';
import HeartOn from '@assets/InterestedOn.svg?react';
import HeartAdd from '@assets/GrayHeart.svg?react';
import palette from '@lib/colorPalette';
import { createKeyword, deleteKeyword, listKeywords } from '@lib/api/keywords';

type Props = {
  show: boolean;
  keyword: string;
  interested?: boolean;
  /** 키보드와의 간격(px). 기존 bottomOffset → gap 개념으로 사용 */
  bottomOffset?: number;
  restoreFocusTo?: () => HTMLElement | null;
  /** 로그인 상태 */
  isLoggedIn?: boolean;
  /** 로그인 안내 모달 띄우기 */
  onLoginRequired?: () => void;
};

export default function InterestNudge({
  show,
  keyword,
  interested,
  bottomOffset = 12, // ← "키보드 위 12px" 기본 간격
  restoreFocusTo,
  isLoggedIn = true,
  onLoginRequired,
}: Props) {
  const dockRef = useRef<HTMLDivElement>(null);
  const [saving, setSaving] = useState(false);

  // 키보드(=visual viewport) 보정 값
  const [kb, setKb] = useState(0);

  // 내 관심 키워드 Set (소문자/trim 정규화)
  const [kwSet, setKwSet] = useState<Set<string>>(new Set());
  const [on, setOn] = useState(!!interested);
  const fetchedRef = useRef(false);
  const norm = (w: string) => w.trim().toLowerCase();

  /* ===== 키보드(VisualViewport) 반영 ===== */
  useEffect(() => {
    const vv = (window as any).visualViewport as VisualViewport | undefined;

    const update = () => {
      const v = (window as any).visualViewport as VisualViewport | undefined;
      if (!v) {
        setKb(0);
        return;
      }
      // 레이아웃 viewport(=window.innerHeight) 대비 하단이 잘린 만큼을 계산
      const overlap = Math.max(0, window.innerHeight - (v.height + v.offsetTop));
      setKb(overlap); // 키보드가 차지한 높이 추정
    };

    update();

    if (vv) {
      vv.addEventListener('resize', update);
      vv.addEventListener('scroll', update);
      return () => {
        vv.removeEventListener('resize', update);
        vv.removeEventListener('scroll', update);
      };
    }

    // 폴백: viewport API 없으면 스크롤에 맞춰 0으로
    const onScroll = () => setKb(0);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  /* ===== inert + 포커스 복구 ===== */
  useEffect(() => {
    const el = dockRef.current;
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

  /* ===== 처음 열릴 때 1회 목록 조회 ===== */
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

  /* ===== keyword / interested / kwSet 동기화 ===== */
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

  /* ===== 등록/해제 ===== */
  const handleAdd = async () => {
    const kRaw = keyword.trim();
    const k = norm(kRaw);
    if (!k || saving) return;

    // 로그인하지 않은 경우 로그인 안내 모달 띄우기
    if (!isLoggedIn) {
      onLoginRequired?.();
      return;
    }

    if (kwSet.has(k)) {
      setOn(true);
      return;
    }
    setSaving(true);
    try {
      await createKeyword(kRaw);
      setKwSet((prev) => new Set(prev).add(k));
      setOn(true);
    } catch (e: any) {
      if (e?.response?.status === 409) {
        setKwSet((prev) => new Set(prev).add(k));
        setOn(true);
      }
    } finally {
      setSaving(false);
    }
  };

  const handleRemove = async () => {
    const kRaw = keyword.trim();
    const k = norm(kRaw);
    if (!k || saving) return;
    if (!kwSet.has(k)) {
      setOn(false);
      return;
    }
    setSaving(true);
    try {
      await deleteKeyword(kRaw);
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
    <Dock
      ref={dockRef}
      style={
        {
          // 키보드 높이만큼 위로 올림
          transform: `translateY(-${kb}px)`,
          // safe-area + 원하는 간격
          '--gap': `${bottomOffset}px`,
        } as React.CSSProperties
      }
    >
      <Wrap data-show={show ? 'y' : undefined}>
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
    </Dock>
  );
}

/* ===== styled ===== */

/** 고정 도킹 레이어 */
const Dock = styled.div`
  position: fixed;
  /* left: 12px; */
  left: calc(50% - 195px + 22px);
  top: 700px;
  z-index: 2000;
  pointer-events: none; /* 내부에서 켬 */

  @media (hover: none) and (pointer: coarse) {
    left: 12px;
    bottom: calc(env(safe-area-inset-bottom, 0px) + var(--gap, 12px));
  }
`;

/** 실제 배지 래퍼: 표시/숨김 트랜지션만 담당 */
const Wrap = styled.div`
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
  display: grid;
  place-items: center;
  cursor: pointer;
  border: none;
  background-color: transparent;
  & > svg {
    width: 44px;
    height: 44px;
    display: block;
  }
`;
