/*
 * Accordion (Block Collection): one row per item, [title] | [content].
 * Each item is a native <details> / <summary> (keyboard and screen reader support built in).
 * Tolerates a missing content cell (the item only shows its title) and extra cells
 * (kept in the content).
 */
export default function decorate(block) {
  [...block.children].forEach((row) => {
    const [label, ...rest] = row.children;
    if (!label || !label.textContent.trim()) {
      row.remove();
      return;
    }
    const summary = document.createElement('summary');
    summary.className = 'accordion-item-label';
    summary.append(...label.childNodes);

    const body = document.createElement('div');
    body.className = 'accordion-item-body';
    rest.forEach((cell) => body.append(...cell.childNodes));

    const details = document.createElement('details');
    details.className = 'accordion-item';
    details.append(summary, body);
    row.replaceWith(details);
  });
}
