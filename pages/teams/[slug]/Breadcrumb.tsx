import { useTranslation } from 'next-i18next';

const Breadcrumb = ({
  teamName,
  taskTitle,
  taskNumber,
  backTo,
}: {
  teamName: string;
  taskTitle: string;
  taskNumber: string;
  backTo?: string;
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="text-sm breadcrumbs">
      <ul>
        <li>{teamName || t('Home')}</li>
        <li>
          <a href={backTo || '/'} className="link link-hover">
            {t('Tasks')}
          </a>
        </li>
        <li>{`${taskNumber} - ${taskTitle}`}</li>
      </ul>
    </div>
  );
};

export default Breadcrumb;
