import React, { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import CommentEdit from './CommentEdit';
import CommentView from './CommentView';
import CommentHeader from './CommentHeader';
import type { ExtendedCommentDto } from 'types';
import CommentAvatar from './CommentAvatar';
import { AccessControl } from '@/components/shared/AccessControl';

interface CommentProps {
  slug?: string;
  comment: ExtendedCommentDto;
  commentToEdit: number | null;
  setCommentToEdit: React.Dispatch<React.SetStateAction<number | null>>;
  updateComment: (text: string, id: number) => Promise<void>;
  deleteComment: (id: number) => void;
  onReact: (commentId: number, emoji: string) => Promise<void>;
}

const Comment = ({
  comment,
  slug,
  commentToEdit,
  setCommentToEdit,
  updateComment,
  deleteComment,
  onReact,
}: CommentProps) => {
  const { t } = useTranslation('common');

  const handleActivateEditMode = useCallback(
    (id: number) => {
      setCommentToEdit(id);
    },
    [setCommentToEdit]
  );

  const handleCancelClick = useCallback(() => {
    setCommentToEdit(null);
  }, [setCommentToEdit]);

  const isEditing = commentToEdit === comment.id;

  return (
    <div className="group flex gap-2.5 py-3 first:pt-0 last:pb-0">
      {/* Avatar */}
      <div className="flex-shrink-0 pt-0.5">
        <CommentAvatar
          image={comment.createdBy.image}
          username={comment.createdBy.name}
        />
      </div>

      {/* Content column */}
      <div className="flex-1 min-w-0">
        {/* Header row: name · date + hover actions */}
        <div className="flex items-center gap-1.5 mb-1">
          <CommentHeader
            createdByName={comment.createdBy.name}
            createdAt={comment.createdAt}
          />

          {!isEditing && (
            <div className="ml-auto opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-0.5 flex-shrink-0">
              <AccessControl resource="task" actions={['update']} slug={slug}>
                <button
                  onClick={() => handleActivateEditMode(comment.id)}
                  className="px-1.5 py-0.5 text-[11px] text-slate-400 hover:text-slate-700 dark:hover:text-slate-200 hover:bg-slate-100 dark:hover:bg-slate-700 rounded transition-colors"
                  aria-label={t('edit')}
                >
                  {t('edit')}
                </button>
                <button
                  onClick={() => deleteComment(comment.id)}
                  className="px-1.5 py-0.5 text-[11px] text-slate-400 hover:text-red-600 dark:hover:text-red-400 hover:bg-red-50 dark:hover:bg-red-950/30 rounded transition-colors"
                  aria-label={t('delete')}
                >
                  {t('delete')}
                </button>
              </AccessControl>
            </div>
          )}
        </div>

        {/* Body: view or edit */}
        {isEditing ? (
          <CommentEdit
            comment={comment}
            cancelHandler={handleCancelClick}
            updateHandler={updateComment}
          />
        ) : (
          <CommentView comment={comment} onReact={onReact} />
        )}
      </div>
    </div>
  );
};

export default Comment;
