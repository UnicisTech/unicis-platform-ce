import { Message } from '@/components/shared';
import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge';
import { useTranslation } from 'next-i18next';
import { isTranferPermitted } from '@/lib/tia/helpers';

interface ConclusionStepProps {
  procedure: any;
}

export default function ConclusionStep({ procedure }: ConclusionStepProps) {
  const { t } = useTranslation('common');

  return (
    <>
      <Message text={t('to-be-completed-by-the-exporter')} />

      <p>
        <span className="font-bold">
          {t('in-view-of-the-above-transfer-is')}
        </span>
        {isTranferPermitted(procedure) ? (
          <DaisyBadge color="success">{t('tia-permitted-badge')}</DaisyBadge>
        ) : (
          <DaisyBadge color="error">{t('tia-not-permitted-badge')}</DaisyBadge>
        )}
      </p>
    </>
  );
}
