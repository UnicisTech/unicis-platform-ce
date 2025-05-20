import React from 'react';
import DaisyButton from './daisyUI/DaisyButton';

interface ModalProps {
  open: boolean;
  close: () => void;
  children: React.ReactNode;
}

interface BodyProps {
  children: React.ReactNode;
  className?: string;
}

const Modal = ({ open, close, children }: ModalProps) => {
  return (
    <dialog className={`modal ${open ? 'modal-open' : ''}`}>
      <div className="modal-box relative">
        <DaisyButton
          type="button"
          size="sm"
          shape="circle"
          className="absolute right-2 top-2 btn-ghost"
          onClick={close}
          aria-label="Close"
        >
          ✕
        </DaisyButton>
        {children}
      </div>
    </dialog>
  );
};

const Header = ({ children }: { children: React.ReactNode }) => {
  return <h3 className="font-bold text-lg">{children}</h3>;
};

const Description = ({ children }: { children: React.ReactNode }) => {
  return <p className="text-sm text-gray-700 pt-1">{children}</p>;
};

const Body = ({ children, className = '' }: BodyProps) => {
  return <div className={`py-3 ${className}`}>{children}</div>;
};

const Footer = ({ children }: { children: React.ReactNode }) => {
  return <div className="modal-action">{children}</div>;
};

Modal.Header = Header;
Modal.Description = Description;
Modal.Body = Body;
Modal.Footer = Footer;

export default Modal;
