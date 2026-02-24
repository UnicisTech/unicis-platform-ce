import React from 'react';

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
    <button
      onClick={onClick}
      title={
        mappingCount > 0
          ? `View ${mappingCount} mapping(s)`
          : 'View framework mappings'
      }
      aria-label={`View framework mappings for ${code}`}
      className="relative inline-flex items-center gap-1 font-mono text-xs font-semibold px-2 py-0.5 rounded bg-base-200 hover:bg-primary hover:text-primary-content border border-base-300 hover:border-primary transition-all duration-150 cursor-pointer group"
    >
      <span>{code}</span>
      {mappingCount > 0 && (
        <span className="inline-flex items-center justify-center w-4 h-4 text-[9px] font-bold rounded-full bg-primary text-primary-content group-hover:bg-primary-content group-hover:text-primary transition-colors">
          {mappingCount > 9 ? '9+' : mappingCount}
        </span>
      )}
    </button>
  );
}
