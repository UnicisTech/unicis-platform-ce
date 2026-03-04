import createDOMPurify from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window as unknown as Window;
const DOMPurify = createDOMPurify(window);

const ALLOWED_TAGS = [
  'p',
  'br',
  'strong',
  'em',
  'u',
  's',
  'ol',
  'ul',
  'li',
  'blockquote',
  'pre',
  'code',
  'a',
  'span',
  'div',
];

const ALLOWED_ATTR: Record<string, string[]> = {
  a: ['href', 'target', 'rel'],
  p: ['class'],
  span: ['class'],
  div: ['class'],
  pre: ['class'],
  code: ['class'],
  ol: ['class'],
  ul: ['class'],
  li: ['class'],
  blockquote: ['class'],
};

export const sanitizeRichText = (html: string) => {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
};
