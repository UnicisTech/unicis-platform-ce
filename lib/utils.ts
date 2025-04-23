import type { NextApiRequest } from 'next';

export const getIpAddress = (req: NextApiRequest): string => {
  return (req.headers['x-forwarded-for'] ||
    req.socket.remoteAddress ||
    req.connection?.remoteAddress ||
    'unknown') as string;
};

export const capitalizeCountryName = (name: string) => {
  if (name === 'usa') return 'USA'; // Special case for USA
  return name.charAt(0).toUpperCase() + name.slice(1).toLowerCase();
};
