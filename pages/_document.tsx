import { Head, Html, Main, NextScript } from 'next/document';

export default function Document(props) {
  return (
    <Html lang="en" className="h-full" data-theme="boxyhq">
      <Head>
        <script
            dangerouslySetInnerHTML={{
              __html: `
                (function(w,d,t,u,n,a,m){w['MauticTrackingObject']=n;
                w[n]=w[n]||function(){(w[n].q=w[n].q||[]).push(arguments)},a=d.createElement(t),
                m=d.getElementsByTagName(t)[0];a.async=1;a.src=u;m.parentNode.insertBefore(a,m)
                })(window,document,'script','https://crm.unicis.tech/mtc.js','mt');

                mt('send', 'pageview');
              `
            }}
          />
      </Head>
      <body className="h-full">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
