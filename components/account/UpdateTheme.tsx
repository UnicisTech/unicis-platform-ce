import React from 'react';
import { useTranslation } from 'next-i18next';
import useTheme from 'hooks/useTheme';
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

const UpdateTheme: React.FC = () => {
  const { setTheme, themes, selectedTheme, applyTheme } = useTheme();
  const { t } = useTranslation('common');

  return (
    <ManagementCard>
      <ManagementCardHeader
        title={t('theme')}
        description={t('change-theme')}
      />

      <ManagementCardContent className="p-4">
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-60 justify-between">
              <div className="flex items-center gap-2">
                <selectedTheme.icon className="w-5 h-5 text-slate-700 dark:text-slate-200" />
                <span className="text-slate-700 dark:text-slate-200">
                  {selectedTheme.name}
                </span>
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
                  <span className="text-slate-700 dark:text-slate-200">
                    {theme.name}
                  </span>
                </Button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </ManagementCardContent>
    </ManagementCard>
  );
};

export default UpdateTheme;
