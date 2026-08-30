import React from 'react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/shadcn/ui/button';
import {
  ManagementCard,
  ManagementCardContent,
  ManagementCardHeader,
} from '@/components/shared';
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
    <ManagementCard>
      <ManagementCardHeader
        title={t('languages')}
        description={t('change-language')}
      />

      <ManagementCardContent className="p-4">
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
      </ManagementCardContent>
    </ManagementCard>
  );
};

export default UpdateLanguage;
