import app from '@/lib/app';
import { SessionProvider } from 'next-auth/react';
import { appWithTranslation } from 'next-i18next';
import Head from 'next/head';
import { Toaster } from 'react-hot-toast';
import colors from 'tailwindcss/colors';
import type { AppPropsWithLayout } from 'types';
import mixpanel from 'mixpanel-browser';

import { init } from '@socialgouv/matomo-next';

import '@boxyhq/react-ui/dist/style.css';
import '../styles/globals.css';
import { useEffect } from 'react';
import env from '@/lib/env';
import { Theme, applyTheme } from '@/lib/theme';
import { Themer } from '@boxyhq/react-ui/shared';
import { AccountLayout } from '@/components/layouts';

function MyApp({ Component, pageProps }: AppPropsWithLayout) {
  const { session, ...props } = pageProps;

  useEffect(() => {
    // Add mixpanel
    if (env.mixpanel.token) {
      mixpanel.init(env.mixpanel.token, {
        debug: true,
        ignore_dnt: true,
        track_pageview: true,
      });
    }

    // Add Matomo
    if (env.matomo.url && env.matomo.siteId) {
      init({ url: env.matomo.url, siteId: env.matomo.siteId });
    }

    if (env.darkModeEnabled) {
      applyTheme(localStorage.getItem('theme') as Theme);
    }
  }, []);

  const getLayout =
    Component.getLayout || ((page) => <AccountLayout>{page}</AccountLayout>);

  return (
    <>
      <Head>
        <title>{app.name}</title>
        {/* <link rel="icon" href='https://www.unicis.tech/img/logo-unicis.png' /> */}
        <link rel="icon" href="https://www.unicis.tech/favicon.ico" />
      </Head>
      <SessionProvider session={session}>
        <Toaster toastOptions={{ duration: 4000 }} />
        <Themer
          overrideTheme={{
            '--primary-color': colors.blue['500'],
            '--primary-hover': colors.blue['600'],
            '--primary-color-50': colors.blue['50'],
            '--primary-color-100': colors.blue['100'],
            '--primary-color-200': colors.blue['200'],
            '--primary-color-300': colors.blue['300'],
            '--primary-color-500': colors.blue['500'],
            '--primary-color-600': colors.blue['600'],
            '--primary-color-700': colors.blue['700'],
            '--primary-color-800': colors.blue['800'],
            '--primary-color-900': colors.blue['900'],
            '--primary-color-950': colors.blue['950'],
          }}
        >
          {getLayout(<Component {...props} />)}
        </Themer>
      </SessionProvider>
    </>
  );
}

export default appWithTranslation<never>(MyApp);
