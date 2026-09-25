import { createOptimizedPicture } from '../../scripts/aem.js';

/**
 * Teaser: full-bleed image with an overlapping content box.
 * Authored as Row 1 = image, Row 2 = heading/text/CTA, but any arrangement of
 * rows/cells is accepted: the first picture becomes the media, everything else content.
 * No option classes are defined for this block; unknown tokens are ignored.
 */
export default function decorate(block) {
  const media = document.createElement('div');
  media.className = 'hero-teaser-media';
  const content = document.createElement('div');
  content.className = 'hero-teaser-content';

  const cells = [...block.children]
    .flatMap((row) => (row.children.length ? [...row.children] : [row]));
  cells.forEach((cell) => {
    if (!media.children.length) {
      const pic = cell.querySelector('picture');
      if (pic) {
        const parent = pic.parentElement;
        media.append(pic);
        if (parent !== cell && parent.textContent.trim() === '' && !parent.children.length) parent.remove();
      }
    }
    content.append(...cell.childNodes);
  });

  // drop whitespace-only nodes and empty paragraphs left behind
  [...content.childNodes].forEach((node) => {
    if (node.nodeType === Node.TEXT_NODE && node.textContent.trim() === '') node.remove();
    else if (node.nodeType === Node.ELEMENT_NODE && node.textContent.trim() === '' && !node.querySelector('picture, img')) node.remove();
  });

  // link-only paragraph = CTA (authored as plain <p><a>, so decorateButtons skips it)
  content.querySelectorAll(':scope > p').forEach((p) => {
    const links = p.querySelectorAll('a[href]');
    if (links.length === 1 && p.textContent.trim() === links[0].textContent.trim()
      && !links[0].querySelector('picture, img')) {
      p.classList.add('hero-teaser-cta');
    }
  });

  media.querySelectorAll('picture > img').forEach((img) => {
    img.closest('picture').replaceWith(
      createOptimizedPicture(img.src, img.alt, false, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }]),
    );
  });

  const parts = [];
  if (media.children.length) parts.push(media);
  else block.classList.add('hero-teaser-no-media');
  if (content.childNodes.length) parts.push(content);
  block.replaceChildren(...parts);
}
