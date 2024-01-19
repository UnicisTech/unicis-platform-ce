import React, { useState, useEffect, useRef } from 'react';
import toast from 'react-hot-toast';
import { useRouter } from 'next/router';
import axios from 'axios';
import { TaskExtended } from 'types';
import AttachmentsCard from './AttachmentCard';
import { checkExtensionAndMIMEType } from '@/components/services/taskService';
import useCanAccess from 'hooks/useCanAccess';
import { useTranslation } from 'next-i18next';
import { EmptyState } from '@/components/shared';

const Attachments = ({
  task,
  mutateTask,
}: {
  task: TaskExtended;
  mutateTask: () => Promise<void>;
}) => {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const { t } = useTranslation('common');
  const { canAccess } = useCanAccess();
  const { slug, taskNumber } = router.query;
  const [isDragOver, setIsDragOver] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragOver(false);
    const files = Array.from(e.dataTransfer.files);
    const file = files[0];
    const isAvailable = checkExtensionAndMIMEType(file);
    if (isAvailable) {
      setSelectedFile(file);
    } else {
      toast.error('Not supported type of file');
    }
  };

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    if (event.target.files && event.target.files.length > 0) {
      const file = event.target.files[0];

      const reader = new FileReader();
      reader.onloadend = () => {
        const isAvailable = checkExtensionAndMIMEType(file);
        if (isAvailable) {
          setSelectedFile(file);
        } else {
          toast.error('Not supported type of file');
        }
      };
      reader.readAsDataURL(file);
    }
  };

  const handleClick = () => {
    if (inputRef.current) {
      inputRef.current.click();
    }
  };

  useEffect(() => {
    const uploadFile = async () => {
      if (selectedFile && typeof slug === 'string') {
        try {
          const formData = new FormData();
          formData.append('file', selectedFile);
          formData.append('slug', slug);
          formData.append('taskId', String(task.id));
          const response = await axios.post(
            `/api/teams/${slug}/tasks/${taskNumber}/attachments`,
            formData,
            {
              headers: {
                'Content-Type': 'multipart/form-data',
              },
            }
          );

          const { error } = response.data;

          if (error) {
            toast.error(error.message);
            return;
          }

          toast.success('Attachment uploaded');
          mutateTask();
        } catch (error: any) {
          toast.error(error?.message);
          console.error(error);
        }
      }
    };

    uploadFile();
  }, [selectedFile]);

  //TODO: refactoring
  if (!canAccess('task', ['update'])) {
    return (
      <>
        {task.attachments.length ? (
          <div className="flex items-center justify-center w-full">
            <div
              className={`flex flex-wrap ${
                task.attachments.length ? 'justify-start' : 'justify-center'
              } h-full w-full px-4 py-2 transition bg-white dark:bg-[color:hsla(var(--b1))] border-2 ${
                isDragOver ? 'border-blue-400' : 'border-gray-300'
              } border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none`}
            >
              {task.attachments.map((attachment, index) => (
                <AttachmentsCard
                  key={index}
                  attachment={attachment}
                  taskNumber={taskNumber as string}
                  teamSlug={slug as string}
                  mutateTask={mutateTask}
                />
              ))}
            </div>
          </div>
        ) : (
          <EmptyState title={t('no-attachments')} />
        )}
      </>
    );
  }

  return (
    <div className="flex items-center justify-center w-full">
      <div
        className={`flex flex-wrap ${
          task.attachments.length ? 'justify-start' : 'justify-center'
        } h-full w-full px-4 py-2 transition bg-white dark:bg-[color:hsla(var(--b1))] border-2 ${
          isDragOver ? 'border-blue-400' : 'border-gray-300'
        } border-dashed rounded-md appearance-none cursor-pointer hover:border-gray-400 focus:outline-none`}
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
      >
        {task.attachments.length ? (
          task.attachments.map((attachment, index) => (
            <AttachmentsCard
              key={index}
              attachment={attachment}
              taskNumber={taskNumber as string}
              teamSlug={slug as string}
              mutateTask={mutateTask}
            />
          ))
        ) : (
          <div className="flex items-center justify-center">
            <span className="flex items-center space-x-2">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                className="w-6 h-6 text-gray-600 dark:text-gray-400"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
              <span className="font-medium text-gray-600 dark:text-gray-400">
                {isDragOver
                  ? 'Release to attach files'
                  : 'Drop files to attach, or '}
                <span className="text-blue-600 underline">browse</span>
              </span>
            </span>
          </div>
        )}
        <input
          ref={inputRef}
          type="file"
          name="file_upload"
          className="hidden"
          onChange={handleFileChange}
        />
      </div>
    </div>
  );
};

export default Attachments;
