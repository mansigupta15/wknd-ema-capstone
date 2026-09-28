/* eslint-disable */
/* global WebImporter */
/**
 * Parser for cards-article.
 * Base block: cards. Source: https://wknd.site/us/en.html
 * Source DOM: AEM Core image list (ul.cmp-image-list > li.cmp-image-list__item >
 * article.cmp-image-list__item-content) with an image link, a title link and a
 * description span. Used twice on the homepage (4 cards each) and on the magazine
 * listing (5 cards). Members-only teasers (.teaser.cmp-teaser--secure) are parsed
 * into the "locked" variant (see parseLockedTeasers); category tabs of image lists
 * (adventures listing) into the "filter" variant (see parseFilterTabs).
 * Output: 2 columns, one row per card: [linked image] | [linked title (strong), description p].
 * Iteration is keyed on li.cmp-image-list__item (block-level wrapper), never on
 * the sibling <a> elements, so html2md inline-merging cannot collapse cards.
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

/**
 * Members-only teasers (AEM Core teaser.cmp-teaser--secure): consecutive sibling
 * teasers become ONE cards-article block with the "locked" option.
 * Output row per teaser: [image] | [title (strong), description p, action label p].
 * The action label ("Read More") is not a link on the source; it stays plain text.
 */
function parseLockedTeasers(element, document) {
  const teasers = [element];
  let next = element.nextElementSibling;
  while (next && next.matches('.teaser.cmp-teaser--secure')) {
    teasers.push(next);
    next = next.nextElementSibling;
  }

  const cells = [];
  teasers.forEach((teaser) => {
    const title = teaser.querySelector('.cmp-teaser__title')?.textContent.trim() || '';
    const img = resolveImage(teaser.querySelector('.cmp-teaser__image') || teaser, document);
    if (img && !img.alt && title) img.alt = title;

    const content = [];
    if (title) {
      const p = document.createElement('p');
      const strong = document.createElement('strong');
      strong.textContent = title;
      p.append(strong);
      content.push(p);
    }
    const desc = teaser.querySelector('.cmp-teaser__description')?.textContent.trim();
    if (desc) {
      const p = document.createElement('p');
      p.textContent = desc;
      content.push(p);
    }
    const action = teaser.querySelector('.cmp-teaser__action-container')?.textContent.trim();
    if (action) {
      const p = document.createElement('p');
      p.textContent = action;
      content.push(p);
    }
    if (img || content.length) cells.push([img || '', content.length ? content : '']);
  });

  teasers.slice(1).forEach((t) => t.remove());
  if (!cells.length) {
    element.remove();
    return;
  }
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-article (locked)', cells }));
}

/** One image-list item -> [linked image] | [linked title (strong), description p], or null. */
function parseItem(item, document) {
  const imageLink = item.querySelector('a.cmp-image-list__item-image-link');
  const titleLink = item.querySelector('a.cmp-image-list__item-title-link');
  const titleText = (item.querySelector('.cmp-image-list__item-title') || titleLink)?.textContent.trim() || '';
  const href = titleLink?.getAttribute('href') || imageLink?.getAttribute('href') || '';

  // Cell 1: linked image
  const img = resolveImage(item.querySelector('.cmp-image-list__item-image, .cmp-image') || item, document);
  let imageCell = '';
  if (img) {
    if (!img.alt && titleText) img.alt = titleText;
    const imgHref = imageLink?.getAttribute('href') || href;
    if (imgHref) {
      const a = document.createElement('a');
      a.href = imgHref;
      a.append(img);
      imageCell = a;
    } else {
      imageCell = img;
    }
  }

  // Cell 2: linked title (strong) + description paragraph
  const content = [];
  if (titleText) {
    const p = document.createElement('p');
    const strong = document.createElement('strong');
    if (href) {
      const a = document.createElement('a');
      a.href = href;
      a.textContent = titleText;
      strong.append(a);
    } else {
      strong.textContent = titleText;
    }
    p.append(strong);
    content.push(p);
  }
  const desc = item.querySelector('.cmp-image-list__item-description');
  if (desc && desc.textContent.trim()) {
    const p = document.createElement('p');
    p.textContent = desc.textContent.trim();
    content.push(p);
  }

  if (!imageCell && !content.length) return null;
  return [imageCell, content.length ? content : ''];
}

/**
 * Filterable adventures (AEM Core tabs whose panels are image lists: an "All" panel plus one
 * panel per category, e.g. /us/en/adventures): ONE "cards-article (filter)" block with the
 * cards of the first panel and a third cell listing each card's categories (the tabs it also
 * appears in; none, one or several, comma-separated). The block builds the filter buttons.
 */
function parseFilterTabs(element, document) {
  const labels = [...element.querySelectorAll('.cmp-tabs__tab')].map((t) => t.textContent.trim());
  const panels = [...element.querySelectorAll('.cmp-tabs__tabpanel')];
  const key = (item) => item.querySelector('a[href]')?.getAttribute('href')
    || item.querySelector('.cmp-image-list__item-title')?.textContent.trim() || '';
  const categories = new Map();
  panels.slice(1).forEach((panel, i) => {
    panel.querySelectorAll('li.cmp-image-list__item').forEach((item) => {
      const k = key(item);
      if (!categories.has(k)) categories.set(k, []);
      if (labels[i + 1]) categories.get(k).push(labels[i + 1]);
    });
  });
  const cells = [...panels[0].querySelectorAll('li.cmp-image-list__item')].map((item) => {
    const card = parseItem(item, document);
    return card && [...card, (categories.get(key(item)) || []).join(', ')];
  }).filter(Boolean);
  if (!cells.length) {
    element.remove();
    return;
  }
  element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-article (filter)', cells }));
}

/**
 * Index-driven listings: an image list of pages that all live under one folder becomes a
 * "cards-article (index)" config table (Source, Sort, Limit, Exclude); the block renders the
 * cards from /query-index.json, so publishing a page adds its card with no authoring.
 * - Sort is read from the source order: A-Z titles "title", Z-A "-title", else newest
 *   first "-date" (article Publication Date)
 * - Limit is the number of cards shown, except on the folder's own listing page (all pages)
 * - Exclude: a featured article on the same page that the list leaves out (home page)
 * Returns null (static rows are used instead) when the items don't share one folder.
 */
function indexConfig(items, element, document, pageUrl) {
  const toPath = (href) => new URL(href, 'https://wknd.site').pathname.replace(/\.html?$/, '');
  const links = items.map((item) => item.querySelector('a[href]')?.getAttribute('href')).filter(Boolean);
  if (!links.length || links.length !== items.length) return null;
  const paths = links.map(toPath);
  const folder = paths[0].replace(/[^/]+$/, '');
  if (folder.split('/').length < 4 || !paths.every((p) => p.startsWith(folder))) return null;
  const titles = items.map((item) => (item.querySelector('.cmp-image-list__item-title')?.textContent || '').trim());
  const sorted = [...titles].sort((x, y) => x.localeCompare(y));
  let sort = '-date';
  if (titles.every((t, i) => t === sorted[i])) sort = 'title';
  else if (titles.every((t, i) => t === sorted[sorted.length - 1 - i])) sort = '-title';
  const config = { Source: folder, Sort: sort };
  const pagePath = pageUrl ? new URL(pageUrl).pathname.replace(/\.html?$/, '') : '';
  if (`${pagePath}/` !== folder) config.Limit = String(paths.length);
  const featuredLinks = JSON.parse(document.documentElement.getAttribute('data-featured-links') || '[]');
  const featured = featuredLinks.map(toPath)
    .filter((p) => p.startsWith(folder) && !paths.includes(p));
  if (featured.length) config.Exclude = [...new Set(featured)].join(', ');
  return config;
}

export default function parse(element, { document, params }) {
  const pageUrl = params && params.originalURL;

  if (element.matches('.teaser.cmp-teaser--secure')) {
    parseLockedTeasers(element, document);
    return;
  }
  if (element.querySelector('.cmp-tabs__tabpanel .cmp-image-list')) {
    // category tabs of pages (adventures listing): the "All" panel, index-driven with filter
    const all = [...element.querySelectorAll('.cmp-tabs__tabpanel')][0];
    const config = all && indexConfig([...all.querySelectorAll('li.cmp-image-list__item')], element, document, pageUrl);
    if (config) {
      element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-article (index, filter)', cells: config }));
      return;
    }
    parseFilterTabs(element, document);
    return;
  }

  let items = [...element.querySelectorAll('li.cmp-image-list__item')];
  if (!items.length) items = [...element.querySelectorAll('article.cmp-image-list__item-content, .cmp-image-list > li')];

  const config = indexConfig(items, element, document, pageUrl);
  if (config) {
    element.replaceWith(WebImporter.Blocks.createBlock(document, { name: 'cards-article (index)', cells: config }));
    return;
  }

  const cells = items.map((item) => parseItem(item, document)).filter(Boolean);

  if (!cells.length) {
    element.replaceWith(...element.childNodes);
    return;
  }

  const block = WebImporter.Blocks.createBlock(document, { name: 'cards-article', cells });
  element.replaceWith(block);
}
