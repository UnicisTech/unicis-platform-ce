import { useState } from 'react';
import { useTranslation } from 'next-i18next';
import { Download, Loader2 } from 'lucide-react';
import type { ExportFormat } from '@/lib/soa/types';
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

interface Props {
  isOpen: boolean;
  onClose: () => void;
  onExport: (format: ExportFormat) => Promise<void>;
  frameworkName: string;
}

const FORMAT_VALUES: { value: ExportFormat; icon: string }[] = [
  { value: 'xlsx', icon: '📊' },
  { value: 'ods', icon: '📋' },
  { value: 'pdf', icon: '📄' },
  { value: 'html', icon: '🌐' },
];

export default function SoaExportModal({
  isOpen,
  onClose,
  onExport,
  frameworkName,
}: Props) {
  const { t } = useTranslation('common');
  const [selected, setSelected] = useState<ExportFormat>('xlsx');
  const [loading, setLoading] = useState(false);

  const formats = FORMAT_VALUES.map((f) => ({
    ...f,
    label: t(`soa-export.format-${f.value}-label`),
    description: t(`soa-export.format-${f.value}-description`),
  }));

  async function handleDownload() {
    setLoading(true);
    try {
      await onExport(selected);
      onClose();
    } finally {
      setLoading(false);
    }
  }

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (loading) return;
        if (!open) onClose();
      }}
    >
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle>{t('soa-export.modal-title')}</DialogTitle>
          <DialogDescription>
            {t('soa-export.modal-framework')} <strong>{frameworkName}</strong>
          </DialogDescription>
        </DialogHeader>

        <RadioGroup
          value={selected}
          onValueChange={(value) => setSelected(value as ExportFormat)}
          className="gap-3"
        >
          {formats.map((f) => (
            <Label
              key={f.value}
              htmlFor={`soa-format-${f.value}`}
              className={cn(
                'flex items-start gap-3 rounded-lg border p-3 transition-colors',
                loading ? 'cursor-not-allowed opacity-70' : 'cursor-pointer',
                selected === f.value
                  ? 'border-primary bg-primary/5'
                  : 'border-border hover:border-foreground/30 hover:bg-muted/60'
              )}
            >
              <RadioGroupItem
                id={`soa-format-${f.value}`}
                value={f.value}
                className="mt-0.5 shrink-0"
                disabled={loading}
              />
              <div>
                <div className="text-sm font-medium">
                  {f.icon}&nbsp;{f.label}
                </div>
                <div className="mt-0.5 text-xs text-muted-foreground">
                  {f.description}
                </div>
              </div>
            </Label>
          ))}
        </RadioGroup>

        <DialogFooter className="gap-2 sm:gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            disabled={loading}
          >
            {t('soa-export.cancel')}
          </Button>
          <Button onClick={handleDownload} disabled={loading} className="gap-2">
            {loading ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                {t('soa-export.exporting')}
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                {t('soa-export.download')}
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
