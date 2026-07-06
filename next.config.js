/* eslint @typescript-eslint/no-var-requires: "off" */
const { i18n } = require('./next-i18next.config');
const removeImports = require('next-remove-imports')({
  test: /node_modules\/@uiw([\s\S]*?)\.(tsx|ts|js|mjs|jsx)$/, // Target only @uiw files
});

// Redirect root URL to login page
const redirects = [
  {
    source: '/',
    destination: '/auth/login',
    permanent: true,
  },
];

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  outputFileTracingIncludes: {
    '/api/**': ['./node_modules/openid-client/**', './node_modules/jose/**'],
  },
  images: {
    domains: ['platform.unicis.tech'],
    unoptimized: true,
  },
  i18n, // Localization settings
  webpack: (config, { isServer }) => {
    // ← ADD HERE
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        fs: false,
        stream: false,
        crypto: false,
      };
    }
    return config;
  },
  async redirects() {
    return redirects;
  },
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'strict-origin-when-cross-origin',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=(), interest-cohort=()',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              // Next.js hydration and reCAPTCHA require inline scripts;
              // dev mode also requires unsafe-eval for HMR
              `script-src 'self' 'unsafe-inline'${process.env.NODE_ENV === 'development' ? " 'unsafe-eval'" : ""} https://www.google.com https://www.gstatic.com`,
              "style-src 'self' 'unsafe-inline'",
              "img-src 'self' data: https: blob:",
              // Matomo (self-hosted), GlitchTip (EU-hosted), AI endpoint (OVH EU), push endpoints
              "connect-src 'self' https:",
              // IAP course iframes are sandboxed; allow https sources
              "frame-src 'self' https:",
              "frame-ancestors 'none'",
              "object-src 'none'",
              "base-uri 'self'",
              "form-action 'self'",
            ].join('; '),
          },
        ],
      },
    ];
  },
  rewrites: async () => {
    return [
      {
        source: '/.well-known/saml.cer',
        destination: '/api/well-known/saml.cer',
      },
      {
        source: '/.well-known/saml-configuration',
        destination: '/well-known/saml-configuration',
      },
    ];
  },
};

module.exports = removeImports(nextConfig);
