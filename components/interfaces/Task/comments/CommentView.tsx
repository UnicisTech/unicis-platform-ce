import React from 'react';
import { AccessControl } from '@/components/shared/AccessControl';
import type { Comment } from '@prisma/client';
import dynamic from 'next/dynamic';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';

const ReactQuill = dynamic(() => import('react-quill-new'), { ssr: false });

interface CommentViewProps {
  comment: Comment;
  activateEditForComment: (id: number) => void;
  deleteComment: (id: number) => void;
}
const CommentView = ({
  comment,
  activateEditForComment,
  deleteComment,
}: CommentViewProps) => {
  return (
    <>
      <div>
        <ReactQuill
          value={comment.text}
          readOnly={true}
          modules={{
            toolbar: false,
          }}
          // Apply custom classes from global.css if its view mode
          className="quill-view-mode"
        />
      </div>
      <div>
        <AccessControl resource="task" actions={['update']}>
          <DaisyButton
            size="sm"
            variant="link"
            color="ghost"
            style={{ color: 'grey', paddingLeft: '0px' }}
            onClick={() => activateEditForComment(comment.id)}
          >
            Edit
          </DaisyButton>
          <DaisyButton
            size="sm"
            variant="link"
            color="ghost"
            style={{ color: 'grey' }}
            onClick={() => deleteComment(comment.id)}
          >
            Delete
          </DaisyButton>
        </AccessControl>
      </div>
    </>
  );
};

export default CommentView;
