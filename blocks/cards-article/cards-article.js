import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Article listing cards: one row per card, [linked image | linked title, description].
 * Tolerates single-cell rows, missing images, and extra cells.
 * No option classes are defined for this block; unknown tokens are ignored.
 */
export default function decorate(block) {
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

    [...row.children].forEach((cell) => {
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
    body.querySelectorAll(':scope > p:not(.cards-article-card-title)').forEach((p) => {
      p.classList.add('cards-article-card-description');
    });

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

  ul.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(createOptimizedPicture(img.src, img.alt, false, [{ width: '750' }]));
  });

  block.replaceChildren(ul);
}
