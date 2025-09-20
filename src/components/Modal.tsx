/****
 *
 * @example
 * ```tsx
 * import Modal from '@components/Modal';
 *
 * function Example() {
 *   const [open, setOpen] = React.useState(false);
 *
 *   return (
 *     <Modal
 *       open={open}
 *       title="확인 요청"
 *       description="진행하시겠습니까?"
 *       onClose={() => setOpen(false)}
 *       onConfirm={() => {
 *         // 확인 처리
 *         setOpen(false);
 *       }}
 *        // primary - 버튼 색 초록, danger - 버튼 색 빨강
 *       variant="primary"
 *     />
 *   );
 * }
 * ```
 *
 * @prop {boolean} open - 모달의 표시 여부를 제어합니다.
 * @prop {React.ReactNode} [title] - 모달의 제목 내용입니다.
 * @prop {React.ReactNode} [description] - 모달의 설명 내용입니다.
 * @prop {string} [cancelText='취소'] - 취소 버튼의 텍스트입니다.
 * @prop {string} [confirmText='확인'] - 확인 버튼의 텍스트입니다.
 * @prop {() => void} [onClose] - 모달 닫기 요청 시 호출되는 콜백입니다.
 * @prop {() => void} [onConfirm] - 확인 동작 시 호출되는 콜백입니다.
 * @prop {boolean} [loading=false] - 로딩 상태를 나타내며, 버튼을 비활성화하고 로딩 텍스트를 표시합니다.
 * @prop {boolean} [blocking=false] - true일 경우, 바깥 클릭이나 Escape 키로 모달을 닫을 수 없습니다.
 * @prop {number|string} [width=480] - 모달 대화상자의 너비입니다.
 * @prop {'primary' | 'danger'} [variant='primary'] - 확인 버튼의 시각적 변형입니다.
 */

import { useEffect, useRef } from 'react';
import ReactDOM from 'react-dom';
import * as M from '@styles/ModalStyle';

export type ModalVariant = 'primary' | 'danger';

export interface ModalProps {
  open: boolean;
  title?: React.ReactNode;
  description?: React.ReactNode;
  cancelText?: string;
  confirmText?: string;
  onClose?: () => void;
  onConfirm?: () => void;
  loading?: boolean;
  blocking?: boolean;
  width?: number | string;
  variant?: ModalVariant;
}

export default function Modal({
  open,
  title,
  description,
  cancelText = '취소',
  confirmText = '확인',
  onClose,
  onConfirm,
  loading = false,
  blocking = false,
  width = 480,
  variant = 'primary',
}: ModalProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);

  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    const t = setTimeout(() => cancelRef.current?.focus(), 0);
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !blocking && onClose) onClose();
    };
    window.addEventListener('keydown', onKey);
    return () => {
      document.body.style.overflow = prev;
      window.removeEventListener('keydown', onKey);
      clearTimeout(t);
    };
  }, [open, blocking, onClose]);

  if (!open) return null;

  const content = (
    <M.Overlay onClick={() => !blocking && onClose?.()}>
      <M.Card
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
        aria-describedby="modal-desc"
        onClick={(e) => e.stopPropagation()}
        $width={width}
      >
        {title && <M.Title id="modal-title">{title}</M.Title>}
        {description && <M.Desc id="modal-desc">{description}</M.Desc>}
        <M.BtnRow>
          {!!onClose && (
            <M.Btn
              ref={cancelRef}
              type="button"
              disabled={loading}
              onClick={onClose}
              $tone="muted"
              $context={variant}
            >
              {cancelText}
            </M.Btn>
          )}
          {!!onConfirm && (
            <M.Btn type="button" disabled={loading} onClick={onConfirm} $tone={variant}>
              {loading ? '처리 중…' : confirmText}
            </M.Btn>
          )}
        </M.BtnRow>
      </M.Card>
    </M.Overlay>
  );

  const mount = document.getElementById('modal-root') ?? document.body;
  return ReactDOM.createPortal(content, mount);
}
