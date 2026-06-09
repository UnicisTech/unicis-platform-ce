import app from '@/lib/app';
import { useTranslation } from 'next-i18next';
import Image from 'next/image';
import LocaleDropdown from '@/components/shared/LocaleDropdown';
import { Button } from '@/components/shadcn/ui/button';
import useTheme from 'hooks/useTheme';
import env from '@/lib/env';

interface AuthLayoutProps {
  children: React.ReactNode;
  heading?: string;
  description?: string;
}

export default function AuthLayout({
  children,
  heading,
  description,
}: AuthLayoutProps) {
  const { t } = useTranslation('common');
  const { toggleTheme, selectedTheme } = useTheme();
  const ThemeIcon = selectedTheme.icon;

  return (
    <div className="relative flex min-h-full flex-1 flex-col justify-center px-6 py-20 lg:px-8">
      <div className="absolute right-4 top-4 sm:right-6 sm:top-6 flex items-center gap-2">
        {env.darkModeEnabled && ThemeIcon && (
          <Button
            type="button"
            variant="ghost"
            size="sm"
            className="px-2"
            onClick={toggleTheme}
            aria-label={t('change-theme-header')}
            title={t('change-theme-header')}
          >
            <ThemeIcon className="h-4 w-4" />
          </Button>
        )}
        <LocaleDropdown />
      </div>
      <div className="sm:mx-auto sm:w-full sm:max-w-sm text-center">
        <Image
          src="/unicis-platform-logo-ver-cropped.svg"
          className="mx-auto h-48 w-auto"
          alt={app.name}
          width={48}
          height={48}
        />
        {heading && (
          <h2 className="mt-6 text-2xl font-bold leading-9 tracking-tight text-slate-900 dark:text-slate-100">
            {t(heading)}
          </h2>
        )}
        {description && (
          <p className="mt-2 text-slate-500 dark:text-slate-400">{t(description)}</p>
        )}
      </div>
      <div className="mt-6 sm:mx-auto sm:w-full sm:max-w-md">{children}</div>
    </div>
  );
}
