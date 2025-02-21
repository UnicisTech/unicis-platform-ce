import packageInfo from '../package.json';
import env from './env';

const app = {
  version: packageInfo.version,
  name: 'Unicis Platform',
  logoUrl: '/unicis-platform-logo-hor-cropped.svg',
  emailLogoUrl: env.appUrl + '/unicis-platform-logo-hor-cropped.png',
  url: 'http://localhost:4002',
};

export default app;
