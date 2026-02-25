import React from 'react';
import { Badge } from '@/components/shadcn/ui/badge';
import { Button } from '@/components/shadcn/ui/button';

interface ControlCodeLinkProps {
  code: string;
  mappingCount?: number;
  onClick: () => void;
}

export default function ControlCodeLink({
  code,
  mappingCount = 0,
  onClick,
}: ControlCodeLinkProps) {
  return (
    <Button
      type="button"
      variant="ghost"
      onClick={onClick}
      title={
        mappingCount > 0
          ? `View ${mappingCount} mapping(s)`
          : 'View framework mappings'
      }
      aria-label={`View framework mappings for ${code}`}
      className="relative inline-flex h-auto items-center gap-1 px-2 py-0.5 font-mono text-xs font-semibold"
    >
      <span>{code}</span>
      {mappingCount > 0 && (
        <Badge className="h-4 w-4 justify-center rounded-full p-0 text-[9px] font-bold">
          {mappingCount > 9 ? '9+' : mappingCount}
        </Badge>
      )}
    </Button>
  );
}
