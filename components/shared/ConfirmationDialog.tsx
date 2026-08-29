import * as React from 'react';
import { useCallback } from 'react';
import { useTranslation } from 'next-i18next';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from '@/components/shadcn/ui/dialog';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Label } from '@/components/shadcn/ui/label';
import { Loader2 } from 'lucide-react';

interface TextConfirmation {
  requiredText: string;
  label: string;
  placeholder?: string;
  description?: React.ReactNode;
  caseSensitive?: boolean;
}

interface ConfirmationDialogProps {
  title: string;
  visible: boolean;
  onConfirm: () => void | Promise<any>;
  onCancel: () => void;
  confirmText?: string;
  cancelText?: string;
  confirmation?: TextConfirmation;
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
  confirmation,
}: ConfirmationDialogProps) {
  const { t } = useTranslation('common');
  const [isLoading, setIsLoading] = React.useState<boolean>(false);
  const [confirmationValue, setConfirmationValue] = React.useState('');
  const confirmationInputId = React.useId();
  const confirmationDescriptionId = React.useId();

  const handleCancel = useCallback(() => {
    setConfirmationValue('');
    onCancel();
  }, [onCancel]);

  const isConfirmationValid = confirmation
    ? confirmation.caseSensitive
      ? confirmationValue === confirmation.requiredText
      : confirmationValue.toLowerCase() ===
        confirmation.requiredText.toLowerCase()
    : true;

  const handleConfirm = useCallback(async () => {
    if (!isConfirmationValid) {
      return;
    }

    setIsLoading(true);
    try {
      const shouldClose = await onConfirm();

      if (shouldClose !== false) {
        handleCancel();
      }
    } finally {
      setIsLoading(false);
    }
  }, [handleCancel, isConfirmationValid, onConfirm]);

  return (
    <Dialog
      open={visible}
      onOpenChange={(open) => {
        if (!open) {
          handleCancel();
        }
      }}
    >
      <DialogContent className="sm:max-w-lg">
        <DialogHeader>
          <DialogTitle>{title}</DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-4">
          <div className="text-sm leading-6">{children}</div>

          {confirmation && (
            <div className="space-y-2">
              <Label htmlFor={confirmationInputId}>{confirmation.label}</Label>
              <Input
                id={confirmationInputId}
                value={confirmationValue}
                placeholder={confirmation.placeholder}
                onChange={(event) => setConfirmationValue(event.target.value)}
                disabled={isLoading}
                autoComplete="off"
                aria-describedby={
                  confirmation.description
                    ? confirmationDescriptionId
                    : undefined
                }
              />
              {confirmation.description && (
                <p
                  id={confirmationDescriptionId}
                  className="text-xs text-muted-foreground"
                >
                  {confirmation.description}
                </p>
              )}
            </div>
          )}
        </div>

        <DialogFooter className="flex justify-end space-x-2">
          <Button type="button" variant="outline" onClick={handleCancel}>
            {cancelText || t('cancel')}
          </Button>
          <Button
            type="button"
            variant="destructive"
            disabled={isLoading || !isConfirmationValid}
            onClick={(event) => {
              event.preventDefault();
              event.stopPropagation();
              handleConfirm();
            }}
          >
            {isLoading && <Loader2 className="animate-spin" />}
            {confirmText || t('delete')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
