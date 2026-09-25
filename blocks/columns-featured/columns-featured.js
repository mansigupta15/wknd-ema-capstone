import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Featured two-column layout: one media cell + one text cell per row.
 * Tolerates reversed cell order, missing image, empty and extra cells.
 * No option classes are defined for this block; unknown tokens are ignored.
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    row.classList.add('columns-featured-row');
    const cells = [...row.children];
    if (!cells.length) {
      row.remove();
      return;
    }

    let mediaFound = false;
    cells.forEach((cell) => {
      const hasPicture = !!cell.querySelector('picture');
      const isImageOnly = hasPicture && cell.textContent.trim() === '';
      if (isImageOnly && !mediaFound) {
        mediaFound = true;
        cell.classList.add('columns-featured-media');
        cell.querySelectorAll('picture > img').forEach((img) => {
          img.closest('picture').replaceWith(
            createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '1200' }, { width: '750' }]),
          );
        });
      } else if (cell.textContent.trim() === '' && !hasPicture) {
        cell.remove();
      } else {
        cell.classList.add('columns-featured-content');
        // a plain paragraph preceding the heading acts as an eyebrow label
        const heading = cell.querySelector('h1, h2, h3, h4, h5, h6');
        const first = cell.firstElementChild;
        if (heading && first && first !== heading && first.tagName === 'P'
          && !first.querySelector('a, picture')) {
          first.classList.add('columns-featured-eyebrow');
        }
        // link-only paragraph = CTA (authored as plain <p><a>, so decorateButtons skips it)
        cell.querySelectorAll(':scope > p').forEach((p) => {
          const links = p.querySelectorAll('a[href]');
          if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()
            && !links[0].querySelector('picture, img')) {
            p.classList.add('columns-featured-cta');
          }
        });
      }
    });

    if (!mediaFound) row.classList.add('columns-featured-no-media');
  });
}
