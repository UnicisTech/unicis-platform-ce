'use client';

import React from 'react';
import { Button } from '@/components/shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/shadcn/ui/dropdown-menu';

type CanAccess = (resource: string, actions: string[]) => boolean;
type Translate = (key: string) => string;

const AssetsSortDropdown = ({
  setStatus,
  canAccess,
  t,
}: {
  setStatus: (status: string) => void;
  canAccess: CanAccess;
  t: Translate;
}) => {
  if (!canAccess('team_fleet_node', ['read'])) return null;

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <Button variant="outline" size="sm">
          {t('sort-assets')}
        </Button>
      </DropdownMenuTrigger>

      <DropdownMenuContent align="end" className="w-40">
        <DropdownMenuItem onClick={() => setStatus('inactive')}>
          {t('inactive-assets')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setStatus('active')}>
          {t('active-assets')}
        </DropdownMenuItem>
        <DropdownMenuItem onClick={() => setStatus('all')}>
          {t('all-assets')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AssetsSortDropdown;
