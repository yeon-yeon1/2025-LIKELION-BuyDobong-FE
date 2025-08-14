/**
 * InputModeToggle
 *
 * 입력 방식(음성 / 텍스트)을 토글하는 UI 컴포넌트입니다.
 *
 * @example
 * import InputModeToggle, { type InputMode } from '@components/common/InputModeToggle';
 *
 * const [mode, setMode] = useState<InputMode>('voice');
 *
 * return (
 *   <InputModeToggle
 *     value={mode} // 현재 모드 ('voice' | 'text')
 *     onChange={(next) => setMode(next)} // 모드 변경 핸들러
 *   />
 *
 * @prop value - 현재 모드 값 ('voice' | 'text')
 * @prop onChange - 모드 변경 콜백 함수
 */

import React from 'react';
import * as S from '@styles/merchant/component/InputModeToggleStyle';

export type InputMode = 'voice' | 'text';

export interface InputModeToggleProps {
  value: InputMode;
  onChange: (next: InputMode) => void;
  disabled?: boolean;
  className?: string;
  labels?: { voice: string; text: string };
}

export default function InputModeToggle({
  value,
  onChange,
  disabled = false,
  className,
  labels = { voice: '음성', text: '텍스트' },
}: InputModeToggleProps) {
  const isVoice = value === 'voice';

  return (
    <S.Wrap
      role="switch"
      aria-checked={isVoice}
      tabIndex={disabled ? -1 : 0}
      $disabled={disabled}
      className={className}
    >
      <S.Knob $pos={isVoice ? 'left' : 'right'} />
      <S.Segment
        type="button"
        onClick={() => !disabled && onChange('voice')}
        $active={isVoice}
        disabled={disabled}
      >
        {labels.voice}
      </S.Segment>
      <S.Segment
        type="button"
        onClick={() => !disabled && onChange('text')}
        $active={!isVoice}
        disabled={disabled}
      >
        {labels.text}
      </S.Segment>
    </S.Wrap>
  );
}
