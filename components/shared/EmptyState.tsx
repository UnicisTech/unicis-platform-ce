import { InformationCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-lg p-20 border bg-background border-border h-80 gap-2">
      <InformationCircleIcon className="w-10 h-10 text-muted-foreground" />
      <h3 className="text-lg font-semibold text-foreground text-center">
        {title}
      </h3>
      {description && (
        <p className="text-sm font-light text-muted-foreground text-center leading-6">
          {description}
        </p>
      )}
    </div>
  );
};

export default EmptyState;
