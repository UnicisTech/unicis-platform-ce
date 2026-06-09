import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { cn } from '@/components/shadcn/lib/utils';
import { Button } from '@/components/shadcn/ui/button';
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from '@/components/shadcn/ui/dialog';
import { Label } from '@/components/shadcn/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/shadcn/ui/radio-group';
import { Badge } from '@/components/shadcn/ui/badge';
import {
  CSC_STATUSES,
  CSC_STATUS_TO_CSS,
  type CscStatus,
} from '@/lib/csc/csc-statuses';

/** Statuses shown in the prompt (exclude 'unknown' — that's what we're moving away from) */
const SELECTABLE_STATUSES = CSC_STATUSES.filter((s) => s !== 'unknown');

interface StatusPromptDialogProps {
  isOpen: boolean;
  controlCode: string;
  controlTitle: string;
  onConfirm: (status: CscStatus) => Promise<void>;
  onSkip: () => void;
}

export default function StatusPromptDialog({
  isOpen,
  controlCode,
  controlTitle,
  onConfirm,
  onSkip,
}: StatusPromptDialogProps) {
  const { t } = useTranslation('common');
  const [selected, setSelected] = useState<CscStatus | ''>('');
  const [loading, setLoading] = useState(false);

  const handleConfirm = async () => {
    if (!selected) return;
    setLoading(true);
    try {
      await onConfirm(selected);
    } finally {
      setLoading(false);
      setSelected('');
    }
  };

  const handleSkip = () => {
    setSelected('');
    onSkip();
  };

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (loading) return;
        if (!open) handleSkip();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('csc-status-prompt.title')}</DialogTitle>
          <DialogDescription>
            {t('csc-status-prompt.description')}{' '}
            <Badge variant="secondary" className="font-mono font-bold">
              {controlCode}
            </Badge>{' '}
            <span className="text-slate-700 dark:text-slate-200">{controlTitle}</span>
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selected}
          onValueChange={(val) => setSelected(val as CscStatus)}
          className="gap-2 max-h-72 overflow-y-auto pr-1"
        >
          {SELECTABLE_STATUSES.map((status) => (
            <Label
              key={status}
              htmlFor={`csc-status-prompt-${status}`}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-2.5 transition-colors',
                loading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
                selected === status
                  ? 'border-blue-500 dark:border-blue-400 bg-blue-50 dark:bg-blue-950/40'
                  : 'border-slate-200 dark:border-slate-700 hover:border-slate-300 hover:bg-slate-50 dark:hover:bg-slate-700/50'
              )}
            >
              <RadioGroupItem
                id={`csc-status-prompt-${status}`}
                value={status}
                className="mt-0.5 shrink-0"
                disabled={loading}
              />
              <div className="min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span
                    className={cn(
                      'inline-block h-3 w-3 rounded-full shrink-0',
                      CSC_STATUS_TO_CSS[status] || 'bg-slate-200 dark:bg-slate-700'
                    )}
                    aria-hidden="true"
                  />
                  <span className="text-sm font-medium">
                    {t(`statuses.${status}.label`)}
                  </span>
                </div>
                <p className="text-xs text-slate-500 dark:text-slate-400 mt-0.5 leading-snug">
                  {t(`statuses.${status}.description`)}
                </p>
              </div>
            </Label>
          ))}
        </RadioGroup>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={handleSkip}
            disabled={loading}
          >
            {t('csc-status-prompt.skip')}
          </Button>
          <Button
            onClick={handleConfirm}
            disabled={loading || !selected}
            className="gap-2"
          >
            {t('csc-status-prompt.confirm')}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
