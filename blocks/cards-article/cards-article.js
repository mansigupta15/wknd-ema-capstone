import { readBlockConfig } from '../../scripts/aem.js';
import { optimizePicture } from '../../scripts/scripts.js';
import queryIndex from '../../scripts/query-index.js';

/**
 * Article listing cards: one row per card, [linked image | linked title, description].
 * Tolerates single-cell rows, missing images, and extra cells.
 * Option "locked": members-only teasers (text above a faded image, lock badge,
 * trailing non-link action label).
 * Option "filter": a third cell lists each card's categories (comma-separated, may be empty);
 * the block adds "All" + one toggle button per category (alphabetical) that shows only the
 * matching cards.
 * Option "index": the cards come from the query index instead of authored rows. The block is
 * a key / value table: Source (path prefix, e.g. /us/en/magazine/), Sort (index field, "-" for
 * descending: title, -title, -date), Limit, Exclude (comma-separated paths). Each page's card
 * shows its index image, title and summary (else description), and with "filter" its
 * categories. Publishing a page adds it; no authoring on the listing.
 * Unknown option tokens are ignored.
 */

/** Builds authored-style card rows from the query index (option "index"). */
async function rowsFromIndex(block) {
  const config = readBlockConfig(block);
  const list = (value) => String(value || '').split(',').map((v) => v.trim()).filter(Boolean);
  const pages = await queryIndex({
    source: config.source || '/',
    sort: config.sort,
    limit: parseInt(config.limit, 10) || undefined,
    exclude: list(config.exclude),
  });
  return pages.map((page) => {
    const row = document.createElement('div');
    const media = document.createElement('div');
    if (page.image) {
      const link = document.createElement('a');
      link.href = page.path;
      const picture = document.createElement('picture');
      const img = document.createElement('img');
      img.src = page.image;
      img.alt = page.title || '';
      picture.append(img);
      link.append(picture);
      media.append(link);
    }
    const body = document.createElement('div');
    const title = document.createElement('p');
    const strong = document.createElement('strong');
    const a = document.createElement('a');
    a.href = page.path;
    a.textContent = page.title || page.path;
    strong.append(a);
    title.append(strong);
    body.append(title);
    const text = page.summary || page.description;
    if (text) {
      const p = document.createElement('p');
      p.textContent = text;
      body.append(p);
    }
    row.append(media, body);
    if (block.classList.contains('filter')) {
      const categories = document.createElement('div');
      categories.textContent = page.category || '';
      row.append(categories);
    }
    return row;
  });
}

function buildFilter(block, ul) {
  const cards = [...ul.children];
  const names = [...new Set(cards.flatMap((li) => li.dataset.categories.split('|').filter(Boolean)))]
    .sort((a, b) => a.localeCompare(b));
  if (!names.length) return;

  const group = document.createElement('div');
  group.className = 'cards-article-filter';
  group.setAttribute('role', 'group');
  group.setAttribute('aria-label', 'Filter by category');
  const status = document.createElement('p');
  status.className = 'cards-article-filter-status';
  status.setAttribute('aria-live', 'polite');

  ['All', ...names].forEach((name, i) => {
    const button = document.createElement('button');
    button.type = 'button';
    button.className = 'cards-article-filter-button';
    button.textContent = name;
    button.setAttribute('aria-pressed', i === 0);
    button.addEventListener('click', () => {
      group.querySelectorAll('button').forEach((b) => b.setAttribute('aria-pressed', b === button));
      let shown = 0;
      cards.forEach((li) => {
        li.hidden = i > 0 && !li.dataset.categories.split('|').includes(name);
        if (!li.hidden) shown += 1;
      });
      status.textContent = `${shown} of ${cards.length} shown`;
    });
    group.append(button);
  });
  block.prepend(group, status);
}

export default async function decorate(block) {
  if (block.classList.contains('index')) block.replaceChildren(...await rowsFromIndex(block));
  const filter = block.classList.contains('filter');
  const ul = document.createElement('ul');
  ul.className = 'cards-article-list';

  [...block.children].forEach((row) => {
    if (row.textContent.trim() === '' && !row.querySelector('picture')) return;

    const li = document.createElement('li');
    li.className = 'cards-article-card';
    const media = document.createElement('div');
    media.className = 'cards-article-card-image';
    const body = document.createElement('div');
    body.className = 'cards-article-card-body';

    const cells = [...row.children];
    if (filter) {
      // categories: the third cell ("Cycling, Travel"); absent or empty = only under "All"
      const categoryCell = cells.length > 2 ? cells.pop() : null;
      li.dataset.categories = (categoryCell?.textContent || '').split(',')
        .map((c) => c.trim()).filter(Boolean).join('|');
    }

    cells.forEach((cell) => {
      const pic = cell.querySelector('picture');
      if (pic && !media.children.length && cell.textContent.trim() === '') {
        // keep the link around the image if the author linked it
        media.append(...cell.childNodes);
      } else {
        if (pic && !media.children.length) {
          const link = pic.closest('a');
          media.append(link && cell.contains(link) && link.textContent.trim() === '' ? link : pic);
        }
        body.append(...cell.childNodes);
      }
    });

    // strip empty paragraphs left behind after moving the image
    body.querySelectorAll('p').forEach((p) => {
      if (p.textContent.trim() === '' && !p.querySelector('picture, img')) p.remove();
    });

    // the backend wraps inline <a><picture> in a <p>; unwrap so the image cell carries no p margins
    media.querySelectorAll(':scope > p').forEach((p) => p.replaceWith(...p.childNodes));

    // identify the title: first heading, else a paragraph already buttonized by decorateButtons
    // (authored <p><strong><a>, whose <strong> it removes), else the first strong/link paragraph
    const paragraphs = [...body.querySelectorAll(':scope > p')];
    const title = body.querySelector('h1, h2, h3, h4, h5, h6')
      || paragraphs.find((p) => p.classList.contains('button-wrapper'))
      || paragraphs.find((p) => p.querySelector('strong, a'));
    if (title) {
      // a card title is a heading-like link, not a CTA: undo global button decoration
      title.classList.remove('button-wrapper');
      title.querySelectorAll('a.button').forEach((a) => {
        a.classList.remove('button', 'primary', 'secondary', 'accent');
        if (!a.classList.length) a.removeAttribute('class');
      });
      title.classList.add('cards-article-card-title');
    }
    const details = [...body.querySelectorAll(':scope > p:not(.cards-article-card-title)')];
    details.forEach((p) => p.classList.add('cards-article-card-description'));
    // locked (members-only) cards end with a non-link action label, e.g. "Read More"
    if (block.classList.contains('locked') && details.length > 1) {
      const label = details[details.length - 1];
      label.classList.replace('cards-article-card-description', 'cards-article-card-label');
    }

    // image link duplicating the title link: keep it clickable but out of tab order / AT tree
    const mediaLink = media.querySelector('a[href]');
    const titleLink = title?.querySelector('a[href]');
    if (mediaLink && titleLink && mediaLink.href === titleLink.href) {
      mediaLink.setAttribute('tabindex', '-1');
      mediaLink.setAttribute('aria-hidden', 'true');
    }

    if (media.children.length) li.append(media);
    if (body.children.length) li.append(body);
    ul.append(li);
  });

  ul.querySelectorAll('picture > img').forEach((img) => optimizePicture(img, [{ media: '(min-width: 600px)', width: '750' }, { width: '500' }]));

  block.replaceChildren(ul);
  if (filter) buildFilter(block, ul);
}
