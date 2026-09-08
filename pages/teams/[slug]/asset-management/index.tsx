import { GetServerSidePropsContext } from 'next';

const AssetManagement = () => null;

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const { query } = context;
  const slug = query.slug as string;

  return {
    redirect: {
      destination: `/teams/${slug}/asset`,
      permanent: false,
    },
  };
};

export default AssetManagement;
