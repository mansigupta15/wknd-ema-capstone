import { optimizePicture } from '../../scripts/scripts.js';

// networks with an icon in /icons, matched in the link text or URL ("Facebook Social Media")
const NETWORKS = ['facebook', 'twitter', 'instagram'];

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
      const list = document.createElement('ul');
      links.forEach((a) => {
        const label = a.textContent.trim();
        const haystack = `${label} ${a.getAttribute('href')}`.toLowerCase();
        const network = NETWORKS.find((n) => haystack.includes(n))
          || label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
        // undo global button decoration: these are icon buttons
        a.className = 'columns-author-social-link';
        a.closest('p')?.classList.remove('button-wrapper');
        a.setAttribute('aria-label', label);
        a.title = label;
        const icon = document.createElement('span');
        icon.className = 'columns-author-social-icon';
        icon.setAttribute('aria-hidden', 'true');
        icon.style.setProperty('--icon', `url('${window.hlx.codeBasePath}/icons/${network}.svg')`);
        a.replaceChildren(icon);
        const li = document.createElement('li');
        li.append(a);
        list.append(li);
      });
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
