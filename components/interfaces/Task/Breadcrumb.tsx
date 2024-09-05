import { Link } from 'react-daisyui';
import { useTranslation } from 'react-i18next';

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
          <Link href={backTo || '/'}>{t('Tasks')}</Link>
        </li>
        <li>{`${taskNumber} - ${taskTitle}`}</li>
      </ul>
    </div>
  );
};

export default Breadcrumb;
