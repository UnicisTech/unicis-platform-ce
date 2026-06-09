import Link from 'next/link';
import classNames from 'classnames';
import { Separator } from '@/components/shadcn/ui/separator';
import { ArrowTopRightOnSquareIcon } from '@heroicons/react/24/outline';

export interface MenuItem {
  name: string;
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  active?: boolean;
  items?: Omit<MenuItem, 'icon' | 'items'>[];
  className?: string;
  openInNewTab?: boolean;
  /** Optional count badge shown on the nav item (only rendered when count > 0) */
  badge?: { count: number; variant: 'red' | 'amber' };
}

export interface NavigationProps {
  activePathname: string | null;
}

interface NavigationItemsProps {
  menus: (MenuItem | null)[];
}

interface NavigationItemProps {
  menu: MenuItem;
  className?: string;
}

export const NavigationItems: React.FC<NavigationItemsProps> = ({ menus }) => (
  <ul role="list" className="flex flex-1 flex-col gap-1">
    {menus.map((menu) =>
      menu ? (
        <li key={menu.name}>
          {menu.name === 'line-break' ? (
            <Separator className="my-1" />
          ) : (
            <>
              <NavigationItem menu={menu} className={menu.className} />
              {menu.items && (
                <ul className="flex flex-col gap-1 mt-1">
                  {menu.items.map((sub) => (
                    <li key={sub.name}>
                      <NavigationItem menu={sub} className="pl-9" />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </li>
      ) : null
    )}
  </ul>
);

const NavigationItem: React.FC<NavigationItemProps> = ({ menu }) => {
  const isExternal = menu.href.startsWith('http');
  const newTab = isExternal || menu.openInNewTab;

  return (
    <Link
      href={menu.href}
      target={newTab ? '_blank' : undefined}
      rel={newTab ? 'noopener noreferrer' : undefined}
      className={classNames(
        'flex items-center rounded-md text-[13px] px-2 p-2 gap-2 transition-colors',
        menu.active
          ? 'bg-ub-blue-bg text-ub-blue-text font-medium'
          : 'text-slate-600 hover:bg-slate-50 hover:text-slate-700'
      )}
    >
      {menu.icon && (
        // Wrap in a span so CSS filter can grey out PNG image icons when inactive.
        // Heroicon/Lucide SVG icons also receive a text-colour class (uses currentColor).
        <span
          className="flex-none shrink-0 flex items-center justify-center h-5 w-5"
          style={menu.active ? undefined : { filter: 'grayscale(1)', opacity: 0.45 }}
        >
          <menu.icon
            className={classNames(
              'h-5 w-5 min-h-5 min-w-5',
              menu.active ? 'text-ub-blue' : 'text-slate-500'
            )}
            aria-hidden="true"
          />
        </span>
      )}
      <span className="min-w-0 flex-1">{menu.name}</span>
      {menu.badge && menu.badge.count > 0 && (
        <span
          className={classNames(
            'ml-auto flex-shrink-0 text-[10px] font-semibold px-1.5 py-0.5 rounded-md min-w-[20px] text-center leading-none',
            menu.badge.variant === 'red'
              ? 'bg-red-100 text-red-700'
              : 'bg-amber-100 text-amber-700'
          )}
        >
          {menu.badge.count > 99 ? '99+' : menu.badge.count}
        </span>
      )}
      {newTab && (
        <ArrowTopRightOnSquareIcon
          className="h-3 w-3 shrink-0 text-slate-300"
          aria-hidden="true"
        />
      )}
    </Link>
  );
};

export default NavigationItems;
