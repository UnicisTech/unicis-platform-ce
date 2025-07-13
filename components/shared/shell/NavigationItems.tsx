import Link from 'next/link';
import classNames from 'classnames';
import { Separator } from '@/components/shadcn/ui/separator';

export interface MenuItem {
  name: string;
  href: string;
  icon?: React.ComponentType<React.SVGProps<SVGSVGElement>>;
  active?: boolean;
  items?: Omit<MenuItem, 'icon' | 'items'>[];
  className?: string;
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

const NavigationItem: React.FC<NavigationItemProps> = ({ menu, className }) => {
  const isExternal = menu.href.startsWith('http');

  return (
    <Link
      href={menu.href}
      target={isExternal ? '_blank' : undefined}
      className={classNames(
        'flex items-center rounded-md text-sm px-2 p-2 gap-2',
        menu.active
          ? 'bg-muted font-semibold text-foreground'
          : 'text-foreground hover:bg-muted hover:text-foreground',
        className
      )}
    >
      {menu.icon && (
        <menu.icon
          className={classNames({
            'h-5 w-5 shrink-0': true,
            'text-primary': menu.active,
            [className as string]: true,
          })}
          aria-hidden="true"
        />
      )}
      {menu.name}
    </Link>
  );
};

export default NavigationItems;
