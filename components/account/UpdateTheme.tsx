import React from 'react';
import { useTranslation } from 'next-i18next';
import useTheme from 'hooks/useTheme';
import { Button } from '@/components/shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from '@/components/shadcn/ui/dropdown-menu';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const UpdateTheme: React.FC = () => {
  const { setTheme, themes, selectedTheme, applyTheme } = useTheme();
  const { t } = useTranslation('common');

  return (
    <div className="bg-white dark:bg-slate-800 border border-slate-200 dark:border-slate-700 rounded-xl overflow-hidden">
      <div className="bg-slate-50 dark:bg-slate-900 border-b border-slate-200 dark:border-slate-700 px-4 py-2.5">
        <span className="text-[12px] font-semibold text-slate-700 dark:text-slate-200 uppercase tracking-wide">
          {t('theme')}
        </span>
        <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5">{t('change-theme')}</p>
      </div>

      <div className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-60 justify-between">
              <div className="flex items-center gap-2">
                <selectedTheme.icon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                <span className="text-slate-700 dark:text-slate-200">{selectedTheme.name}</span>
              </div>
              <ChevronDownIcon className="w-5 h-5 text-slate-400" />
            </Button>
          </DropdownMenuTrigger>

          <DropdownMenuContent className="w-[var(--radix-dropdown-menu-trigger-width)]">
            {themes.map((theme) => (
              <DropdownMenuItem
                key={theme.id}
                className="cursor-pointer p-0"
                onSelect={() => {
                  applyTheme(theme.id);
                  setTheme(theme.id);
                }}
              >
                <Button
                  variant="ghost"
                  className="w-full justify-start gap-2 px-2 py-1"
                >
                  {theme.icon && (
                    <theme.icon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                  )}
                  <span className="text-slate-700 dark:text-slate-200">{theme.name}</span>
                </Button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </div>
  );
};

export default UpdateTheme;
