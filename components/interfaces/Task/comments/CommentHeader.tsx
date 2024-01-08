import React from 'react';
import { formatDate } from '@/lib/tasks';

interface CommentHeaderProps {
  createdByName: string;
  createdAt: Date;
}

const CommentHeader = ({ createdByName, createdAt }: CommentHeaderProps) => (
  <div className="flex gap-3.5">
    <span className="text-sm font-medium text-gray-500">{createdByName}</span>
    <span className="text-sm font-normal text-gray-500">
      {formatDate(String(createdAt))}
    </span>
  </div>
);

export default CommentHeader;
