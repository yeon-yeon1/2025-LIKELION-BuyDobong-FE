/*
 * RecordButton (공통)
 * - 클릭할 때마다 상태가 `idle` ↔ `recording`으로 토글되는 공통 컴포넌트
 * - 아이콘: idle = RecordStart.svg, recording = Recording.svg
 * - 외부 상태가 필요 없으며, 초기 상태만 `initialStatus`로 지정 가능
 *
 * @example
 * import RecordButton from '@components/merchant/RecordButton';
 *
 * <RecordButton initialStatus="idle" />;
 *
 * @prop {"idle"|"recording"} [initialStatus="idle"] - 초기 상태 (선택)
 * @prop {string} [className]                           - 외부 스타일 확장용 (선택)
 */

import React, { useState } from 'react';
import * as S from '@styles/merchant/component/RecordButtonStyle';
import RecordStart from '@assets/RecordStart.svg?react';
import Recording from '@assets/Recording.svg?react';

export type RecordStatus = 'idle' | 'recording';

export interface RecordButtonProps {
  initialStatus?: RecordStatus;
  className?: string;
}

export default function RecordButton({ initialStatus = 'idle', className }: RecordButtonProps) {
  const [status, setStatus] = useState<RecordStatus>(initialStatus);
  const isRecording = status === 'recording';

  const handleClick = () => {
    setStatus((prev) => (prev === 'idle' ? 'recording' : 'idle'));
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
