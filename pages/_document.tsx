import Document, { Html, Head, Main, NextScript } from 'next/document';
import type { GetServerSidePropsContext } from 'next';
import { getSession } from '@/lib/session';
import { getUserBySession } from 'models/user';

class MyDocument extends Document {
  render() {
    return (
      <Html>
        <Head>
          {/* Your other head elements */}
          <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,t,u,n,a,m){w['MauticTrackingObject']=n;
                w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)},a=d.createElement(t),
                m=d.getElementsByTagName(t)[0];a.async=1;a.src=u;m.parentNode.insertBefore(a,m)
                })(window,document,'script','https://crm.unicis.tech/mtc.js','mt');
              `,
            }}
          />
        </Head>
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
  console.log('getServerSideProps _document');
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
