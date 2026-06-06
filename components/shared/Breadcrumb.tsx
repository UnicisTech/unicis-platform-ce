import Link from 'next/link';
import { useTranslation } from 'next-i18next';

// TODO: move to shared folder?
const Breadcrumb = ({
  teamName,
  teamSlug,
  taskTitle,
  path,
  backTo,
}: {
  teamName: string;
  teamSlug?: string;
  taskTitle: string;
  path: string;
  backTo?: string;
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="text-sm breadcrumbs">
      <ul>
        <li>
          {(
            <Link href={`/teams/${teamSlug || teamName}/dashboard`}>
              {teamName}
            </Link>
          ) || t('Home')}
        </li>
        <li>
          <a href={backTo || '/'} className="link link-hover">
            {taskTitle || t('Tasks')}
          </a>
        </li>
        <li className="max-w-[50vw] truncate" title={path}>
          {`${path}`}
        </li>
      </ul>
    </div>
  );
};

export default Breadcrumb;
