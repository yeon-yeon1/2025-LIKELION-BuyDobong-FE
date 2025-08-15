/**
 * BusinessStatusToggle
 *
 * 영업 상태(영업중 / 영업종료)를 토글하는 UI 컴포넌트입니다.
 *
 * @example
 * import BusinessStatusToggle, { type BusinessStatus } from '@components/merchant/BusinessStatusToggle';
 *
 * const [status, setStatus] = useState<BusinessStatus>('open');
 *
 * return (
 *   <BusinessStatusToggle
 *     value={status} // 현재 상태 ('open' | 'closed')
 *     onChange={(next) => setStatus(next)} // 상태 변경 핸들러
 *     labels={{ open: '영업중', closed: '영업종료' }}
 *   />
 *
 * @prop value - 현재 상태 값 ('open' | 'closed')
 * @prop onChange - 상태 변경 콜백 함수
 */

import React from 'react';
import * as S from '@styles/merchant/component/BusinessStatusToggleStyle';

export type BusinessStatus = 'open' | 'closed';

export interface BusinessStatusToggleProps {
  value: BusinessStatus; // 현재 값
  onChange: (next: BusinessStatus) => void; // 값 변경 콜백
  disabled?: boolean; // 비활성화 여부
  className?: string; // 외부 스타일 확장용
  labels?: { open: string; closed: string }; // 라벨 커스터마이즈
}

export default function BusinessStatusToggle({
  value,
  onChange,
  disabled = false,
  className,
  labels = { open: '영업중', closed: '영업종료' },
}: BusinessStatusToggleProps) {
  const isOpen = value === 'open';

  return (
    <S.Wrap
      role="switch"
      aria-checked={isOpen}
      tabIndex={disabled ? -1 : 0}
      $disabled={disabled}
      className={className}
    >
      <S.Knob $pos={isOpen ? 'left' : 'right'} />
      <S.Segment
        type="button"
        onClick={() => !disabled && onChange('open')}
        $active={isOpen}
        disabled={disabled}
      >
        <S.Dot $active={isOpen} />
        {labels.open}
      </S.Segment>
      <S.Segment
        type="button"
        onClick={() => !disabled && onChange('closed')}
        $active={!isOpen}
        disabled={disabled}
      >
        <S.Dot $active={!isOpen} />
        {labels.closed}
      </S.Segment>
    </S.Wrap>
  );
}
