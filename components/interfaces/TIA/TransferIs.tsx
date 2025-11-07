import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge';
import { useTranslation } from 'next-i18next';

const TransferIs = ({ value }: { value: string }) => {
  const { t } = useTranslation('common');

  return (
    <div>
      <span className="font-bold">{t('tia-based-on-answer-is')}</span>
      <DaisyBadge
        appearance={value === 'NOT PERMITTED' ? 'important' : 'added'}
      >
        {value}
      </DaisyBadge>
    </div>
  );
};

export default TransferIs;
