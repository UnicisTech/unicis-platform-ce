import React, { useMemo } from 'react';
import { useSession } from 'next-auth/react';
import { useRouter } from 'next/router';
import { useTranslation } from 'next-i18next';
import { Bars3Icon } from '@heroicons/react/24/outline';
import AccountDropdown from './AccountDropdown';
import NotificationBell from '@/components/notifications/NotificationBell';
import GlobalSearch from './GlobalSearch';

// ── Route → display title mapping ────────────────────────────────────────────
function useModuleTitle(): string {
  const { t } = useTranslation('common');
  const { asPath, query, isReady } = useRouter();
  const slug = (query.slug as string) || '';

  return useMemo(() => {
    if (!isReady || !slug) return '';
    const relative = asPath.split('?')[0].replace(`/teams/${slug}`, '');
    if (!relative || relative === '/') return t('team-dashboard');
    if (relative.startsWith('/dashboard')) return t('team-dashboard');
    if (relative.startsWith('/tasks')) return t('all-tasks');
    if (relative.startsWith('/rpa')) return t('rpa-activities');
    if (relative.startsWith('/tia')) return t('tia');
    if (relative.startsWith('/pia')) return t('pia');
    if (relative.startsWith('/csc')) return t('csc');
    if (relative.startsWith('/iap')) return t('iap');
    if (relative.startsWith('/risk-management')) return t('rm');
    if (
      /^\/(settings|billing|members|saml|directory-sync|audit-logs|webhooks|api-keys)/.test(
        relative
      )
    )
      return t('settings');
    return '';
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isReady, asPath, slug]);
}

// ── Component ─────────────────────────────────────────────────────────────────
interface HeaderProps {
  setSidebarOpen: React.Dispatch<React.SetStateAction<boolean>>;
}

const Header = ({ setSidebarOpen }: HeaderProps) => {
  const { t } = useTranslation('common');
  const { status } = useSession();
  const moduleTitle = useModuleTitle();

  if (status === 'loading') {
    return null;
  }

  return (
    <div className="sticky top-0 z-40 flex h-12 shrink-0 items-center bg-white dark:bg-slate-800 border-b border-slate-200 dark:border-slate-700 px-4 sm:px-6 lg:px-6 gap-x-4">
      {/* Mobile sidebar toggle */}
      <button
        type="button"
        className="-m-2.5 p-2.5 text-slate-600 dark:text-slate-300 lg:hidden"
        onClick={() => setSidebarOpen(true)}
      >
        <span className="sr-only">{t('open-sidebar')}</span>
        <Bars3Icon className="h-5 w-5" aria-hidden="true" />
      </button>

      {/* Module title */}
      {moduleTitle && (
        <span className="text-[14px] font-medium text-slate-900 dark:text-slate-100 tracking-tight">
          {moduleTitle}
        </span>
      )}

      {/* ⌘K search trigger */}
      <GlobalSearch />

      {/* Right-side actions pushed to the far right */}
      <div className="flex items-center gap-x-3 ml-auto">
        <NotificationBell />
        <AccountDropdown />
      </div>
    </div>
  );
};

export default Header;
