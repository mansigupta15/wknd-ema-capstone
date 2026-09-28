/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND adventure pages (image slider, facts sidebar, tabs).
 * Runs after wknd-cleanup and before wknd-sections (beforeTransform), so the section
 * selectors in the adventure template still match.
 * - drops the source breadcrumb (generated at runtime from the URL), the content fragments'
 *   hidden duplicate titles and the third-party share widgets (Facebook / Pinterest scripts,
 *   which render nothing on wknd.site)
 * - sidebar heading ("Share this Adventure", an h5) -> h2, for a valid heading order
 */
const SIDEBAR = 'main[class*="aem-GridColumn--default--3"]';

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;

  element.querySelectorAll('.breadcrumb, .cmp-contentfragment__title, .sharing').forEach((e) => e.remove());

  element.querySelectorAll(`${SIDEBAR} .title h1, ${SIDEBAR} .title h3, ${SIDEBAR} .title h4, ${SIDEBAR} .title h5, ${SIDEBAR} .title h6`).forEach((h) => {
    const h2 = document.createElement('h2');
    h2.textContent = h.textContent.trim();
    h.replaceWith(h2);
  });
}
