import React from "react";
import Link from "next/link";
import { useRouter } from "next/router";
import { useSession } from "next-auth/react";
import { useTranslation } from "next-i18next";
import useTeams from "hooks/useTeams";
import useCanAccess from "hooks/useCanAccess";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuLabel,
  DropdownMenuItem,
  DropdownMenuSeparator,
} from "@/components/shadcn/ui/dropdown-menu";
import { Button } from "@/components/shadcn/ui/button";
import {
  ChevronUpDownIcon,
  FolderIcon,
  FolderPlusIcon,
  RectangleStackIcon,
  UserCircleIcon,
} from "@heroicons/react/24/outline";

const TeamDropdown: React.FC = () => {
  const router = useRouter();
  const { teams } = useTeams();
  const { data } = useSession();
  const { t } = useTranslation("common");
  const { canAccess } = useCanAccess();

  const currentTeamName =
    teams?.find((t) => t.slug === router.query.slug)?.name ||
    data?.user?.name ||
    "";

  const sections = [
    {
      label: t("teams"),
      items:
        teams?.map((team) => ({
          key: team.id,
          name: team.name,
          href: `/teams/${team.slug}/dashboard`,
          Icon: FolderIcon,
        })) || [],
    },
    {
      label: t("profile"),
      items:
        data?.user
          ? [
              {
                key: data.user.id,
                name: data.user.name,
                href: "/settings/account",
                Icon: UserCircleIcon,
              },
            ]
          : [],
    },
    {
      label: "",
      items: [
        {
          key: "all-teams",
          name: t("all-teams"),
          href: "/teams",
          Icon: RectangleStackIcon,
        },
        ...(canAccess("team", ["create"])
          ? [
              {
                key: "new-team",
                name: t("new-team"),
                href: "/teams?newTeam=true",
                Icon: FolderPlusIcon,
              },
            ]
          : []),
      ],
    },
  ];

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" className="justify-between">
          <span className="truncate">{currentTeamName}</span>
          <ChevronUpDownIcon className="w-5 h-5" />
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent
        align="start"
        className="w-[var(--radix-dropdown-menu-trigger-width)]"
      >
        {sections.map((section, idx) => (
          <React.Fragment key={idx}>
            {section.label && (
              <DropdownMenuLabel>{section.label}</DropdownMenuLabel>
            )}
            {section.items.map(({ key, name, href, Icon }) => (
              <DropdownMenuItem asChild key={key} className="cursor-pointer">
                <Link href={href} className="flex items-center gap-2 px-2 py-1">
                  <Icon className="w-5 h-5" />
                  {name}
                </Link>
              </DropdownMenuItem>
            ))}
            {idx < sections.length - 1 && <DropdownMenuSeparator />}
          </React.Fragment>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default TeamDropdown;