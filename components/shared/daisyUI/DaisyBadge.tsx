import React from 'react';

export type ThemeAppearance =
  | 'added'
  | 'default'
  | 'important'
  | 'primary'
  | 'primaryInverted'
  | 'removed';

const appearanceMap: Record<ThemeAppearance, string> = {
  added: 'bg-green-100 text-green-800',
  default: 'bg-gray-100 text-gray-800',
  important: 'bg-yellow-100 text-yellow-800',
  primary: 'bg-blue-100 text-blue-800',
  primaryInverted: 'bg-blue-800 text-white',
  removed: 'bg-red-100 text-red-800',
};

const DaisyBadge = ({
  children,
  appearance = 'default',
}: {
  children: React.ReactNode;
  appearance?: ThemeAppearance;
}) => {
  return (
    <span
      className={`align-middle inline-block whitespace-nowrap rounded-[0.5rem] px-2 py-[2px] text-[11px] font-medium leading-tight ${appearanceMap[appearance]}`}
    >
      {children}
    </span>
  );
};

export default DaisyBadge;