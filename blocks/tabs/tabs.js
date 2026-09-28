import { toClassName } from '../../scripts/aem.js';
import { optimizePicture } from '../../scripts/scripts.js';

let instanceCount = 0;

/**
 * Tabs (Block Collection): one row per tab, [tab label] | [tab content].
 * Builds an ARIA tablist (arrow keys, Home / End; only the selected tab is in the tab order).
 * Tolerates a missing content cell (the tab shows an empty panel) and extra cells
 * (kept in the panel).
 */
function select(block, tab) {
  block.querySelectorAll('[role=tab]').forEach((t) => {
    const selected = t === tab;
    t.setAttribute('aria-selected', selected);
    t.tabIndex = selected ? 0 : -1;
    block.querySelector(`#${t.getAttribute('aria-controls')}`).hidden = !selected;
  });
}

export default function decorate(block) {
  instanceCount += 1;
  const tablist = document.createElement('div');
  tablist.className = 'tabs-list';
  tablist.setAttribute('role', 'tablist');

  const rows = [...block.children].filter((row) => row.firstElementChild?.textContent.trim());
  rows.forEach((row, i) => {
    const label = row.firstElementChild;
    const id = `${toClassName(label.textContent) || 'tab'}-${instanceCount}-${i}`;

    const panel = row;
    panel.className = 'tabs-panel';
    panel.id = `tabpanel-${id}`;
    panel.setAttribute('role', 'tabpanel');
    panel.setAttribute('aria-labelledby', `tab-${id}`);
    panel.tabIndex = 0;
    panel.hidden = i > 0;

    const tab = document.createElement('button');
    tab.type = 'button';
    tab.className = 'tabs-tab';
    tab.id = `tab-${id}`;
    tab.textContent = label.textContent.trim();
    tab.setAttribute('role', 'tab');
    tab.setAttribute('aria-controls', panel.id);
    tab.setAttribute('aria-selected', i === 0);
    tab.tabIndex = i === 0 ? 0 : -1;
    tab.addEventListener('click', () => select(block, tab));
    tablist.append(tab);
    label.remove();

    panel.querySelectorAll('picture > img').forEach((img) => optimizePicture(img, [{ media: '(min-width: 600px)', width: '1200' }, { width: '750' }]));
  });

  tablist.addEventListener('keydown', (e) => {
    const tabs = [...tablist.children];
    const current = tabs.indexOf(document.activeElement);
    if (current < 0) return;
    const next = {
      ArrowRight: (current + 1) % tabs.length,
      ArrowLeft: (current - 1 + tabs.length) % tabs.length,
      Home: 0,
      End: tabs.length - 1,
    }[e.key];
    if (next === undefined) return;
    e.preventDefault();
    tabs[next].focus();
    select(block, tabs[next]);
  });

  block.prepend(tablist);
}
