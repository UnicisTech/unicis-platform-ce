import Document, { Html, Head, Main, NextScript } from 'next/document';
import type { GetServerSidePropsContext } from 'next';
import { getSession } from '@/lib/session';
import { getUserBySession } from 'models/user';

class MyDocument extends Document {
  render() {
    return (
      <Html lang={(this.props as any).locale ?? 'en'} data-theme="unicis">
        <Head />
        <body>
          <Main />
          <NextScript />
        </body>
      </Html>
    );
  }
}

export const getServerSideProps = async (
  context: GetServerSidePropsContext
) => {
  const session = await getSession(context.req, context.res);
  const user = await getUserBySession(session);

  if (!user) {
    return {
      notFound: true,
    };
  }

  return {
    props: {
      user: {
        id: user.id,
        email: user.email,
        name: user.name,
        image: user.image,
      },
    },
  };
};

export default MyDocument;
