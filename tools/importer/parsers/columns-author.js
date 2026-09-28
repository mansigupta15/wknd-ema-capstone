/* eslint-disable */
/* global WebImporter */
/**
 * Parser for columns-author (emits columns (author)).
 * Base block: columns. Source: https://wknd.site/us/en/magazine/western-australia.html
 * Source DOM: AEM Core byline (div.byline > .cmp-byline with __image, __name, __occupations)
 * followed by sibling icon-only buttons (div.button.cmp-button--icononly > a.cmp-button[aria-label]).
 * Output (Columns convention): 1 row, 3 cells side by side:
 *   [avatar image] | [name (strong p), occupations p] | [one p per social link]
 * Social links are plain text links named after the network ("Facebook"); the block renders
 * the icons from /icons, so the document carries no icon images.
 * Generated: 2026-09-27
 */
function resolveImage(container, document) {
  if (!container) return null;
  const img = container.querySelector('img');
  const cmp = container.matches('[data-cmp-src]') ? container : container.querySelector('[data-cmp-src]');
  const isReal = (u) => u && !/^data:/i.test(u) && !/^about:/i.test(u);
  let src = img ? (img.getAttribute('src') || '') : '';
  if (!isReal(src) && cmp) src = (cmp.getAttribute('data-cmp-src') || '').replace('{.width}', '.1600');
  if (!isReal(src)) return null;
  const out = document.createElement('img');
  out.src = src;
  out.alt = (img && img.getAttribute('alt')) || '';
  return out;
}

export default function parse(element, { document }) {
  const byline = element.querySelector('.cmp-byline') || element;
  const name = byline.querySelector('.cmp-byline__name')?.textContent.trim() || '';

  const avatar = resolveImage(byline.querySelector('.cmp-byline__image'), document);
  if (avatar && !avatar.alt && name) avatar.alt = name;

  const text = [];
  if (name) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    strong.textContent = name;
    p.append(strong);
    text.push(p);
  }
  const role = byline.querySelector('.cmp-byline__occupations')?.textContent.trim();
  if (role) {
    const p = document.createElement('p');
    p.textContent = role;
    text.push(p);
  }

  // social icon buttons following the byline in the same grid (they sit in a nested
  // container next to it, so search the byline's grid, in document order after the byline)
  const social = [];
  const grid = element.parentElement || element;
  const buttons = [...grid.querySelectorAll('.button.cmp-button--icononly')]
    .filter((b) => element.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
  buttons.forEach((next) => {
    const a = next.querySelector('a');
    const label = (a?.getAttribute('aria-label') || a?.textContent || '').trim();
    if (a && label) {
      const link = document.createElement('a');
      link.href = a.getAttribute('href') || '#';
      // normalize casing of the network name ("instagram" -> "Instagram")
      link.textContent = label.charAt(0).toUpperCase() + label.slice(1);
      // one paragraph per link: lists inside table cells do not survive html2md here
      const p = document.createElement('p');
      p.append(link);
      social.push(p);
    }
    next.remove();
  });
  const socialCell = social.length ? social : '';

  if (!avatar && !text.length && !social.length) {
    element.remove();
    return;
  }
  const block = WebImporter.Blocks.createBlock(document, {
    name: 'columns (author)',
    cells: [[avatar || '', text.length ? text : '', socialCell]],
  });
  element.replaceWith(block);
}
