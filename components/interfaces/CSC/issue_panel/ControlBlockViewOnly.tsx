import React, { useMemo } from 'react';
import { useTranslation } from 'next-i18next';
import { getControlOptions } from '@/components/defaultLanding/data/configs/csc';
import { Input } from '@/components/shadcn/ui/input';
import { Textarea } from '@/components/shadcn/ui/textarea';
import { Label } from '@/components/shadcn/ui/label';

const ControlBlockViewOnly = ({
  status,
  control,
  ISO,
}: {
  status: string;
  control: string;
  ISO: string;
}) => {
  const { t } = useTranslation('common');
  const controlOptions = useMemo(() => getControlOptions(ISO), [ISO]);
  const controlData = controlOptions.find(
    ({ value }) => value.control === control
  )?.value;

  return (
    <div className="space-y-4">
      <div>
        <Label>{t('select-a-control')}</Label>
        <Input
          value={
            controlOptions.find(({ value }) => value.control === control)?.label
          }
          readOnly
        />
      </div>

      {controlData?.code && (
        <div>
          <Label>{t('code')}</Label>
          <Input value={controlData.code} readOnly />
        </div>
      )}

      {controlData?.section && (
        <div>
          <Label>{t('section')}</Label>
          <Input value={controlData.section} readOnly />
        </div>
      )}

      <div>
        <Label>{t('status')}</Label>
        <Input value={status} readOnly />
      </div>

      {controlData?.requirements && (
        <div>
          <Label>{t('requirements')}</Label>
          <Textarea
            value={controlData.requirements}
            readOnly
            className="resize-y max-h-[20vh]"
          />
        </div>
      )}

      <div className="h-px w-full bg-muted my-6" />
    </div>
  );
};

export default ControlBlockViewOnly;
