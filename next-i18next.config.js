// eslint-disable-next-line @typescript-eslint/no-var-requires
const path = require('path');

module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'fr', 'de', 'es', 'it', 'ja', 'pt'],
  },
  fallbackLng: 'en',
  localePath: path.resolve('./locales'),
};
