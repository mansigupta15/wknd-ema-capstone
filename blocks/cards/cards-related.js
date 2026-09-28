/**
 * Cards option "related" (cards (related), Cards without images): one row per card,
 * [linked title, date].
 * Each card renders as a single link (title + date) with a left rule, like WKND's "up next" list.
 * Tolerates cards without a date or link, and extra paragraphs (kept as details).
 *
 * "facts" option (adventure sidebar): one row per fact, [label, value], rendered as a
 * description list with the same left-rule cards.
 */
function decorateFacts(block) {
  const list = document.createElement('dl');
  list.className = 'cards-related-list';
  [...block.children].forEach((row) => {
    const cell = row.firstElementChild || row;
    const parts = [...cell.querySelectorAll('p')].map((p) => p.textContent.trim()).filter(Boolean);
    if (!parts.length) {
      const text = cell.textContent.trim();
      if (!text) return;
      parts.push(text);
    }
    const card = document.createElement('div');
    card.className = 'cards-related-card';
    const dt = document.createElement('dt');
    dt.className = 'cards-related-date';
    [dt.textContent] = parts;
    card.append(dt);
    // a row with only one paragraph is a label without a value
    if (parts.length > 1) {
      const dd = document.createElement('dd');
      dd.className = 'cards-related-title';
      dd.textContent = parts.slice(1).join(' ');
      card.append(dd);
    }
    list.append(card);
  });
  block.replaceChildren(list);
}

export default function decorate(block) {
  if (block.classList.contains('facts')) {
    decorateFacts(block);
    return;
  }
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
