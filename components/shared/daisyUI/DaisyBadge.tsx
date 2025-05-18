import React from 'react';

export type ThemeAppearance =
  | 'added'
  | 'default'
  | 'important'
  | 'primary'
  | 'primaryInverted'
  | 'removed'
  | 'success'
  | 'error'
  | 'warning'
  | 'info';

const appearanceMap: Record<ThemeAppearance, string> = {
  added: 'bg-green-600 text-green-100',
  success: 'bg-green-600 text-green-100',
  default: 'bg-gray-600 text-gray-100',
  important: 'bg-yellow-600 text-yellow-100',
  warning: 'bg-yellow-600 text-yellow-100',
  primary: 'bg-blue-600 text-blue-100',
  info: 'bg-blue-600 text-blue-100',
  primaryInverted: 'bg-blue-600 text-white',
  removed: 'bg-red-600 text-red-100',
  error: 'bg-red-600 text-red-100',
};

const DaisyBadge = ({
  children,
  color = 'default',
}: {
  children: React.ReactNode;
  color?: ThemeAppearance;
  appearance?: ThemeAppearance;
}) => {
  return (
    <span
      className={`align-middle inline-block whitespace-nowrap rounded px-2 py-[2px] text-[12px] leading-tight ${appearanceMap[color]}`}
    >
      {children}
    </span>
  );
};

export default DaisyBadge;
