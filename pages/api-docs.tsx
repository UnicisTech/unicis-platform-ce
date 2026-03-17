/* eslint-disable i18next/no-literal-string */
import dynamic from 'next/dynamic';
import Head from 'next/head';
import 'swagger-ui-react/swagger-ui.css';

const SwaggerUI = dynamic(() => import('swagger-ui-react'), { ssr: false });

export default function ApiDocs() {
  return (
    <>
      <Head>
        <title>Unicis Platform — API Documentation</title>
      </Head>
      <SwaggerUI url="/openapi.json" />
    </>
  );
}
