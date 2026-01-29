import DaisyBadge from '@/components/shared/daisyUI/DaisyBadge';
import { useTranslation } from 'next-i18next';

// TODO: should be Permitted be calculated based on Value?
const RiskLevel = ({ value }) => {
  const { t } = useTranslation('common');

  return (
    <div>
      <span className="font-bold">
        {t('risk-level')} = {value}
      </span>
      <DaisyBadge appearance="added">{t('tia-permitted-badge')}</DaisyBadge>
    </div>
  );
};

export default RiskLevel;
