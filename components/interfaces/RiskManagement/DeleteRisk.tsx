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

interface DeleteRiskProps {
  visible: boolean;
  setVisible: (visible: boolean) => void;
  task: Task | TaskWithRpaProcedure;
  mutate: () => Promise<void>;
}

export default function DeleteRisk({
  visible,
  setVisible,
  task,
  mutate,
}: DeleteRiskProps) {
  const { t } = useTranslation('common');
  const router = useRouter();
  const { slug } = router.query as { slug: string };

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteRisk = useCallback(async () => {
    try {
      setIsDeleting(true);

      const res = await fetch(`/api/teams/${slug}/tasks/${task.taskNumber}/rm`, {
        method: 'DELETE',
      });

      const { error } = await res.json();
      if (!res.ok || error) {
        toast.error(error?.message || 'Request failed');
        return;
      }

      toast.success(t('risk_deleted') || 'Risk deleted.');
      await mutate();
      setVisible(false);
    } catch (err: any) {
      toast.error(err?.message || 'Unexpected error');
    } finally {
      setIsDeleting(false);
    }
  }, [slug, task, mutate, setVisible, t]);

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="max-w-md p-6">
        <DialogHeader>
          <DialogTitle>{t('rm-remove-title')}</DialogTitle>
        </DialogHeader>

        <div className="my-4 text-sm">{t('rm-remove-description')}</div>

        <DialogFooter className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              {t('close') || 'Close'}
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={deleteRisk}
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
