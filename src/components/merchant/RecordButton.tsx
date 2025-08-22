/*
 * RecordButton (공통)
 * - 클릭 시 상태가 `idle` ↔ `recording` 으로 전환되는 버튼
 * - 아이콘: idle = RecordStart.svg, recording = Recording.svg
 * - **컨트롤드/언컨트롤드** 모두 지원
 *    - 컨트롤드: `status`를 넘기면 내부 상태를 사용하지 않고, 클릭 시 `onToggle(next)`로 다음 상태를 알려줍니다.
 *    - 언컨트롤드: `status`를 넘기지 않으면 `initialStatus`로 내부 상태를 관리합니다.
 *
 * @example
 * // 컨트롤드 사용 예
 * <RecordButton
 *   status={running ? 'recording' : 'idle'}
 *   onToggle={(next) => setRunning(next === 'recording')}
 * />
 *
 * // 언컨트롤드 사용 예
 * <RecordButton initialStatus="idle" onToggle={(next) => console.log(next)} />
 *
 * @prop {"idle"|"recording"} [status]              - 컨트롤드 상태 값(지정 시 내부 상태 미사용)
 * @prop {"idle"|"recording"} [initialStatus="idle"] - 언컨트롤드 초기값
 * @prop {function} [onToggle]                         - 토글될 다음 상태 콜백
 * @prop {function} [onClick]                          - 클릭 알림(선택)
 * @prop {string}   [className]                        - 외부 스타일 확장용(선택)
 */

import React, { useState } from 'react';
import * as S from '@styles/merchant/component/RecordButtonStyle';
import RecordStart from '@assets/RecordStart.svg?react';
import Recording from '@assets/Recording.svg?react';

export type RecordStatus = 'idle' | 'recording';

export interface RecordButtonProps {
  status?: RecordStatus;
  initialStatus?: RecordStatus;
  className?: string;
  onToggle?: (next: RecordStatus) => void;
  onClick?: () => void;
}

export default function RecordButton({
  status,
  initialStatus = 'idle',
  className,
  onToggle,
  onClick,
}: RecordButtonProps) {
  const isControlled = status !== undefined;
  const [inner, setInner] = useState<RecordStatus>(initialStatus);

  const current: RecordStatus = (isControlled ? status : inner) as RecordStatus;
  const isRecording = current === 'recording';

  const handleClick = () => {
    const next: RecordStatus = isRecording ? 'idle' : 'recording';

    // 언컨트롤드일 때만 내부 상태 변경
    if (!isControlled) setInner(next);

    // 부모에게 다음 상태 전달(컨트롤드/언컨트롤드 공통)
    onToggle?.(next);

    // 선택: 클릭 알림
    onClick?.();
  };

  return (
    <S.Button
      type="button"
      onClick={handleClick}
      $recording={isRecording}
      className={className}
      aria-pressed={isRecording}
    >
      {isRecording ? <Recording /> : <RecordStart />}
    </S.Button>
  );
}
