import { useTranslation } from 'next-i18next';
import Link from 'next/link';

const AgreeMessage = ({ text }) => {
  const { t } = useTranslation('common');

  return (
    <p className="text-sm text-center">
      {t('agree-message-part', { button: t(text) })}{' '}
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={'https://www.unicis.tech/terms'}
        className="font-medium text-primary hover:text-primary-focus"
      >
        {t('terms')}
      </Link>
      {','}{' '}
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={'https://www.unicis.tech/privacy'}
        className="font-medium text-primary hover:text-primary-focus"
      >
        {t('privacy')}
      </Link>{' '}
      {t('and')}{' '}
      <Link
        rel="noopener noreferrer"
        target="_blank"
        href={'https://www.unicis.tech/security'}
        className="font-medium text-primary hover:text-primary-focus"
      >
        {t('security')}
      </Link>
    </p>
  );
};

export default AgreeMessage;
