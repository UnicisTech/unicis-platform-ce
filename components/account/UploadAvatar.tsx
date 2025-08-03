import React, { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { ArrowUpCircleIcon } from '@heroicons/react/24/outline';
import type { User } from '@prisma/client';
import type { ApiResponse, UserReturned } from 'types';
import { defaultHeaders } from '@/lib/common';

import {
  Card,
  CardHeader,
  CardTitle,
  CardDescription,
  CardContent,
  CardFooter,
} from '@/components/shadcn/ui/card';
import { Button } from '@/components/shadcn/ui/button';
import { Loader2 } from 'lucide-react';

const MAX = 1_000_000; // 1 MB

const UploadAvatar: React.FC<{ user: Partial<User> }> = ({ user }) => {
  const { t } = useTranslation('common');
  const [dragActive, setDragActive] = useState(false);
  const defaultImage =
    user.image || `https://api.dicebear.com/7.x/initials/svg?seed=${user.name}`;
  const [image, setImage] = useState<string | null>(defaultImage);
  const [loading, setLoading] = useState(false);
  const [hasChanged, setHasChanged] = useState(false);

  const uploadFile = (file: File) => {
    console.log('file.size', file.size)
    if (file.size > MAX) {
      toast.error(t('file-too-big'));
      return;
    }
    if (!['image/png', 'image/jpeg'].includes(file.type)) {
      toast.error(t('file-type-not-supported'));
      return;
    }
    const reader = new FileReader();
    reader.onload = (e) => {
      const newImage = e.target?.result as string;
      setImage(newImage);
      setHasChanged(true);
    };
    reader.readAsDataURL(file);
  };
  

  const onDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setDragActive(false);
    const file = e.dataTransfer.files[0];
    if (file) uploadFile(file);
  };

  const onChange = useCallback((e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) uploadFile(file);
  }, []);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    const res = await fetch('/api/users', {
      method: 'PUT',
      headers: defaultHeaders,
      body: JSON.stringify({ image }),
    });
    const json = (await res.json()) as ApiResponse<UserReturned>;
    setLoading(false);
    if (!res.ok) toast.error(json.error.message);
    else {
      toast.success(t('successfully-updated'));
      setHasChanged(false); // reset after saving
    }
  };
  

  return (
    <form onSubmit={handleSubmit}>
      <Card>
        <CardHeader>
          <CardTitle>{t('avatar')}</CardTitle>
          <CardDescription>
            {t('custom-avatar')}
            <br />
            {t('avatar-type')}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="relative inline-block">
            <div
              onDragOver={(e) => {
                e.preventDefault();
                setDragActive(true);
              }}
              onDragLeave={(e) => {
                e.preventDefault();
                setDragActive(false);
              }}
              onDrop={onDrop}
              className={`
                group relative flex h-24 w-24 cursor-pointer items-center justify-center
                overflow-hidden rounded-full border border-border bg-background
                transition hover:bg-muted`}
            >
              <input
                type="file"
                accept="image/png, image/jpeg"
                onChange={onChange}
                className="absolute inset-0 opacity-0 cursor-pointer z-20 pointer-events-auto"
              />
              {image && (
                <img
                  src={image}
                  alt={user.name}
                  className="h-full w-full object-cover"
                />
              )}
              <div
                className={`
                  absolute inset-0 flex items-center justify-center bg-background/50 
                  transition-opacity ${dragActive ? 'opacity-100' : 'opacity-0'} 
                  group-hover:opacity-100`}
              >
                <ArrowUpCircleIcon className="h-10 w-10 text-muted-foreground" />
              </div>
            </div>
          </div>
        </CardContent>
        <CardFooter className="flex justify-end">
          <Button type="submit" disabled={!hasChanged}>
            {loading && <Loader2 className="animate-spin" />}
            {t('save-changes')}
          </Button>
        </CardFooter>
      </Card>
    </form>
  );
};

export default UploadAvatar;
