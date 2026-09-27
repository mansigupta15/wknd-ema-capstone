/**
 * Breadcrumb, generated from the page URL (auto-blocked on article pages; no authored content).
 * - the locale root (first two path segments, e.g. /us/en) is not shown
 * - ancestor labels come from the nav fragment's links, else a title-cased path segment
 * - the current page is the last item (page title), marked aria-current="page"
 */

const LOCALE_DEPTH = 2;

/** Local preview serves pages under /content; Edge Delivery serves them at the root. */
function getPrefix() {
  return window.location.pathname.startsWith('/content/') ? '/content' : '';
}

function normalize(pathname) {
  return pathname.replace(/^\/content(?=\/)/, '').replace(/\.html$/, '').replace(/\/$/, '');
}

function titleCase(slug) {
  return slug.split('-').map((w) => w.charAt(0).toUpperCase() + w.slice(1)).join(' ');
}

/** Maps normalized link paths in the nav fragment to their labels. */
async function getNavLabels(prefix) {
  const labels = new Map();
  try {
    const resp = await fetch(`${prefix}/nav.plain.html`);
    if (!resp.ok) return labels;
    const nav = document.createElement('div');
    nav.innerHTML = await resp.text();
    nav.querySelectorAll('a[href]').forEach((a) => {
      const path = normalize(new URL(a.getAttribute('href'), window.location.href).pathname);
      const text = a.textContent.trim();
      if (text && !labels.has(path)) labels.set(path, text);
    });
  } catch (e) {
    // labels fall back to the path segment
  }
  return labels;
}

export default async function decorate(block) {
  const prefix = getPrefix();
  const segments = normalize(window.location.pathname).split('/').filter(Boolean);
  if (segments.length <= LOCALE_DEPTH) {
    block.remove();
    return;
  }

  const labels = await getNavLabels(prefix);
  const list = document.createElement('ol');
  for (let i = LOCALE_DEPTH; i < segments.length; i += 1) {
    const path = `/${segments.slice(0, i + 1).join('/')}`;
    const li = document.createElement('li');
    if (i === segments.length - 1) {
      li.setAttribute('aria-current', 'page');
      li.textContent = document.title.trim() || titleCase(segments[i]);
    } else {
      const a = document.createElement('a');
      a.href = `${prefix}${path}`;
      a.textContent = labels.get(path) || titleCase(segments[i]);
      li.append(a);
    }
    list.append(li);
  }

  const nav = document.createElement('nav');
  nav.setAttribute('aria-label', 'Breadcrumb');
  nav.append(list);
  block.replaceChildren(nav);
}
