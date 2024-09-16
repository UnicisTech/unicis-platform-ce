import { Link } from 'react-daisyui';
import { useTranslation } from 'react-i18next';

const Breadcrumb = ({
  teamName,
  taskTitle,
  path,
  backTo
}: {
  teamName: string;
  taskTitle: string;
  path: string;
  backTo?: string;
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="text-sm breadcrumbs">
      <ul>
        <li>{teamName || t('Home')}</li>
        <li>
          <Link href={backTo || '/'}>{taskTitle}</Link>
        </li>
        <li>{`${path}`}</li>
      </ul>
    </div>
  );
};

export default Breadcrumb;
