import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Textarea } from '@/components/shadcn/ui/textarea';
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from '@/components/shadcn/ui/select';
import StatusSelector from '../StatusSelector';
import { Loader2, Trash2 } from 'lucide-react';
import { Label } from '@/components/shadcn/ui/label';
import { ISO } from 'types';
import frameworks from '@/lib/csc/frameworks';

const ControlBlock = ({
  ISO,
  status,
  control,
  controls,
  isSaving,
  isDeleting,
  onControlChange,
  onStatusChange,
  onDeleteControl,
}: {
  ISO: ISO;
  status: string;
  control: string;
  controls: string[];
  isSaving: boolean;
  isDeleting: boolean;
  onStatusChange: (
    control: string,
    value: string
  ) => Promise<string | undefined>;
  onControlChange: (oldControl: string, newControl: string) => void;
  onDeleteControl: (control: string) => void;
}) => {
  const { t } = useTranslation('common');
  const [isButtonLoading, setIsButtonLoading] = useState(false);

  const availableControls = useMemo(() => {
    return frameworks[ISO].controls.filter(
      (control) => !controls.includes(control.id)
    );
  }, [controls, ISO]);

  const codeLabel = t(`csc/${ISO}:controls.${control}.code`);
  const controlLabel = t(`csc/${ISO}:controls.${control}.control`);
  const requirementsLabel = t(`csc/${ISO}:controls.${control}.requirements`);

  const sectionId = frameworks[ISO].controls.find(
    ({ id }) => id === control
  )?.sectionId;
  const sectionLabel = t(`csc/${ISO}:sections.${sectionId}.label`);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>{t('select-a-control')}</Label>
        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
          <Select
            value={control}
            onValueChange={(newVal) => onControlChange(control, newVal)}
            disabled={isSaving || isDeleting}
          >
            <SelectTrigger className="w-full">
              <SelectValue placeholder={t('choose-a-control')}>
                {`${codeLabel}: ${sectionLabel}, ${controlLabel}`}
              </SelectValue>
            </SelectTrigger>
            <SelectContent
              className="w-(--radix-select-trigger-width) max-w-full"
              align="start"
            >
              {availableControls.map((control) => {
                const codeLabel = t(`csc/${ISO}:controls.${control.id}.code`);
                const controlLabel = t(
                  `csc/${ISO}:controls.${control.id}.control`
                );
                const requirementsLabel = t(
                  `csc/${ISO}:controls.${control.id}.requirements`
                );
                const sectionLabel = t(
                  `csc/${ISO}:sections.${control.sectionId}.label`
                );

                return (
                  <SelectItem
                    key={control.id}
                    value={control.id}
                    className="whitespace-normal break-words"
                  >
                    <div className="text-sm font-medium leading-snug">
                      {codeLabel}: {sectionLabel}
                    </div>
                    <div className="text-xs text-muted-foreground leading-snug">
                      {controlLabel} – {requirementsLabel}
                    </div>
                  </SelectItem>
                );
              })}
            </SelectContent>
          </Select>

          <Button
            variant="destructive"
            size="icon"
            disabled={isSaving}
            onClick={async () => {
              setIsButtonLoading(true);
              await onDeleteControl(control);
              setIsButtonLoading(false);
            }}
          >
            {isButtonLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Trash2 className="h-4 w-4" />
            )}
          </Button>
        </div>
      </div>

      {control === '' ? null : (
        <>
          <div className="space-y-1">
            <Label>{t('code')}</Label>
            <Input value={codeLabel} readOnly />
          </div>
          <div className="space-y-1">
            <Label>{t('section')}</Label>
            <Input value={sectionLabel} readOnly />
          </div>
          <div className="space-y-1">
            <Label>{t('status')}</Label>
            <StatusSelector
              statusValue={status}
              control={control}
              handler={onStatusChange}
              isDisabled={false}
            />
          </div>
          <div className="space-y-1">
            <Label>{t('requirements')}</Label>
            <Textarea
              value={requirementsLabel}
              readOnly
              className="resize-y max-h-[20vh]"
            />
          </div>
        </>
      )}
      <div className="h-px w-full bg-muted my-6" />
    </div>
  );
};

export default ControlBlock;
