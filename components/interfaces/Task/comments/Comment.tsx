import React, { useCallback } from 'react';
import CommentEdit from './CommentEdit';
import CommentView from './CommentView';
import CommentHeader from './CommentHeader';
import type { Comment } from '@prisma/client';
import type { ExtendedComment } from 'types';
import CommentAvatar from './CommentAvatar';

interface CommentProps {
  comment: ExtendedComment;
  commentToEdit: number | null;
  setCommentToEdit: React.Dispatch<React.SetStateAction<number | null>>;
  updateComment: (text: string, id: number) => Promise<void>;
  deleteComment: (id: number) => void;
}

const Comment = ({
  comment,
  commentToEdit,
  setCommentToEdit,
  updateComment,
  deleteComment,
}: CommentProps) => {
  const handleActivateEditMode = useCallback((id: number) => {
    setCommentToEdit(id);
  }, []);

  const handleCancelClick = useCallback(() => {
    setCommentToEdit(null);
  }, []);

  return (
    <div className="flex gap-2">
      <CommentAvatar
        image={comment.createdBy.image}
        username={comment.createdBy.name}
      />
      <div className="flex flex-col gap-1 mt-2.5">
        <CommentHeader
          createdByName={comment.createdBy.name}
          createdAt={comment.createdAt}
        />
        <>
          {commentToEdit === comment.id ? (
            <CommentEdit
              comment={comment}
              cancelHandler={handleCancelClick}
              updateHandler={updateComment}
            />
          ) : (
            <CommentView
              comment={comment}
              activateEditForComment={handleActivateEditMode}
              deleteComment={deleteComment}
            />
          )}
        </>
      </div>
    </div>
  );
};

export default Comment;
