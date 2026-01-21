import React from 'react';
import { useRouter } from 'next/router';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuTrigger,
} from '@/components/shadcn/ui/dropdown-menu';
import { Button } from '@/components/shadcn/ui/button';

const localeLabels: Record<string, string> = {
  en: 'English',
  fr: 'Français',
};

const LocaleDropdown: React.FC = () => {
  const router = useRouter();
  const currentLocale = router.locale ?? router.defaultLocale ?? 'en';
  const locales = router.locales ?? ['en'];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="ghost" size="sm" className="px-2 text-xs">
          {localeLabels[currentLocale] ?? currentLocale.toUpperCase()}
        </Button>
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end">
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
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default LocaleDropdown;
