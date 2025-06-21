import * as React from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
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

interface ConfirmationDialogProps {
  title: string;
  visible: boolean;
  onConfirm: () => void | Promise<any>;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  children: React.ReactNode;
}

export default function ConfirmationDialog({
  title,
  children,
  visible,
  onConfirm,
  onCancel,
  confirmText,
  cancelText,
}: ConfirmationDialogProps) {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);

  const handleConfirm = useCallback(async () => {
    setIsLoading(true);
    await onConfirm();
    setIsLoading(false);
    onCancel();
  }, [onConfirm, onCancel]);

  return (
    <Dialog open={visible} onOpenChange={onCancel}>
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="text-sm leading-6 py-4">{children}</div>

        <DialogFooter className="flex justify-end space-x-2">
          <DialogClose asChild>
            <Button variant="outline" onClick={onCancel}>
              {cancelText || t('cancel')}
            </Button>
          </DialogClose>
          <Button variant="destructive" onClick={handleConfirm}>
            {isLoading && <Loader2 className="animate-spin" />}
            {confirmText || t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
