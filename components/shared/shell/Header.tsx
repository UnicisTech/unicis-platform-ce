import React from 'react';
import { useSession } from 'next-auth/react';
import {
  Bars3Icon,
} from '@heroicons/react/24/outline';
import AccountDropdown from './AccountDropdown';

interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ setSidebarOpen }: HeaderProps) => {
  const { status } = useSession();

  if (status === 'loading') {
    return null;
  }

  return (
    <div
      className="
        sticky top-0 z-40 flex h-14 shrink-0 items-center
        bg-background border-b border-border
        px-4 sm:gap-x-6 sm:px-6 lg:px-8
      "
    >
      <button
        type="button"
        className="-m-2.5 p-2.5 text-gray-700 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">Open sidebar</span>
        <Bars3Icon className="h-6 w-6" aria-hidden="true" />
      </button>
      <div className="flex flex-1 gap-x-4 self-stretch lg:gap-x-6">
        <div className="relative flex flex-1"></div>
        <div className="flex items-center gap-x-4 lg:gap-x-6">
          <AccountDropdown />
        </div>
      </div>
    </div>
  );
};

export default Header;