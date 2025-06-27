import React from "react";
import { useTranslation } from "next-i18next";
import useTheme from "hooks/useTheme";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/shadcn/ui/card";
import { Button } from "@/components/shadcn/ui/button";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
} from "@/components/shadcn/ui/dropdown-menu";
import { ChevronDownIcon } from "@heroicons/react/24/outline";

const UpdateTheme: React.FC = () => {
  const { setTheme, themes, selectedTheme, applyTheme } = useTheme();
  const { t } = useTranslation("common");

  return (
    <Card>
      <CardHeader>
        <CardTitle>{t("theme")}</CardTitle>
        <CardDescription>{t("change-theme")}</CardDescription>
      </CardHeader>

      <CardContent>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="w-60 justify-between">
              <div className="flex items-center gap-2">
                <selectedTheme.icon className="w-5 h-5 text-foreground" />
                <span className="text-foreground">{selectedTheme.name}</span>
              </div>
              <ChevronDownIcon className="w-5 h-5 text-muted-foreground" />
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
                <Button variant="ghost" className="w-full justify-start gap-2 px-2 py-1">
                  {theme.icon && <theme.icon className="w-5 h-5 text-foreground" />}
                  <span className="text-foreground">{theme.name}</span>
                </Button>
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>
      </CardContent>
    </Card>
  );
};

export default UpdateTheme;
