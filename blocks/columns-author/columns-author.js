import { optimizePicture } from '../../scripts/scripts.js';
import buildSocialList from '../../scripts/social-links.js';

/**
 * Author card (Columns variant): one row, cells [avatar] | [name, role] | [social links].
 * Social links are authored as text links naming the network ("Facebook"); the link text
 * becomes the accessible name and /icons/<network>.svg is drawn as the button icon.
 * Tolerates missing cells, extra cells and cells in a different order.
 */
export default function decorate(block) {
  const row = block.firstElementChild;
  if (!row) return;
  row.classList.add('columns-author-row');

  [...row.children].forEach((cell) => {
    const links = [...cell.querySelectorAll('a[href]')];
    const isImage = cell.querySelector('picture') && cell.textContent.trim() === '';
    const squash = (s) => s.replace(/\s+/g, '');
    const isSocial = links.length > 0 && links.every((a) => !a.querySelector('picture, img'))
      && squash(cell.textContent) === squash(links.map((a) => a.textContent).join(''));

    if (isImage) {
      cell.classList.add('columns-author-avatar');
      cell.querySelectorAll('picture > img').forEach((img) => optimizePicture(img, [{ width: '120' }]));
    } else if (isSocial) {
      cell.classList.add('columns-author-social');
      const list = buildSocialList(links, 'columns-author');
      cell.replaceChildren(list);
    } else if (cell.textContent.trim() === '' && !cell.querySelector('picture')) {
      cell.remove();
    } else {
      cell.classList.add('columns-author-text');
      const paragraphs = cell.querySelectorAll(':scope > p');
      paragraphs[0]?.classList.add('columns-author-name');
      if (paragraphs[1]) paragraphs[1].classList.add('columns-author-role');
    }
  });
}
