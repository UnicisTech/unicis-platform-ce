import * as React from 'react';
import { useState, useCallback } from 'react';
import toast from 'react-hot-toast';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Loader2 } from 'lucide-react';
import type { TaskWithRpaProcedure } from 'types';
import type { Task } from '@prisma/client';

interface DeleteTiaProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  task: Task | TaskWithRpaProcedure;
  mutate: () => Promise<void>;
}

export default function DeleteProcedure({
  visible,
  setVisible,
  task,
  mutate,
}: DeleteTiaProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query as { slug: string };

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteProcedure = useCallback(async () => {
    try {
      setIsDeleting(true);

      const res = await fetch(
        `/api/teams/${slug}/tasks/${task.taskNumber}/tia`,
        {
          method: 'DELETE',
        }
      );

      const { error } = await res.json();
      if (!res.ok || error) {
        toast.error(error?.message || 'Request failed');
        return;
      }

      toast.success('Procedure deleted.');
      await mutate();
      setVisible(false);
    } catch (err: any) {
      toast.error(err?.message || 'Unexpected error');
    } finally {
      setIsDeleting(false);
    }
  }, [slug, task.taskNumber, mutate, setVisible]);

  const closeHandler = useCallback(() => {
    setVisible(false);
  }, [setVisible]);

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>{t('tia-delete-title')}</DialogTitle>
        </DialogHeader>

        <div className="my-4 text-sm">{t('tia-delete-description')}</div>

        <DialogFooter className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button
              variant="outline"
              disabled={isDeleting}
              onClick={closeHandler}
            >
              {t('close') || 'Close'}
            </Button>
          </DialogClose>

          <Button
            variant="destructive"
            onClick={deleteProcedure}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('delete') || 'Delete'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
