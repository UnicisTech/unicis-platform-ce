import createDOMPurify, { type WindowLike } from 'dompurify';
import { JSDOM } from 'jsdom';

const window = new JSDOM('').window as unknown as WindowLike;
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

const ALLOWED_ATTR = ['href', 'target', 'rel', 'class'];

export const sanitizeRichText = (html: string) => {
  if (!html) return '';

  return DOMPurify.sanitize(html, {
    ALLOWED_TAGS,
    ALLOWED_ATTR,
    ALLOW_DATA_ATTR: false,
  });
};
