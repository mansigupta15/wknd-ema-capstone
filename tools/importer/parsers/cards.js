/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards.
 * Base block: cards (Block Collection). Source: https://wknd.site/us/en/about-us.html
 * Source DOM: contributor experience fragments (div.cmp-experience-fragment--contributor >
 * .cmp-image, h3 name, h5 role, a building block of icon-only buttons a.cmp-button with the
 * network as text). Consecutive fragments become ONE "cards (contributors)" block.
 * Output (Cards convention): 2 columns, one row per card: [image] | [text content:
 * h3 name (title), role p (description), one p per social link (calls to action)].
 * The source photos have no alt text; the name is used.
 * Generated: 2026-09-28
 */

// AEM Core image: skip placeholder / data: URIs, fall back to srcset, then data-cmp-src
function resolveImage(container, document) {
  const img = container.querySelector('img');
  const cmp = container.matches('[data-cmp-src]') ? container : container.querySelector('[data-cmp-src]');
  const isReal = (u) => u && !/^data:/i.test(u) && !/^about:/i.test(u);
  let src = img ? (img.getAttribute('src') || '') : '';
  if (!isReal(src) && img && img.getAttribute('srcset')) {
    const best = img.getAttribute('srcset').split(',').map((s) => s.trim().split(/\s+/))
      .filter(([u]) => isReal(u)).map(([u, w]) => ({ u, w: parseInt(w, 10) || 0 }))
      .sort((a, b) => b.w - a.w)[0];
    if (best) src = best.u;
  }
  if (!isReal(src) && cmp && cmp.getAttribute('data-cmp-src')) src = cmp.getAttribute('data-cmp-src').replace('{.width}', '.1600');
  if (!isReal(src)) return null;
  const out = document.createElement('img');
  out.src = src;
  out.alt = ((img && img.getAttribute('alt')) || '').trim();
  return out;
}

// one card: [image] | [title h3, description p, call-to-action links]
function contributorRow(fragment, document) {
  const titles = [...fragment.querySelectorAll('.cmp-title__text')];
  const name = titles[0]?.textContent.trim();
  if (!name) return null;
  const img = resolveImage(fragment.querySelector('.cmp-image') || fragment, document);
  if (img && !img.alt) img.alt = name;

  const content = [];
  const h3 = document.createElement('h3');
  h3.textContent = name;
  content.push(h3);
  const role = titles[1]?.textContent.trim();
  if (role) {
    const p = document.createElement('p');
    p.textContent = role;
    content.push(p);
  }
  fragment.querySelectorAll('a.cmp-button').forEach((button) => {
    const label = button.textContent.trim() || button.getAttribute('aria-label') || '';
    if (!label) return;
    const a = document.createElement('a');
    a.href = button.getAttribute('href') || '#';
    a.textContent = label;
    const p = document.createElement('p');
    p.append(a);
    content.push(p);
  });
  return [img || '', content];
}

export default function parse(element, { document }) {
  const fragments = [element];
  let next = element.nextElementSibling;
  while (next && next.matches('.cmp-experience-fragment--contributor')) {
    fragments.push(next);
    next = next.nextElementSibling;
  }
  const cells = fragments.map((f) => contributorRow(f, document)).filter(Boolean);
  fragments.slice(1).forEach((f) => f.remove());
  if (!cells.length) {
    element.remove();
    return;
  }
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards (contributors)', cells }));
}
