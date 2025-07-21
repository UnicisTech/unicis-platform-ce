import { useTranslation } from 'next-i18next';
import Link from 'next/link';

const AgreeMessage = ({ text }) => {
  const { t } = useTranslation('common');

  const linkClasses =
    'text-blue-600 hover:text-blue-800 dark:text-blue-400 dark:hover:text-blue-300';

  return (
    <p className="text-sm text-center text-muted-foreground">
      {t('agree-message-part', { button: t(text) })}{' '}
      <Link
        href="https://www.unicis.tech/terms"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
      >
        {t('terms')}
      </Link>
      {', '}
      <Link
        href="https://www.unicis.tech/privacy"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
      >
        {t('privacy')}
      </Link>{' '}
      {t('and')}{' '}
      <Link
        href="https://www.unicis.tech/security"
        target="_blank"
        rel="noopener noreferrer"
        className={linkClasses}
      >
        {t('security')}
      </Link>
    </p>
  );
};

export default AgreeMessage;
