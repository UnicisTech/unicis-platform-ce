const env = {
  databaseUrl: `${process.env.DATABASE_URL}`,
  appUrl: `${process.env.APP_URL}`,
  product: 'unicis-platform',
  // redirectAfterSignIn: '/teams',
  redirectIfAuthenticated: '/teams',

  // SAML Jackson configuration
  saml: {
    issuer: `${process.env.SAML_ISSUER}`,
    path: '/api/oauth/saml',
    callback: `${process.env.APP_URL}`,
  },

  // SAML Jackson configuration
  jackson: {
    url: process.env.JACKSON_URL,
    externalUrl: process.env.JACKSON_EXTERNAL_URL || process.env.JACKSON_URL,
    apiKey: process.env.JACKSON_API_KEY,
    productId: process.env.JACKSON_PRODUCT_ID || 'unicis-platform',
    selfHosted: process.env.JACKSON_URL !== undefined,
    sso: {
      callback: `${process.env.APP_URL}`,
      issuer: `${process.env.SAML_ISSUER}`,
      path: '/api/oauth/saml',
      oidcPath: '/api/oauth/oidc',
      idpLoginPath: '/auth/idp-login',
    },
    dsync: {
      webhook_url: `${process.env.APP_URL}/api/webhooks/dsync`,
      webhook_secret: process.env.JACKSON_WEBHOOK_SECRET,
    },
  },

  // SMTP configuration for NextAuth
  smtp: {
    host: process.env.SMTP_HOST,
    port: Number(process.env.SMTP_PORT),
    user: process.env.SMTP_USER,
    password: process.env.SMTP_PASSWORD,
    from: process.env.SMTP_FROM,
  },

  // Matomo configuration
  matomo: {
    url: `${process.env.NEXT_PUBLIC_MATOMO_URL}`,
    siteId: `${process.env.NEXT_PUBLIC_MATOMO_SITE_ID}`,
  },

  // NextAuth configuration
  nextAuth: {
    secret: process.env.NEXTAUTH_SECRET,
  },

  // Svix
  svix: {
    url: `${process.env.SVIX_URL}`,
    apiKey: `${process.env.SVIX_API_KEY}`,
  },

  //Social login: Github
  github: {
    clientId: `${process.env.GITHUB_CLIENT_ID}`,
    clientSecret: `${process.env.GITHUB_CLIENT_SECRET}`,
  },

  //Social login: Google
  google: {
    clientId: `${process.env.GOOGLE_CLIENT_ID}`,
    clientSecret: `${process.env.GOOGLE_CLIENT_SECRET}`,
  },

  // Retraced configuration
  retraced: {
    url: process.env.RETRACED_URL
      ? `${process.env.RETRACED_URL}/auditlog`
      : undefined,
    apiKey: process.env.RETRACED_API_KEY,
    projectId: process.env.RETRACED_PROJECT_ID,
  },

  groupPrefix: process.env.GROUP_PREFIX,

  // Users will need to confirm their email before accessing the app feature
  confirmEmail: process.env.CONFIRM_EMAIL === 'true',

  // Mixpanel configuration
  mixpanel: {
    token: process.env.NEXT_PUBLIC_MIXPANEL_TOKEN,
  },

  disableNonBusinessEmailSignup:
    process.env.DISABLE_NON_BUSINESS_EMAIL_SIGNUP === 'true' ? true : false,

  authProviders: process.env.AUTH_PROVIDERS || 'github,credentials',

  otel: {
    prefix: process.env.OTEL_PREFIX || 'boxyhq.saas',
  },

  hideLandingPage: process.env.HIDE_LANDING_PAGE === 'true' ? true : false,

  darkModeEnabled: process.env.NEXT_PUBLIC_DARK_MODE === 'false' ? false : true,

  teamFeatures: {
    sso: process.env.FEATURE_TEAM_SSO === 'false' ? false : true,
    dsync: process.env.FEATURE_TEAM_DSYNC === 'false' ? false : true,
    webhook: process.env.FEATURE_TEAM_WEBHOOK === 'false' ? false : true,
    apiKey: process.env.FEATURE_TEAM_API_KEY === 'false' ? false : true,
    auditLog: process.env.FEATURE_TEAM_AUDIT_LOG === 'false' ? false : true,
  },

  recaptcha: {
    siteKey: process.env.RECAPTCHA_SITE_KEY || null,
    secretKey: process.env.RECAPTCHA_SECRET_KEY || null,
  },

  // Billing address
  billingEmail: process.env.BILLING_EMAIL,

  ai: {
    llamaToken: process.env.LLAMA_TOKEN,
  },

  resend: {
    apiKey: process.env.RESEND_API_KEY!,
    from: process.env.RESEND_FROM!,
  }
};

export default env;
