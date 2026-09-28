import { optimizePicture } from '../../scripts/scripts.js';
import buildSocialList from '../../scripts/social-links.js';

/**
 * Cards (Block Collection): one row per card, [image] | [text: title, description, links].
 * Option "contributors" (About Us): round photo, name, role; the card's link-only paragraphs
 * (links naming a network, "Facebook") become icon-only social buttons.
 * Tolerates cards without an image and extra cells.
 */
export default function decorate(block) {
  const contributors = block.classList.contains('contributors');
  const ul = document.createElement('ul');
  [...block.children].forEach((row) => {
    const li = document.createElement('li');
    while (row.firstElementChild) li.append(row.firstElementChild);
    [...li.children].forEach((div) => {
      if (div.children.length === 1 && div.querySelector('picture')) div.className = 'cards-card-image';
      else div.className = 'cards-card-body';
    });
    const body = li.querySelector('.cards-card-body');
    if (contributors && body) {
      const linkOnly = [...body.querySelectorAll(':scope > p')].filter((p) => {
        const links = p.querySelectorAll('a[href]');
        return links.length === 1 && p.textContent.trim() === links[0].textContent.trim();
      });
      if (linkOnly.length) {
        const list = buildSocialList(linkOnly.map((p) => p.querySelector('a')), 'cards');
        list.className = 'cards-social';
        linkOnly.forEach((p) => p.remove());
        body.append(list);
      }
    }
    ul.append(li);
  });
  ul.querySelectorAll('picture > img').forEach((img) => optimizePicture(img, [{ width: contributors ? '400' : '750' }]));
  block.replaceChildren(ul);
}
