import { optimizePicture } from '../../scripts/scripts.js';
import decorateTeaser from './hero-teaser.js';

/**
 * Hero (Block Collection): a background image with a heading and text over it.
 * Option "teaser" (hero-teaser.js): WKND teaser, a full-bleed image with an overlapping
 * content box; with "centered" (image centred when cropped).
 * Default: the first picture becomes the background (keeping LCP hints and intrinsic size),
 * the rest is wrapped as the content.
 */
export default function decorate(block) {
  if (block.classList.contains('teaser')) {
    decorateTeaser(block);
    return;
  }
  const content = document.createElement('div');
  content.className = 'hero-content';
  [...block.querySelectorAll(':scope > div > div')].forEach((cell) => content.append(...cell.childNodes));
  const img = content.querySelector('picture > img');
  let media = null;
  if (img) {
    media = optimizePicture(img, [{ media: '(min-width: 900px)', width: '2000' }, { width: '900' }]);
    const wrapper = media.parentElement;
    media.remove();
    const emptyWrapper = wrapper && wrapper !== content && !wrapper.children.length;
    if (emptyWrapper && !wrapper.textContent.trim()) wrapper.remove();
  }
  block.replaceChildren(...(media ? [media] : []), content);
}
