import React from 'react';
import { useTranslation } from 'next-i18next';
import { AccessControl } from '@/components/shared/AccessControl';
import type { ExtendedCommentDto } from 'types';
import QuillEditor from '@/components/shared/QuillEditor';
import { Button } from '@/components/shadcn/ui/button';
import CommentReactions from './CommentReactions';

interface CommentViewProps {
  slug?: string;
  comment: ExtendedCommentDto;
  activateEditForComment: (id: number) => void;
  deleteComment: (id: number) => void;
  onReact: (commentId: number, emoji: string) => Promise<void>;
}
const CommentView = ({
  comment,
  slug,
  activateEditForComment,
  deleteComment,
  onReact,
}: CommentViewProps) => {
  const { t } = useTranslation('common');

  return (
    <>
      <div>
        <QuillEditor
          value={comment.text}
          readOnly={true}
          modules={{
            toolbar: false,
          }}
          // Apply custom classes from global.css if its view mode
          className="quill-view-mode"
        />
      </div>
      <CommentReactions comment={comment} onReact={onReact} />
      <div>
        <AccessControl resource="task" actions={['update']} slug={slug}>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => activateEditForComment(comment.id)}
          >
            {t('edit')}
          </Button>
          <Button
            variant="subtle"
            size="sm"
            onClick={() => deleteComment(comment.id)}
          >
            {t('delete')}
          </Button>
        </AccessControl>
      </div>
    </>
  );
};

export default CommentView;
