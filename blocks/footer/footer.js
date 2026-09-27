// section order in footer.plain.html
const SECTION_NAMES = ['brand', 'nav', 'social', 'legal'];

/**
 * Fetches the footer fragment. Metadata-independent: /content first (local preview),
 * then the site root (DA / Edge Delivery).
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchFooter() {
  // local preview serves pages under /content; on DA/Edge Delivery the fragment is at the root
  let resp = window.location.pathname.startsWith('/content/') ? await fetch('/content/footer.plain.html') : null;
  if (!resp?.ok) resp = await fetch('/footer.plain.html');
  if (!resp.ok) return null;
  return { html: await resp.text(), base: resp.url };
}

/**
 * Normalizes the fragment so local and Document Authoring markup look the same:
 * unwraps the paragraphs DA adds inside list items, and resolves relative
 * image paths (img src and picture source srcset) against the fragment URL.
 */
function normalizeFragment(root, base) {
  root.querySelectorAll('li > p').forEach((p) => p.replaceWith(...p.childNodes));
  root.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
  root.querySelectorAll('source[srcset]').forEach((source) => {
    source.srcset = source.getAttribute('srcset').split(',')
      .map((candidate) => {
        const [url, ...descriptor] = candidate.trim().split(/\s+/);
        return [new URL(url, base).href, ...descriptor].join(' ');
      })
      .join(', ');
  });
}

/**
 * loads and decorates the footer
 * @param {Element} block The footer block element
 */
export default async function decorate(block) {
  const fragment = await fetchFooter();
  if (!fragment) return;

  const source = document.createElement('div');
  source.innerHTML = fragment.html;
  normalizeFragment(source, fragment.base);

  const inner = document.createElement('div');
  inner.className = 'footer-inner';
  const top = document.createElement('div');
  top.className = 'footer-top';

  [...source.children].forEach((section, i) => {
    const name = SECTION_NAMES[i] || `section-${i + 1}`;
    section.className = `footer-${name}`;
    if (name === 'nav') {
      const list = section.querySelector('ul');
      if (list) {
        list.className = 'footer-nav-list';
        list.querySelectorAll(':scope > li > a').forEach((a) => a.classList.add('footer-nav-root'));
      }
      const navEl = document.createElement('nav');
      navEl.className = section.className;
      navEl.setAttribute('aria-label', 'Footer navigation');
      navEl.append(...section.childNodes);
      top.append(navEl);
      return;
    }
    if (name === 'social') {
      section.querySelector('ul')?.classList.add('footer-social-links');
      section.querySelectorAll('a').forEach((a) => {
        const label = a.querySelector('img')?.alt;
        if (label) a.setAttribute('aria-label', label);
      });
    }
    if (name === 'legal') {
      inner.append(top, section);
      return;
    }
    top.append(section);
  });
  if (!top.parentElement) inner.append(top);

  block.textContent = '';
  block.append(inner);
}
