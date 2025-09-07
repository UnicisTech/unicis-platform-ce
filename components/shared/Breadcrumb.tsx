import Link from 'next/link';
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
        <li>{<Link href={`/teams/${teamName}/dashboard`}>{teamName}</Link> || t('Home')}</li>
        <li>
          <a href={backTo || '/'} className="link link-hover">
            {t('Tasks')}
          </a>
        </li>
        <li>{`${path}`}</li>
      </ul>
    </div>
  );
};

export default Breadcrumb;
