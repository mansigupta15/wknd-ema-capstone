/**
 * Related articles (Cards, no images): one row per card, [linked title, date].
 * Each card renders as a single link (title + date) with a left rule, like WKND's "up next" list.
 * Tolerates cards without a date or link, and extra paragraphs (kept as details).
 */
export default function decorate(block) {
  const list = document.createElement('ul');
  list.className = 'cards-related-list';

  [...block.children].forEach((row) => {
    const cell = row.firstElementChild || row;
    if (cell.textContent.trim() === '') return;
    const link = cell.querySelector('a[href]');
    const paragraphs = [...cell.querySelectorAll('p')];
    const titleP = paragraphs.find((p) => p.contains(link)) || paragraphs[0];

    const title = document.createElement('span');
    title.className = 'cards-related-title';
    title.textContent = (link || titleP || cell).textContent.trim();
    const details = paragraphs.filter((p) => p !== titleP).map((p) => {
      const span = document.createElement('span');
      span.className = 'cards-related-date';
      span.textContent = p.textContent.trim();
      return span;
    });

    const card = document.createElement(link ? 'a' : 'div');
    card.className = 'cards-related-card';
    if (link) card.href = link.href;
    card.append(title, ...details);
    const li = document.createElement('li');
    li.append(card);
    list.append(li);
  });

  block.replaceChildren(list);
}
