import React, { useState, useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { Button } from '@/components/shadcn/ui/button';
import { Input } from '@/components/shadcn/ui/input';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { Combobox } from '@/components/shadcn/ui/combobox';
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
  const controlOptions = useMemo(() => {
    const baseOptions = availableControls.map((availableControl) => {
      const code = t(`csc/${ISO}:controls.${availableControl.id}.code`);
      const controlTitle = t(
        `csc/${ISO}:controls.${availableControl.id}.control`
      );
      const requirements = t(
        `csc/${ISO}:controls.${availableControl.id}.requirements`
      );
      const section = t(
        `csc/${ISO}:sections.${availableControl.sectionId}.label`
      );

      return {
        value: availableControl.id,
        label: `${code}: ${section}, ${controlTitle}`,
        description: requirements,
        searchValue: `${code} ${section} ${controlTitle} ${requirements}`,
      };
    });

    if (!control || baseOptions.some((option) => option.value === control)) {
      return baseOptions;
    }

    return [
      {
        value: control,
        label: `${codeLabel}: ${sectionLabel}, ${controlLabel}`,
        description: requirementsLabel,
        searchValue: `${codeLabel} ${sectionLabel} ${controlLabel} ${requirementsLabel}`,
      },
      ...baseOptions,
    ];
  }, [
    ISO,
    availableControls,
    codeLabel,
    control,
    controlLabel,
    requirementsLabel,
    sectionLabel,
    t,
  ]);

  return (
    <div className="space-y-4">
      <div className="space-y-1">
        <Label>{t('select-a-control')}</Label>
        <div className="grid grid-cols-[1fr_auto] gap-2 items-center">
          <Combobox
            options={controlOptions}
            value={control || null}
            onValueChange={(newVal) => onControlChange(control, newVal ?? '')}
            placeholder={t('choose-a-control')}
            searchPlaceholder={t('search')}
            disabled={isSaving || isDeleting}
          />

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
