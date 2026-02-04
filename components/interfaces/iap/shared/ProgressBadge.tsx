import { StatusBadge } from '@/components/shared';
import { useTranslation } from 'next-i18next';

const ProgressBadge = ({ progress }: { progress: number }) => {
  const { t } = useTranslation('common');

  return (
    <>
      {progress === 100 ? (
        <StatusBadge label={t('progress.done')} value="done" />
      ) : progress > 0 ? (
        <StatusBadge label={t('progress.inprogress')} value="inprogress" />
      ) : (
        <StatusBadge label={t('progress.todo')} value="todo" />
      )}
    </>
  );
};

export default ProgressBadge;
