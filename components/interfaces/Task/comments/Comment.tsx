import React, { useCallback } from 'react';
import CommentEdit from './CommentEdit';
import CommentView from './CommentView';
import CommentHeader from './CommentHeader';
import type { ExtendedCommentDto } from 'types';
import CommentAvatar from './CommentAvatar';

interface CommentProps {
  slug?: string;
  comment: ExtendedCommentDto;
  commentToEdit: number | null;
  setCommentToEdit: React.Dispatch<React.SetStateAction<number | null>>;
  updateComment: (text: string, id: number) => Promise<void>;
  deleteComment: (id: number) => void;
}

const Comment = ({
  comment,
  slug,
  commentToEdit,
  setCommentToEdit,
  updateComment,
  deleteComment,
}: CommentProps) => {
  const handleActivateEditMode = useCallback(
    (id: number) => {
      setCommentToEdit(id);
    },
    [setCommentToEdit]
  );

  const handleCancelClick = useCallback(() => {
    setCommentToEdit(null);
  }, [setCommentToEdit]);

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
              slug={slug}
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
