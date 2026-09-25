/* eslint-disable */
/* global WebImporter */
/**
 * Parser for hero-teaser.
 * Base block: hero. Source: https://wknd.site/us/en.html
 * Source DOM: AEM Core teaser (.cmp-teaser--hero.cmp-teaser--imagebottom) with
 * .cmp-teaser__content (title, description, CTA) and a lazy-loaded Core image.
 * Output: 1 column: row 1 = image; row 2 = [h2, p, CTA link].
 * Generated: 2026-09-25
 */

/**
 * Resolve a usable image from an AEM Core image component, skipping
 * placeholder / data: URIs (lazy loading) and falling back to srcset, then to
 * the component's data-cmp-src template ("...coreimg.60{.width}.jpeg/...").
 */
function resolveImage(container, document) {
  if (!container) return null;
  const img = container.querySelector('img');
  const cmp = container.matches('[data-cmp-src]') ? container : container.querySelector('[data-cmp-src]');
  const isReal = (u) => u && !/^data:/i.test(u) && !/^about:/i.test(u);

  let src = img ? (img.getAttribute('src') || '') : '';
  if (!isReal(src) && img) {
    const lazy = img.getAttribute('data-src') || img.getAttribute('data-lazy-src');
    if (isReal(lazy)) src = lazy;
  }
  if (!isReal(src) && img && img.getAttribute('srcset')) {
    const candidates = img.getAttribute('srcset').split(',')
      .map((s) => s.trim().split(/\s+/))
      .filter(([u]) => isReal(u))
      .map(([u, w]) => ({ u, w: parseInt(w, 10) || 0 }))
      .sort((a, b) => b.w - a.w);
    if (candidates.length) src = candidates[0].u;
  }
  if (!isReal(src) && cmp) {
    const tpl = cmp.getAttribute('data-cmp-src') || '';
    if (tpl) src = tpl.replace('{.width}', '.1600');
  }
  if (!isReal(src)) return null;

  const alt = (img && (img.getAttribute('alt') || img.getAttribute('title')))
    || cmp?.querySelector('meta[itemprop="caption"]')?.getAttribute('content')
    || '';
  const out = document.createElement('img');
  out.src = src;
  out.alt = alt.trim();
  return out;
}

/** Normalize a Core teaser description (bare text or <p> children) into paragraphs. */
function descriptionParagraphs(desc, document) {
  if (!desc) return [];
  const ps = [...desc.querySelectorAll(':scope > p')].filter((p) => p.textContent.trim());
  if (ps.length) return ps;
  if (!desc.textContent.trim()) return [];
  const p = document.createElement('p');
  p.innerHTML = desc.innerHTML.trim();
  return [p];
}

export default function parse(element, { document }) {
  const teaser = element.matches('.cmp-teaser') ? element : (element.querySelector('.cmp-teaser') || element);

  const image = resolveImage(teaser.querySelector('.cmp-teaser__image, .cmp-image') || teaser, document);

  const content = [];
  const titleEl = teaser.querySelector('.cmp-teaser__title, h1, h2, h3');
  if (titleEl && titleEl.textContent.trim()) {
    const h2 = document.createElement('h2');
    const titleLink = titleEl.querySelector('a');
    if (titleLink) {
      const a = document.createElement('a');
      a.href = titleLink.getAttribute('href');
      a.textContent = titleEl.textContent.trim();
      h2.append(a);
    } else {
      h2.textContent = titleEl.textContent.trim();
    }
    content.push(h2);
  }

  content.push(...descriptionParagraphs(teaser.querySelector('.cmp-teaser__description'), document));

  const ctas = [...teaser.querySelectorAll('.cmp-teaser__action-container a, a.cmp-teaser__action-link')]
    .filter((a, i, arr) => arr.indexOf(a) === i && a.textContent.trim());
  ctas.forEach((a) => {
    const link = document.createElement('a');
    link.href = a.getAttribute('href');
    link.textContent = a.textContent.trim();
    // bold + italic = accent (yellow) button via decorateButtons
    const strong = document.createElement('strong');
    const em = document.createElement('em');
    em.append(link);
    strong.append(em);
    const p = document.createElement('p');
    p.append(strong);
    content.push(p);
  });

  if (!image && !content.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const cells = [];
  if (image) cells.push([image]);
  if (content.length) cells.push([content]); // 1-column block: all content in one cell

  const block = WebImporter.Blocks.createBlock(document, { name: 'hero-teaser', cells });
  element.replaceWith(block);
}
