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
        <Label htmlFor="cbvo-control">{t('select-a-control')}</Label>
        <Input id="cbvo-control" value={controlLabel} readOnly />
      </div>

      <div>
        <Label htmlFor="cbvo-code">{t('code')}</Label>
        <Input id="cbvo-code" value={codeLabel} readOnly />
      </div>

      <div>
        <Label htmlFor="cbvo-section">{t('section')}</Label>
        <Input id="cbvo-section" value={sectionLabel} readOnly />
      </div>

      <div>
        <Label htmlFor="cbvo-status">{t('status')}</Label>
        <Input id="cbvo-status" value={statusLabel} readOnly />
      </div>

      <div>
        <Label htmlFor="cbvo-requirements">{t('requirements')}</Label>
        <Textarea
          id="cbvo-requirements"
          value={requirementsLabel}
          readOnly
          className="resize-y max-h-[20vh]"
        />
      </div>

      <div className="h-px w-full bg-slate-200 dark:bg-slate-700 my-6" />
    </div>
  );
};

export default ControlBlockViewOnly;
