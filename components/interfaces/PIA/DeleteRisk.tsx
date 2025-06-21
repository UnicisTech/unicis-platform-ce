import * as React from 'react';
import { useState, useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import { useRouter } from 'next/router';
import axios from 'axios';
import toast from 'react-hot-toast';
import { getAxiosError } from '@/lib/common';

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

import type { ApiResponse, TaskWithRpaProcedure } from 'types';
import type { Task } from '@prisma/client';

interface DeleteRiskProps {
  visible: boolean;
  setVisible: (open: boolean) => void;
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
  const { slug } = router.query;

  const [isDeleting, setIsDeleting] = useState(false);

  const deleteRisk = useCallback(async () => {
    try {
      setIsDeleting(true);

      const response = await axios.delete<ApiResponse<Task>>(
        `/api/teams/${slug}/tasks/${task.taskNumber}/pia`
      );
      const { error } = response.data;

      if (error) {
        toast.error(error.message);
        return;
      } else {
        toast.success(t('riskDeleted', 'Risk deleted.'));
      }

      await mutate();
      setVisible(false);
    } catch (err: any) {
      toast.error(getAxiosError(err));
    } finally {
      setIsDeleting(false);
    }
  }, [slug, task, mutate, setVisible, t]);

  return (
    <Dialog open={visible} onOpenChange={setVisible}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('pia-remove-title')}</DialogTitle>
        </DialogHeader>

        <div className="my-4 text-sm">{t('pia-remove-description')}</div>

        <DialogFooter className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline" disabled={isDeleting}>
              {t('close', 'Close')}
            </Button>
          </DialogClose>
          <Button
            variant="destructive"
            onClick={deleteRisk}
            disabled={isDeleting}
          >
            {isDeleting && <Loader2 className="mr-2 h-4 w-4 animate-spin" />}
            {t('delete', 'Delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
