import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/shadcn/ui/dropdown-menu';
import { ChevronDownIcon } from '@heroicons/react/24/outline';
import localeLabels from '@/lib/i18n/localeLabels';

const UpdateLanguage: React.FC = () => {
  const { t } = useTranslation('common');
  const router = useRouter();
  const currentLocale = router.locale ?? router.defaultLocale ?? 'en';
  const locales = router.locales ?? ['en'];

  const changeLocale = (locale: string) => {
    router.push(
      { pathname: router.pathname, query: router.query },
      router.asPath,
      { locale }
    );
  };

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5">
        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
          {t('languages')}
        </span>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">
          {t('change-language')}
        </p>
      </div>

      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-60 justify-between">
              <span className="text-slate-700 dark:text-slate-200">
                {localeLabels[currentLocale] ?? currentLocale.toUpperCase()}
              </span>
              <ChevronDownIcon className="w-5 h-5 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {locales.map((locale) => (
              <DropdownMenuItem
                key={locale}
                className="cursor-pointer"
                onSelect={() => changeLocale(locale)}
              >
                {localeLabels[locale] ?? locale.toUpperCase()}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default UpdateLanguage;
