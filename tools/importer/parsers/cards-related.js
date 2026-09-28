/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-related.
 * Base block: Cards (no images). Source: https://wknd.site/us/en/magazine/western-australia.html
 * Source DOM: AEM Core list (div.list.cmp-list--upnext > ul.cmp-list > li.cmp-list__item >
 * a.cmp-list__item-link > span.cmp-list__item-title + span.cmp-list__item-date).
 * Output (Cards no-images convention): 1 column, one row per card:
 *   [linked title (strong p), date p]
 * The sidebar heading ("Share this story") stays default content before the block
 * (see wknd-article transformer), in a section styled "sidebar".
 * Adventure facts (div.contentfragment.cmp-contentfragment--elements > dl > div.cmp-contentfragment__element
 * > dt title + dd value): "cards-related (facts)", one row per fact: [label p, value p].
 * Generated: 2026-09-27
 */
export default function parse(element, { document }) {
  const cells = [];
  const facts = [...element.querySelectorAll('.cmp-contentfragment__element')];
  if (facts.length) {
    facts.forEach((fact) => {
      const label = fact.querySelector('.cmp-contentfragment__element-title')?.textContent.trim();
      const value = fact.querySelector('.cmp-contentfragment__element-value')?.textContent.trim();
      if (!label || !value) return;
      const l = document.createElement('p');
      l.textContent = label;
      const v = document.createElement('p');
      v.textContent = value;
      cells.push([[l, v]]);
    });
    if (!cells.length) element.remove();
    else element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-related (facts)', cells }));
    return;
  }
  element.querySelectorAll('li.cmp-list__item').forEach((item) => {
    const link = item.querySelector('a.cmp-list__item-link, a');
    const title = item.querySelector('.cmp-list__item-title')?.textContent.trim() || link?.textContent.trim() || '';
    if (!title) return;
    const content = [];
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    if (link?.getAttribute('href')) {
      const a = document.createElement('a');
      a.href = link.getAttribute('href');
      a.textContent = title;
      strong.append(a);
    } else {
      strong.textContent = title;
    }
    p.append(strong);
    content.push(p);
    const date = item.querySelector('.cmp-list__item-date')?.textContent.trim();
    if (date) {
      const d = document.createElement('p');
      d.textContent = date;
      content.push(d);
    }
    cells.push([content]);
  });

  if (!cells.length) {
    element.remove();
    return;
  }
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-related', cells }));
}
