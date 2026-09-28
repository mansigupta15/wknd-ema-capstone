/* eslint-disable */
/* global WebImporter */
/**
 * Parser for accordion.
 * Base block: accordion (Block Collection). Source: https://wknd.site/us/en/faqs.html
 * Source DOM: AEM Core accordion (div.accordion.panelcontainer > div.cmp-accordion >
 * div.cmp-accordion__item > h3.cmp-accordion__header > button > span.cmp-accordion__title,
 * plus div.cmp-accordion__panel holding text components).
 * Output (Block Collection accordion): 2 columns, one row per item: [title] | [content].
 * Generated: 2026-09-28
 */
export default function parse(element, { document }) {
  const cells = [];
  element.querySelectorAll('.cmp-accordion__item').forEach((item) => {
    const title = item.querySelector('.cmp-accordion__title')?.textContent.replace(/\s+/g, ' ').trim();
    const panel = item.querySelector('.cmp-accordion__panel');
    if (!title || !panel) return;
    const content = [...panel.querySelectorAll('p, ul, ol')].filter((e) => !e.parentElement.closest('p, ul, ol') && e.textContent.trim());
    // row per item: [title] | [content]
    cells.push([title, content.length ? content : panel.textContent.trim()]);
  });

  if (!cells.length) {
    element.remove();
    return;
  }
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'accordion', cells }));
}
