import React from 'react';
import { Button } from 'react-daisyui';
import { AccessControl } from '@/components/shared/AccessControl';
import type { Comment } from '@prisma/client';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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
  console.log('CommentView text', comment.text);
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
          <Button
            size="sm"
            variant="link"
            color="ghost"
            style={{ color: 'grey', paddingLeft: '0px' }}
            onClick={() => activateEditForComment(comment.id)}
          >
            Edit
          </Button>
          <Button
            size="sm"
            variant="link"
            color="ghost"
            style={{ color: 'grey' }}
            onClick={() => deleteComment(comment.id)}
          >
            Delete
          </Button>
        </AccessControl>
      </div>
    </>
  );
};

export default CommentView;
