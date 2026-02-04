import type { GetStaticProps } from 'next';
import Link from 'next/link';
import { useTranslation } from 'next-i18next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import type { NextPageWithLayout } from 'types';

const NotFoundPage: NextPageWithLayout = () => {
  const { t } = useTranslation('common');

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="mx-auto flex min-h-screen max-w-xl flex-col items-center justify-center px-6 text-center">
        <p className="text uppercase tracking-wider text-muted-foreground">
          404
        </p>
        <h1 className="mt-3 text-3xl font-semibold">
          {t('page-not-found-title')}
        </h1>
        <p className="mt-2 text-sm text-muted-foreground">
          {t('page-not-found-description')}
        </p>
        <Link
          href="/"
          className="mt-6 inline-flex items-center rounded-md border border-border bg-card px-4 py-2 text-sm font-medium text-foreground hover:bg-muted"
        >
          {t('go-home')}
        </Link>
      </div>
    </div>
  );
};

NotFoundPage.getLayout = function getLayout(page) {
  return <>{page}</>;
};

export const getStaticProps: GetStaticProps = async ({ locale }) => ({
  props: {
    ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
  },
});

export default NotFoundPage;
