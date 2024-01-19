import Link from 'next/link';
import classNames from 'classnames';

export interface MenuItem {
  name: string;
  href: string;
  icon?: any;
  active?: boolean;
  items?: Omit<MenuItem, 'icon' | 'items'>[];
  className?: string;
}

export interface NavigationProps {
  activePathname: string | null;
}

interface NavigationItemsProps {
  menus: MenuItem[];
}

interface NavigationItemProps {
  menu: MenuItem;
  className?: string;
}

const NavigationItems = ({ menus }: NavigationItemsProps) => {
  return (
    <ul role="list" className="flex flex-1 flex-col gap-1">
      {menus.map((menu) => (
        <li key={menu.name}>
          {menu.name === 'line-break' ? (
            <hr className="my-1 border-t border-gray-300 dark:border-gray-600" />
          ) : (
            <>
              <NavigationItem menu={menu} className={menu.className || ''} />
              {menu.items && (
                <ul className="flex flex-col gap-1 mt-1">
                  {menu.items.map((subitem) => (
                    <li key={subitem.name}>
                      <NavigationItem menu={subitem} className="pl-9" />
                    </li>
                  ))}
                </ul>
              )}
            </>
          )}
        </li>
      ))}
    </ul>
  );
};

const NavigationItem = ({ menu, className }: NavigationItemProps) => {
  return (
    <Link
      href={menu.href}
      className={`flex items-center rounded text-sm text-gray-900 hover:bg-gray-100 px-2 p-2 gap-2 dark:text-gray-500 hover:dark:text-black ${
        menu.active ? 'bg-gray-100 font-semibold dark:text-black' : ''
      }${className}`}
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
