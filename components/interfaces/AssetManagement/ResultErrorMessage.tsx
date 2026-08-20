import { useTranslation } from 'next-i18next';

const cleanResultError = (error: unknown) => {
  if (!error) {
    return '';
  }

  const message = String(error);
  const scheduledQueryWithIdMatch = message.match(
    /^Error executing scheduled query\s+.*query:[0-9a-fA-F-]{36}:\s*(.+)$/i
  );
  const scheduledQueryMatch = message.match(
    /^Error executing scheduled query\s+[^:]+:\s*(.+)$/i
  );

  return (
    scheduledQueryWithIdMatch?.[1]?.trim() ||
    scheduledQueryMatch?.[1]?.trim() ||
    message
  );
};

const ResultErrorMessage = ({ error }: { error: unknown }) => {
  const { t } = useTranslation('common');
  const message = cleanResultError(error);

  return (
    <div className="rounded-md border border-destructive/30 bg-destructive/5 p-3 text-sm text-destructive">
      <span className="font-medium">{t('query-failed')}:</span>{' '}
      {message || t('unknown-error')}
    </div>
  );
};

export default ResultErrorMessage;
