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

export const removeTrailingParenthesis = (text: string): string => {
  return text.replace(/\s*\([^()]*\)\s*$/, '').trim();
}

export const truncateText = (text: string, limit: number): string => {
  if (text.length <= limit) return text;

  const maxLength = Math.max(limit - 3, 0); // prevent negative result
  return text.slice(0, maxLength) + '...';
}