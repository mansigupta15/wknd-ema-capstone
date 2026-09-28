/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: listing-card metadata for index-driven listings (articles, adventures).
 * The home rails, magazine grid and adventures listing render cards from /query-index.json,
 * so each page carries what its card shows on WKND:
 * - Image: the card image on the source listing (WKND uses a page thumbnail, often not the
 *   page's first image), which becomes og:image and the index "image"
 * - Summary: the card teaser line, only when it differs from the page description
 * - Category (adventures): the listing tabs the page appears in, e.g. "Cycling, Travel"
 * - Publication Date (articles): the content fragment's timestamp, for newest-first rails
 * The source listing is fetched once (synchronously, same origin) and looked up by page path.
 * Results are stored on <html data-import-meta> and merged into the page metadata by the
 * import script.
 */
const LISTINGS = {
  '/us/en/magazine/': '/us/en/magazine.html',
  '/us/en/adventures/': '/us/en/adventures.html',
};

function fetchListing(path) {
  const cache = (window.wkndListingCache = window.wkndListingCache || {});
  if (!(path in cache)) {
    cache[path] = null;
    try {
      const xhr = new XMLHttpRequest();
      xhr.open('GET', new URL(path, 'https://wknd.site').href, false);
      xhr.send();
      if (xhr.status === 200) cache[path] = new DOMParser().parseFromString(xhr.responseText, 'text/html');
    } catch (e) {
      console.warn('listing lookup failed', path, e);
    }
  }
  return cache[path];
}

export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;
  let url;
  try {
    url = new URL((payload && (payload.params?.originalURL || payload.url)) || window.location.href);
  } catch (e) {
    return;
  }
  const pagePath = url.pathname;
  const prefix = Object.keys(LISTINGS).find((p) => pagePath.startsWith(p));
  const meta = {};

  // article publication date: the content fragment's timestamp in the WKND data layer
  const cf = document.querySelector('.cmp-contentfragment[data-cmp-data-layer]');
  if (cf && prefix === '/us/en/magazine/') {
    try {
      const layer = Object.values(JSON.parse(cf.getAttribute('data-cmp-data-layer')))[0];
      if (layer && layer['repo:modifyDate']) meta['Publication Date'] = layer['repo:modifyDate'];
    } catch (e) { /* no date */ }
  }

  const listing = prefix && fetchListing(LISTINGS[prefix]);
  if (listing) {
    const matches = (a) => a && new URL(a.getAttribute('href'), url).pathname === pagePath;
    const items = [...listing.querySelectorAll('.cmp-image-list__item')].filter((i) => matches(i.querySelector('a[href]')));
    const item = items[0];
    if (item) {
      const img = item.querySelector('img');
      const src = img && (img.getAttribute('src') || img.getAttribute('data-src'));
      if (src && !src.startsWith('data:')) meta.Image = { src: new URL(src, 'https://wknd.site').href, alt: item.querySelector('.cmp-image-list__item-title')?.textContent.trim() || '' };
      const summary = item.querySelector('.cmp-image-list__item-description')?.textContent.trim();
      const description = document.querySelector('meta[name="description"]')?.getAttribute('content')?.trim();
      if (summary && summary !== description) meta.Summary = summary;
    }
    // adventure categories: the tabs (after "All") whose panel lists this page
    const tabs = [...listing.querySelectorAll('.cmp-tabs__tab')].map((t) => t.textContent.trim());
    const panels = [...listing.querySelectorAll('.cmp-tabs__tabpanel')];
    if (prefix === '/us/en/adventures/' && panels.length > 1) {
      const cats = panels.slice(1).map((panel, i) => ([...panel.querySelectorAll('a[href]')].some(matches) ? tabs[i + 1] : null)).filter(Boolean);
      meta.Category = [...new Set(cats)].join(', ');
    }
  }
  document.documentElement.setAttribute('data-import-meta', JSON.stringify(meta));
}
