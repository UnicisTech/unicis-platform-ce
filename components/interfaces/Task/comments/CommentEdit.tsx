import React, { useState, useCallback } from 'react';
import { Button } from 'react-daisyui';
import { useTranslation } from 'next-i18next';
import type { Comment } from '@prisma/client';
import 'react-quill/dist/quill.snow.css';
import dynamic from 'next/dynamic';

const ReactQuill = dynamic(() => import('react-quill'), { ssr: false });

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
        <ReactQuill defaultValue={comment.text} onChange={changeHandler} />
      </div>
      <div className="flex gap-1.5 mt-1.5">
        <Button
          size="sm"
          color="primary"
          variant="outline"
          onClick={() => updateHandler(newContent, comment.id)}
        >
          {t('save')}
        </Button>
        <Button
          size="sm"
          color="ghost"
          variant="outline"
          onClick={() => cancelHandler()}
        >
          {t('cancel')}
        </Button>
      </div>
    </>
  );
};

export default CommentEdit;
