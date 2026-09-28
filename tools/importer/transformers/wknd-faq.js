/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND FAQs page (title, image, intro, accordion; "Need more help?" sidebar).
 * Runs after wknd-cleanup and before wknd-sections (beforeTransform).
 * - sidebar heading ("Need more help?", an h3 right after the page h1) -> h2, for a valid order
 * - the sidebar's placeholder links (href="#") become real contact links: the phone number a
 *   tel: link, "info@wknd.com" (split as "info" + a link on "@wknd.com") one mailto: link
 */
const SIDE = '.cmp-layout-container--fixed .container[class*="aem-GridColumn--default--3"]';

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;
  const side = element.querySelector(SIDE);
  if (!side) return;

  side.querySelectorAll('.title h3, .title h4, .title h5, .title h6').forEach((h) => {
    const h2 = document.createElement('h2');
    h2.textContent = h.textContent.trim();
    h.replaceWith(h2);
  });

  side.querySelectorAll('a[href="#"]').forEach((a) => {
    const text = a.textContent.trim();
    if (/^[\d\s().+-]{7,}$/.test(text)) {
      a.setAttribute('href', `tel:${text.replace(/[^\d+]/g, '')}`);
      return;
    }
    const before = a.previousSibling;
    const local = before && before.nodeType === 3 ? (before.textContent.match(/([\w.+-]+)$/) || [])[1] : '';
    if (text.startsWith('@') && local) {
      before.textContent = before.textContent.slice(0, -local.length);
      a.textContent = `${local}${text}`;
      a.setAttribute('href', `mailto:${local}${text}`);
    }
  });
}
