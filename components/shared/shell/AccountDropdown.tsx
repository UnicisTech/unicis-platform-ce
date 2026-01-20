import React from 'react';
import Link from 'next/link';
import { useSession } from 'next-auth/react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import useTheme from 'hooks/useTheme';
import env from '@/lib/env';
import { signOut } from 'next-auth/react';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { Button } from '@/components/shadcn/ui/button';
import {
  ChevronUpDownIcon,
  ArrowRightOnRectangleIcon,
  SunIcon,
  UserCircleIcon,
  GlobeAltIcon,
  LanguageIcon,
} from '@heroicons/react/24/outline';

const localeLabels: Record<string, string> = {
  en: 'English',
  fr: 'Français',
};

const AccountDropdown: React.FC = () => {
  const { data } = useSession();
  const { t } = useTranslation('common');
  const router = useRouter();
  const { toggleTheme } = useTheme();

  const username = data?.user?.name || '';
  const currentLocale = router.locale ?? router.defaultLocale ?? 'en';
  const locales = router.locales ?? ['en'];

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
        <DropdownMenuSub>
          <DropdownMenuSubTrigger className="cursor-pointer">
            <div className="flex items-center">
              <LanguageIcon className="w-5 h-5 mr-1" /> {t('languages')}
            </div>
          </DropdownMenuSubTrigger>
          <DropdownMenuSubContent>
            <DropdownMenuRadioGroup
              value={currentLocale}
              onValueChange={(locale) => {
                router.push(
                  { pathname: router.pathname, query: router.query },
                  router.asPath,
                  { locale }
                );
              }}
            >
              {locales.map((locale) => (
                <DropdownMenuRadioItem key={locale} value={locale}>
                  {localeLabels[locale] ?? locale.toUpperCase()}
                </DropdownMenuRadioItem>
              ))}
            </DropdownMenuRadioGroup>
          </DropdownMenuSubContent>
        </DropdownMenuSub>
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
