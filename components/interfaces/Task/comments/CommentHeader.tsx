import React from 'react';
import { formatDate } from '@/lib/tasks';

interface CommentHeaderProps {
  createdByName: string;
  createdAt: string;
}

const CommentHeader = ({ createdByName, createdAt }: CommentHeaderProps) => (
  <div className="flex items-center gap-1.5 min-w-0">
    <span className="text-[13px] font-semibold text-slate-800 dark:text-slate-100 truncate">
      {createdByName}
    </span>
    <span className="text-[11px] text-slate-300 dark:text-slate-600 flex-shrink-0">
      ·
    </span>
    <span className="text-[11px] text-slate-400 dark:text-slate-500 flex-shrink-0">
      {formatDate(String(createdAt))}
    </span>
  </div>
);

export default CommentHeader;
