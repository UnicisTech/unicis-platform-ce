/* eslint-disable i18next/no-literal-string */
import type { ReactElement } from 'react';
import dynamic from 'next/dynamic';
import Head from 'next/head';
import type { NextPageWithLayout } from 'types';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

const ApiDocs: NextPageWithLayout = () => {
  return (
    <>
      <Head>
        <title>Unicis Platform — API Documentation</title>
      </Head>
      <SwaggerUI url="/openapi.json" />
    </>
  );
};

ApiDocs.getLayout = (page: ReactElement) => page;

export default ApiDocs;
