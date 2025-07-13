import React, { ReactNode, ElementType } from 'react';

export type ModalProps = {
  open: boolean;
  onClose?: () => void;
  children: ReactNode;
  className?: string;
};

const DaisyModal = ({
  open,
  onClose,
  children,
  className = '',
}: ModalProps) => {
  return (
    <dialog className={`modal ${open ? 'modal-open' : ''}`}>
      <div className={`modal-box relative ${className}`}>
        {onClose && (
          <button
            type="button"
            onClick={onClose}
            className="btn btn-sm btn-circle btn-outline absolute right-2 top-2"
            aria-label="Close"
          >
            ✕
          </button>
        )}
        {children}
      </div>
    </dialog>
  );
};

const ModalHeader = ({
  children,
  tag: Tag = 'h2',
  className = '',
}: {
  children: ReactNode;
  tag?: ElementType;
  className?: string;
}) => <Tag className={`font-bold text-lg ${className}`}>{children}</Tag>;

const ModalBody = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`py-4 ${className}`}>{children}</div>;

const ModalActions = ({
  children,
  className = '',
}: {
  children: ReactNode;
  className?: string;
}) => <div className={`modal-action ${className}`}>{children}</div>;

DaisyModal.Header = ModalHeader;
DaisyModal.Body = ModalBody;
DaisyModal.Actions = ModalActions;
DaisyModal.Footer = ModalActions;

export default DaisyModal;
