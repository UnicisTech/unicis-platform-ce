'use client';

import React from 'react';
import { Button } from '@/components/shadcn/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuTrigger,
  DropdownMenuItem,
} from '@/components/shadcn/ui/dropdown-menu';

const AssetsSortDropdown = ({
  setStatus,
  canAccess,
  t,
}: {
  setStatus: (status: string) => void;
  canAccess: Function;
  t: Function;
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
        <DropdownMenuItem
          onClick={() => setStatus('inactive')}
        >
          {t('inactive-assets')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setStatus('active')}
        >
          {t('active-assets')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => setStatus('all')}
        >
          {t('all-assets')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
};

export default AssetsSortDropdown;
