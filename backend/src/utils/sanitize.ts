import { JSDOM } from 'jsdom';
import DOMPurify from 'dompurify';

const { window } = new JSDOM('');
const purify = DOMPurify(window as any);

/** Strip ALL HTML — use for plain-text fields (names, titles, descriptions) */
export const sanitizeText = (dirty: string): string =>
  purify.sanitize(dirty, { ALLOWED_TAGS: [], ALLOWED_ATTR: [] });

/** Allow a safe subset of HTML — use for rich-text fields (blog content) */
export const sanitizeHTML = (dirty: string): string =>
  purify.sanitize(dirty, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li'],
    ALLOWED_ATTR: ['href', 'target', 'rel'],
  });
