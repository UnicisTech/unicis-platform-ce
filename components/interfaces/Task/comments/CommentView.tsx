import React from 'react';
import type { ExtendedCommentDto } from 'types';
import QuillEditor from '@/components/shared/QuillEditor';
import CommentReactions from './CommentReactions';

interface CommentViewProps {
  comment: ExtendedCommentDto;
  onReact: (commentId: number, emoji: string) => Promise<void>;
}

const CommentView = ({ comment, onReact }: CommentViewProps) => (
  <>
    <div className="quill-view-mode text-[13px] text-slate-700 dark:text-slate-200 leading-relaxed">
      <QuillEditor
        value={comment.text}
        readOnly={true}
        modules={{ toolbar: false }}
      />
    </div>
    <CommentReactions comment={comment} onReact={onReact} />
  </>
);

export default CommentView;
