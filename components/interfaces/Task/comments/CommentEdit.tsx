import React, { useState, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import type { Comment } from '@prisma/client';
import DaisyButton from '@/components/shared/daisyUI/DaisyButton';
import QuillEditor from '@/components/shared/QuillEditor';

interface CommentEditProps {
  comment: Comment;
  cancelHandler: () => void;
  updateHandler: (text: string, id: number) => Promise<void>;
}

const CommentEdit = ({
  comment,
  cancelHandler,
  updateHandler,
}: CommentEditProps) => {
  const { t } = useTranslation('common');
  const [newContent, setNewContent] = useState<string>(comment.text);

  const changeHandler = useCallback((content: string) => {
    setNewContent(content);
  }, []);

  return (
    <>
      <div>
        <QuillEditor defaultValue={comment.text} onChange={changeHandler} />
      </div>

      <div className="flex gap-1.5 mt-1.5">
        <DaisyButton
          size="sm"
          color="primary"
          variant="outline"
          onClick={() => updateHandler(newContent, comment.id)}
        >
          {t('save')}
        </DaisyButton>
        <DaisyButton
          size="sm"
          color="ghost"
          variant="outline"
          onClick={cancelHandler}
        >
          {t('cancel')}
        </DaisyButton>
      </div>
    </>
  );
};

export default CommentEdit;
