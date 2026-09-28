// networks with an icon in /icons, matched in the link text or URL ("Facebook Social Media")
const NETWORKS = ['facebook', 'twitter', 'instagram'];

/**
 * Turns authored text links naming a social network ("Facebook") into icon-only buttons in a
 * list: the link text stays the accessible name (aria-label + title) and
 * /icons/<network>.svg is drawn on a span through the --icon custom property.
 * Used by the author card (columns-author) and the contributor cards (cards).
 * @param {HTMLAnchorElement[]} links The authored links
 * @param {string} prefix Class prefix: `${prefix}-social-link`, `${prefix}-social-icon`
 * @returns {HTMLUListElement} The list of icon links
 */
export default function buildSocialList(links, prefix) {
  const list = document.createElement('ul');
  links.forEach((a) => {
    const label = a.textContent.trim();
    const haystack = `${label} ${a.getAttribute('href')}`.toLowerCase();
    const network = NETWORKS.find((n) => haystack.includes(n))
      || label.toLowerCase().replace(/[^a-z0-9]+/g, '-');
    // undo global button decoration: these are icon buttons
    a.className = `${prefix}-social-link`;
    a.closest('p')?.classList.remove('button-wrapper');
    a.setAttribute('aria-label', label);
    a.title = label;
    const icon = document.createElement('span');
    icon.className = `${prefix}-social-icon`;
    icon.setAttribute('aria-hidden', 'true');
    icon.style.setProperty('--icon', `url('${window.hlx.codeBasePath}/icons/${network}.svg')`);
    a.replaceChildren(icon);
    const li = document.createElement('li');
    li.append(a);
    list.append(li);
  });
  return list;
}
