/* eslint-disable */
/* global WebImporter */
/**
 * Parser for tabs.
 * Base block: tabs (Block Collection). Source: https://wknd.site/us/en/adventures/climbing-new-zealand.html
 * Source DOM: AEM Core tabs (div.tabs.panelcontainer > div.cmp-tabs > ol.cmp-tabs__tablist >
 * li.cmp-tabs__tab, plus one div.cmp-tabs__tabpanel per tab). Each panel holds a content
 * fragment whose rich-text elements contain headings (h2 > b), images (.image > .cmp-image),
 * paragraphs and lists, nested in layout divs.
 * Output (Block Collection tabs): 2 columns, one row per tab: [tab label] | [tab content].
 * Panel headings become h2 (h3 below that); an image caption becomes an italic paragraph
 * after the image; an image without alt text gets the tab label, flagged for review in the
 * import report.
 * Generated: 2026-09-28
 */

// AEM Core image: the <img> of a hidden panel may still be a placeholder; fall back to
// srcset, then the component's data-cmp-src template (same approach as carousel-hero)
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
  out.alt = ((img && (img.getAttribute('alt') || img.getAttribute('title'))) || '').trim();
  return out;
}

function panelContent(panel, label, document) {
  const root = panel.querySelector('.cmp-contentfragment__elements') || panel;
  const out = [];
  const walk = (node) => {
    [...node.children].forEach((el) => {
      if (el.matches('.cmp-contentfragment__title, script, style, meta, noscript')) return;
      if (el.matches('.image, .cmp-image')) {
        const img = resolveImage(el, document);
        if (img) {
          if (!img.alt) {
            img.alt = label;
            img.setAttribute('data-alt-review', 'empty alt, used tab label');
          }
          out.push(img);
          // caption (the image title, shown under the image on WKND) -> italic paragraph
          const caption = el.querySelector('.cmp-image__title')?.textContent.trim();
          if (caption) {
            const p = document.createElement('p');
            const em = document.createElement('em');
            em.textContent = caption;
            p.append(em);
            out.push(p);
          }
        }
        return;
      }
      if (/^H[1-6]$/.test(el.tagName)) {
        const text = el.textContent.replace(/\s+/g, ' ').trim();
        if (!text) return;
        const h = document.createElement(el.tagName === 'H1' || el.tagName === 'H2' ? 'h2' : 'h3');
        h.textContent = text;
        out.push(h);
        return;
      }
      if (el.matches('p, ul, ol, blockquote, table')) {
        if (el.textContent.replace(/ /g, ' ').trim()) out.push(el);
        return;
      }
      walk(el);
    });
  };
  walk(root);
  return out;
}

export default function parse(element, { document }) {
  const tabs = [...element.querySelectorAll('.cmp-tabs__tab')];
  const panels = [...element.querySelectorAll('.cmp-tabs__tabpanel')];
  const cells = [];
  tabs.forEach((tab, i) => {
    const label = tab.textContent.replace(/\s+/g, ' ').trim();
    const panel = panels[i];
    if (!label || !panel) return;
    const content = panelContent(panel, label, document);
    // row per tab: [tab label] | [tab content]
    if (content.length) cells.push([label, content]);
  });

  if (!cells.length) {
    element.remove();
    return;
  }
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'tabs', cells }));
}
