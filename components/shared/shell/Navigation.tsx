import { useMemo } from 'react';
import { useRouter } from 'next/router';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { Cog6ToothIcon } from '@heroicons/react/24/outline';
import classNames from 'classnames';
import TeamNavigation from './TeamNavigation';
import UserNavigation from './UserNavigation';
import CopyrightItem from './CopyrightItem';
import { Separator } from '@/components/shadcn/ui/separator';

const Navigation = () => {
  const { asPath, isReady, query } = useRouter();
  const { t } = useTranslation('common');

  const activePathname = useMemo(() => {
    if (!isReady || !asPath) return null;
    return new URL(asPath, location.href).pathname;
  }, [asPath, isReady]);

  const { slug } = query as { slug: string };

  const isSettingsActive =
    slug && activePathname
      ? /(settings|billing|members|saml|directory-sync|audit-logs|webhooks|api-keys|iap\/admin)/.test(
          activePathname.slice(`/teams/${slug}`.length)
        )
      : false;

  return (
    <nav className="flex flex-1 flex-col">
      {slug ? (
        <TeamNavigation slug={slug} activePathname={activePathname} />
      ) : (
        <UserNavigation activePathname={activePathname} />
      )}

      {/* ── Footer: Settings (team context only) + copyright ─────────────── */}
      <div className="mt-1">
        {slug && (
          <>
            <Separator className="mb-1" />
            <Link
              href={`/teams/${slug}/settings`}
              className={classNames(
                'flex items-center rounded-md text-[13px] px-2 p-2 gap-2 transition-colors',
                isSettingsActive
                  ? 'bg-ub-blue-bg text-ub-blue-text font-medium'
                  : 'text-slate-600 dark:text-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50 hover:text-slate-700 dark:text-slate-200'
              )}
            >
              <Cog6ToothIcon
                className={classNames(
                  'h-5 w-5 flex-shrink-0',
                  isSettingsActive
                    ? 'text-ub-blue'
                    : 'text-slate-500 dark:text-slate-400'
                )}
                aria-hidden="true"
              />
              <span>{t('settings')}</span>
            </Link>
          </>
        )}
        <CopyrightItem />
      </div>
    </nav>
  );
};

export default Navigation;
