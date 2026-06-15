import { InformationCircleIcon } from '@heroicons/react/24/outline';
import React from 'react';

interface EmptyStateProps {
  title: string;
  description?: string;
}

const EmptyState: React.FC<EmptyStateProps> = ({ title, description }) => {
  return (
    <div className="flex w-full flex-col items-center justify-center rounded-lg p-20 border bg-white dark:bg-slate-800 border-slate-200 dark:border-slate-700 h-80 gap-2">
      <InformationCircleIcon className="w-10 h-10 text-slate-400" />
      <h3 className="text-lg font-semibold text-slate-900 dark:text-slate-100 text-center">
        {title}
      </h3>
      {description && (
        <p className="text-sm font-light text-slate-400 text-center leading-6">
          {description}
        </p>
      )}
    </div>
  );
};

export default EmptyState;
