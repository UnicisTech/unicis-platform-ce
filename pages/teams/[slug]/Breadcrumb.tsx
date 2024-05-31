import router from 'next/router';
import { Link } from 'react-daisyui';
import { useTranslation } from 'react-i18next';

const Breadcrumb = ({
  slug,
  base,
  id,
  back_to,
}: {
  slug: any;
  base?: string;
  id: any;
  back_to?: string;
}) => {
  const { t } = useTranslation('common');

  return (
    <div className="text-sm breadcrumbs">
      <ul>
        <li>
          <Link href={back_to? back_to : '/'}>{base ? base : 'Home'}</Link>
        </li>
        <li>{slug}</li>
        <li>{id}</li>
      </ul>
    </div>
  );
};

export default Breadcrumb;
