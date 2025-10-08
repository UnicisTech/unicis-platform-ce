import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import useTheme from 'hooks/useTheme';
import env from '@/lib/env';
import { signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/shadcn/ui/dropdown-menu';
import { Button } from '@/components/shadcn/ui/button';
import {
  ChevronUpDownIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  UserCircleIcon,
} from '@heroicons/react/24/outline';

const AccountDropdown: React.FC = () => {
  const { data } = useSession();
  const { t } = useTranslation('common');
  const { toggleTheme } = useTheme();

  const username = data?.user?.name || '';

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" className="justify-between">
          <span className="truncate">{username}</span>
          <ChevronUpDownIcon className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end">
        <DropdownMenuItem asChild className="cursor-pointer">
          <Link
            href="/settings/account"
            className="flex items-center gap-2 px-2 py-1"
          >
            <div className="flex items-center">
              <UserCircleIcon className="w-5 h-5 mr-1" /> {t('account')}
            </div>
          </Link>
        </DropdownMenuItem>
        {env.darkModeEnabled && (
          <DropdownMenuItem
            onClick={(event) => {
              event.preventDefault();
              toggleTheme();
            }}
            className="cursor-pointer"
          >
            <div className="flex items-center">
              <SunIcon className="w-5 h-5 mr-1" /> {t('change-theme-header')}
            </div>
          </DropdownMenuItem>
        )}
        <DropdownMenuItem onClick={() => signOut()} className="cursor-pointer">
          <div className="flex items-center">
            <ArrowRightOnRectangleIcon className="w-5 h-5 mr-1" /> {t('logout')}
          </div>
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AccountDropdown;
