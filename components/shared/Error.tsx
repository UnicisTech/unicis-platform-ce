import { useTranslation } from 'next-i18next';

import Alert from './Alert';

interface ErrorProps {
  message?: string;
}

const Error = (props: ErrorProps) => {
  const { message } = props;
  const { t } = useTranslation('common');

  return (
    <Alert status="error" className="my-2">
      <p>{message || t('errors.unknown')}</p>
    </Alert>
  );
};

export default Error;
