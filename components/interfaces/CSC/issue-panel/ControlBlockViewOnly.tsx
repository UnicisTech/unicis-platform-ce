import React from 'react';
import { useTranslation } from 'next-i18next';
import { Input } from '@/components/shadcn/ui/input';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { Label } from '@/components/shadcn/ui/label';
import { ISO } from 'types';
import frameworks from '@/lib/csc/frameworks';
import { CscStatus } from '@/lib/csc/csc-statuses';

const ControlBlockViewOnly = ({
  status,
  control,
  ISO,
}: {
  status: CscStatus;
  control: string;
  ISO: ISO;
}) => {
  const { t } = useTranslation('common');

  const codeLabel = t(`csc/${ISO}:controls.${control}.code`);
  const controlLabel = t(`csc/${ISO}:controls.${control}.control`);
  const requirementsLabel = t(`csc/${ISO}:controls.${control}.requirements`);

  const sectionId = frameworks[ISO].controls.find(
    ({ id }) => id === control
  )?.sectionId;
  const sectionLabel = t(`csc/${ISO}:sections.${sectionId}.label`);
  const statusLabel = t(`statuses.${status}.label`);

  return (
    <div className="space-y-4">
      <div>
        <Label>{t('select-a-control')}</Label>
        <Input value={controlLabel} readOnly />
      </div>

      <div>
        <Label>{t('code')}</Label>
        <Input value={codeLabel} readOnly />
      </div>

      <div>
        <Label>{t('section')}</Label>
        <Input value={sectionLabel} readOnly />
      </div>

      <div>
        <Label>{t('status')}</Label>
        <Input value={statusLabel} readOnly />
      </div>

      <div>
        <Label>{t('requirements')}</Label>
        <Textarea
          value={requirementsLabel}
          readOnly
          className="resize-y max-h-[20vh]"
        />
      </div>

      <div className="h-px w-full bg-muted my-6" />
    </div>
  );
};

export default ControlBlockViewOnly;
