import React from 'react';
import type { ReactNode, ButtonHTMLAttributes } from 'react';

export type ButtonColor =
  | 'primary'
  | 'secondary'
  | 'accent'
  | 'neutral'
  | 'info'
  | 'success'
  | 'warning'
  | 'error'
  | 'ghost';

export type ButtonVariant = 'outline-solid' | 'link';
export type ButtonSize = 'lg' | 'md' | 'sm' | 'xs';
export type ButtonShape = 'circle' | 'square';

type Props = {
  children: ReactNode;
  color?: ButtonColor;
  size?: ButtonSize;
  variant?: ButtonVariant;
  shape?: ButtonShape;
  fullWidth?: boolean;
  active?: boolean;
  loading?: boolean;
  className?: string;
} & ButtonHTMLAttributes<HTMLButtonElement>;

const DaisyButton = ({
  children,
  color,
  size,
  variant,
  shape,
  fullWidth,
  active,
  loading,
  className = '',
  ...rest
}: Props) => {
  const classList = [
    'btn',
    color && `btn-${color}`,
    size && `btn-${size}`,
    variant && `btn-${variant}`,
    shape && `btn-${shape}`,
    fullWidth && 'w-full',
    active && 'btn-active',
    loading && 'loading',
    className,
  ]
    .filter(Boolean)
    .join(' ');

  return (
    <button className={classList} {...rest}>
      {children}
    </button>
  );
};

export default DaisyButton;
