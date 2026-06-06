import { ResetPasswordForm } from '@/components/auth';
import { AuthLayout } from '@/components/layouts';
import type { GetServerSidePropsContext } from 'next';
import { serverSideTranslations } from 'next-i18next/serverSideTranslations';
import { ReactElement } from 'react';
import type { NextPageWithLayout } from 'types';
import { prisma } from '@/lib/prisma';

interface ResetPasswordPageProps {
  resetType: 'platform' | 'fleet';
}

const ResetPasswordPage: NextPageWithLayout<ResetPasswordPageProps> = ({
  resetType,
}) => {
  return <ResetPasswordForm resetType={resetType} />;
};

ResetPasswordPage.getLayout = function getLayout(page: ReactElement) {
  const resetType = (page.props as ResetPasswordPageProps).resetType;

  const heading =
    resetType === 'fleet'
      ? 'Reset Asset Management Password'
      : 'Reset Password';

  const description =
    resetType === 'fleet'
      ? 'Enter your new Asset Management password'
      : 'Enter your new password';

  return (
    <AuthLayout heading={heading} description={description}>
      {page}
    </AuthLayout>
  );
};

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { locale, params } = context;
  const token = params?.token as string;

  // Determine reset type by checking which table has this token
  let resetType: 'platform' | 'fleet' = 'platform';

  if (token) {
    const fleetPasswordReset = await prisma.fleetPasswordReset.findUnique({
      where: { token },
    });

    if (fleetPasswordReset) {
      resetType = 'fleet';
    }
  }

  return {
    props: {
      resetType,
      ...(locale ? await serverSideTranslations(locale, ['common']) : {}),
    },
  };
};

export default ResetPasswordPage;
