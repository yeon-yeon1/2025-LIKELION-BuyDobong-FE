/**
 * MarketCard
 * - "이렇게 등록할게요" 영역에 표시되는 프리뷰 카드
 * - 이미지가 없으면 기본 MarketImg.svg 사용
 *
 * // import
 * import MarketCard from '@components/merchant/MarketCard';
 *
 * // 기본 사용법: 영업 종료 상태, 이미지 없음
 * <MarketCard
 *   name="홍길동 가게"
 *   marketName="신도봉시장"
 * />
 *
 * // 영업 중 상태, 커스텀 이미지 URL 사용
 * <MarketCard
 *   name="김철수 상점"
 *   marketName="신도봉시장"
 *   status="open"
 *   imageUrl="https://example.com/image.jpg"
 * />
 */

import React from 'react';
import * as S from '@styles/merchant/component/MarketCardStyle';
import DefaultImg from '@assets/MarketImg.svg?react';
import GrayDot from '@assets/GrayDot.svg?react';
import GreenDot from '@assets/GreenDot.svg?react';
import RightArrow from '@assets/RightArrow.svg?react';

export type MarketStatus = 'open' | 'closed';

export interface MarketCardProps {
  /** 상호명 */
  name: string;
  /** 시장명 (예: 신도봉시장) */
  marketName: string;
  /** 영업 상태 (기본: closed) */
  status?: MarketStatus;
  /** 대표 이미지 URL (없으면 기본 SVG 표시) */
  imageUrl?: string | null;
  className?: string;
  /** 홈에서만 우측 화살표 표시 여부 */
  showArrow?: boolean;
}

export default function MarketCard({
  name,
  marketName,
  status = 'closed',
  imageUrl,
  className,
  showArrow,
}: MarketCardProps) {
  const isOpen = status === 'open';

  return (
    <S.Card className={className} role="article" aria-label={`${name} 프리뷰`}>
      <S.Wrapper>
        <S.Thumb>
          {imageUrl ? <img src={imageUrl} alt={`${name} 이미지`} /> : <DefaultImg />}
        </S.Thumb>

        <S.Info>
          <S.Title>{name}</S.Title>
          <S.BadgeWrap>
            <S.Badge>{marketName}</S.Badge>
            <S.Badge dim isOpen={isOpen}>
              {isOpen ? (
                <>
                  <GreenDot /> 영업중
                </>
              ) : (
                <>
                  <GrayDot /> 영업종료
                </>
              )}
            </S.Badge>
          </S.BadgeWrap>
        </S.Info>
      </S.Wrapper>
      {showArrow && <RightArrow />}
    </S.Card>
  );
}
