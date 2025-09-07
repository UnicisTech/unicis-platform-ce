import Link from "next/link";
import classNames from "classnames";
import { Separator } from "@/components/shadcn/ui/separator";
import React from "react";

export interface MenuItem {
  name: string;
  href: string;
  icon?: React.ElementType<{ className?: string }>;
  className?: string;
  active?: boolean;
  items?: Omit<MenuItem, "icon" | "items">[];
}

export interface NavigationProps {
  activePathname?: string | null;
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
          {menu.name === "line-break" ? (
            <Separator className="my-1" />
          ) : (
            <>
              <NavigationItem menu={menu} className={menu.className} />
              {menu.items && menu.items.length > 0 && (
                <ul className="mt-1 flex flex-col gap-1">
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
  const isExternal = menu.href.startsWith("http");
  const IconComp = menu.icon;

  return (
    <Link
      href={menu.href}
      target={isExternal ? "_blank" : undefined}
      className={classNames(
        "flex items-center gap-2 rounded-md p-2 text-sm",
        menu.active
          ? "bg-muted font-semibold text-foreground"
          : "text-foreground hover:bg-muted hover:text-foreground",
        className
      )}
    >
      {IconComp ? (
        <IconComp
          className={classNames(
            "h-5 w-5 shrink-0",
            menu.active && "text-primary",
            className
          )}
          aria-hidden="true"
        />
      ) : null}
      <span>{menu.name}</span>
    </Link>
  );
};

export default NavigationItems;
