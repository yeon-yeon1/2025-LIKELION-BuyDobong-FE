/**
 * 하단 기본 추가 버튼
 *
 * @example
 * import PlusButton from '@components/merchant/PlusButton';
 *
 * <PlusButton onClick={() => console.log('추가')} />;
 *
 * @prop {() => void} onClick  - 클릭 핸들러 (필수)
 */

import React from 'react';
import WhitePlus from '@assets/WhitePlus.svg?react';
import * as S from '@styles/merchant/component/PlusButtonStyle';

const PlusButton = ({ onClick, className }: { onClick: () => void; className?: string }) => {
  return (
    <S.Button onClick={onClick} className={className}>
      <WhitePlus />
    </S.Button>
  );
};

export default PlusButton;
