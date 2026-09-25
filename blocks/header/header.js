// desktop layout breakpoint (matches the source header)
const isDesktop = window.matchMedia('(width >= 1200px)');

// section order in nav.plain.html
const SECTION_NAMES = ['utility', 'brand', 'sections', 'search', 'signin'];

/**
 * Fetches the nav fragment. Metadata-independent: /content first (local preview),
 * then the site root (DA / Edge Delivery).
 * @returns {Promise<{html: string, base: string}|null>}
 */
async function fetchNav() {
  const paths = ['/content/nav.plain.html', '/nav.plain.html'];
  for (let i = 0; i < paths.length; i += 1) {
    // eslint-disable-next-line no-await-in-loop
    const resp = await fetch(paths[i]);
    if (resp.ok) {
      // eslint-disable-next-line no-await-in-loop
      return { html: await resp.text(), base: new URL(paths[i], window.location.href).href };
    }
  }
  return null;
}

/**
 * Makes relative image paths in the fragment resolve against the fragment URL.
 */
function resolveImages(root, base) {
  root.querySelectorAll('img[src]').forEach((img) => {
    img.src = new URL(img.getAttribute('src'), base).href;
  });
}

/** Text content of a list item, excluding nested lists and images. */
function ownText(li) {
  return [...li.childNodes]
    .filter((n) => n.nodeType === Node.TEXT_NODE)
    .map((n) => n.textContent)
    .join(' ')
    .trim();
}

/** Strips the local preview /content prefix and trailing .html for path comparisons. */
function normalizePath(pathname) {
  return pathname.replace(/^\/content(?=\/)/, '').replace(/\.html$/, '').replace(/\/$/, '') || '/';
}

function closePanel(trigger, panel) {
  trigger.setAttribute('aria-expanded', 'false');
  panel.hidden = true;
}

/**
 * Keeps an opened, right-aligned panel inside the viewport.
 */
function clampToViewport(panel) {
  panel.style.removeProperty('--panel-shift');
  const { left, right } = panel.getBoundingClientRect();
  const overflow = right - (document.documentElement.clientWidth - 8);
  if (overflow > 0) panel.style.setProperty('--panel-shift', `${Math.min(overflow, left - 8)}px`);
}

/**
 * Builds the locale switcher from a nested list:
 * trigger label > groups (flag + name) > locale links.
 */
function buildLocale(list) {
  const root = list.querySelector(':scope > li');
  if (!root) return null;
  const groupList = root.querySelector(':scope > ul');
  if (!groupList) return null;

  const current = normalizePath(window.location.pathname);
  const authoredLabel = ownText(root);
  let activeLink = null;
  let activeFlag = null;

  const panel = document.createElement('div');
  panel.className = 'nav-locale-panel';
  panel.id = 'nav-locale-panel';
  panel.hidden = true;
  const groups = document.createElement('ul');
  groups.className = 'nav-locale-groups';

  [...groupList.children].forEach((groupLi) => {
    const flag = groupLi.querySelector(':scope > img, :scope > picture img');
    const locales = groupLi.querySelector(':scope > ul');
    const item = document.createElement('li');
    item.className = 'nav-locale-group';
    if (flag) {
      flag.className = 'nav-locale-flag';
      flag.alt = '';
      item.append(flag);
    }
    const name = document.createElement('span');
    name.className = 'nav-locale-country';
    name.textContent = ownText(groupLi);
    item.append(name);
    if (locales) {
      locales.className = 'nav-locale-links';
      locales.querySelectorAll('a').forEach((a) => {
        const matchesPath = current === normalizePath(new URL(a.href).pathname)
          || current.startsWith(`${normalizePath(new URL(a.href).pathname)}/`);
        const matchesLabel = a.textContent.trim() === authoredLabel;
        if (!activeLink && (matchesPath || matchesLabel)) {
          activeLink = a;
          activeFlag = flag;
        }
      });
      item.append(locales);
    }
    groups.append(item);
  });
  if (activeLink) activeLink.setAttribute('aria-current', 'true');
  panel.append(groups);

  const trigger = document.createElement('button');
  trigger.type = 'button';
  trigger.className = 'nav-locale-toggle';
  trigger.setAttribute('aria-expanded', 'false');
  trigger.setAttribute('aria-controls', panel.id);
  const label = activeLink ? activeLink.textContent.trim() : authoredLabel;
  trigger.setAttribute('aria-label', `Change language, current ${label}`);
  if (activeFlag) {
    const icon = activeFlag.cloneNode();
    icon.className = 'nav-locale-toggle-flag';
    trigger.append(icon);
  }
  const text = document.createElement('span');
  text.textContent = label;
  trigger.append(text);

  trigger.addEventListener('click', (e) => {
    e.stopPropagation();
    const open = panel.hidden;
    trigger.setAttribute('aria-expanded', open);
    panel.hidden = !open;
    if (open) clampToViewport(panel);
  });

  const wrapper = document.createElement('div');
  wrapper.className = 'nav-locale';
  wrapper.append(trigger, panel);
  return { wrapper, trigger, panel };
}

/**
 * Builds the sign-in dialog from the fragment section:
 * headings, a list of field labels, links, and a strong button label.
 * The form is presentational only (no authentication backend).
 */
function buildSignIn(section) {
  const dialog = document.createElement('div');
  dialog.className = 'nav-signin-panel';
  dialog.id = 'nav-signin';
  dialog.setAttribute('role', 'dialog');
  dialog.setAttribute('aria-modal', 'true');
  dialog.hidden = true;

  const heading = section.querySelector('h1, h2');
  if (heading) {
    heading.id = 'nav-signin-title';
    dialog.setAttribute('aria-labelledby', heading.id);
    dialog.append(heading);
  }
  const subheading = section.querySelector('h3, h4');
  if (subheading) dialog.append(subheading);

  const form = document.createElement('form');
  form.className = 'nav-signin-form';
  form.noValidate = true;
  section.querySelectorAll('li').forEach((li, i) => {
    const labelText = li.textContent.trim();
    const input = document.createElement('input');
    input.type = /password/i.test(labelText) ? 'password' : 'text';
    input.name = labelText.toLowerCase().replace(/\W+/g, '-');
    input.id = `nav-signin-field-${i}`;
    input.placeholder = labelText;
    input.setAttribute('aria-label', labelText);
    input.autocomplete = input.type === 'password' ? 'current-password' : 'username';
    form.append(input);
  });
  section.querySelectorAll('p > a').forEach((a) => {
    const p = document.createElement('p');
    p.className = 'nav-signin-link';
    p.append(a);
    form.append(p);
  });
  const buttonLabel = section.querySelector('strong');
  if (buttonLabel) {
    const button = document.createElement('button');
    button.type = 'submit';
    button.className = 'nav-signin-submit';
    button.textContent = buttonLabel.textContent.trim();
    form.append(button);
  }
  form.addEventListener('submit', (e) => e.preventDefault());
  dialog.append(form, document.createElement('hr'));
  return dialog;
}

/**
 * Builds the search form: icon + placeholder text, and a link whose href is the results page.
 */
function buildSearch(section) {
  const form = document.createElement('form');
  form.className = 'nav-search';
  form.setAttribute('role', 'search');
  form.method = 'get';
  const results = section.querySelector('a[href]');
  form.action = results ? results.href : '/search';

  const icon = section.querySelector('img');
  if (icon) {
    icon.className = 'nav-search-icon';
    icon.alt = '';
    form.append(icon);
  }
  const labelText = [...section.querySelectorAll('p')]
    .find((p) => !p.querySelector('a'))?.textContent.trim() || 'Search';
  const input = document.createElement('input');
  input.type = 'search';
  input.name = 'q';
  input.placeholder = labelText;
  input.setAttribute('aria-label', labelText);
  form.append(input);
  return form;
}

/**
 * loads and decorates the header
 * @param {Element} block The header block element
 */
export default async function decorate(block) {
  const fragment = await fetchNav();
  if (!fragment) return;

  const source = document.createElement('div');
  source.innerHTML = fragment.html;
  resolveImages(source, fragment.base);
  const sections = {};
  [...source.children].forEach((section, i) => {
    if (SECTION_NAMES[i]) sections[SECTION_NAMES[i]] = section;
  });

  block.textContent = '';
  const nav = document.createElement('nav');
  nav.id = 'nav';
  nav.setAttribute('aria-label', 'Main navigation');

  // utility row: sign in + locale switcher
  const utility = document.createElement('div');
  utility.className = 'nav-utility';
  const utilityInner = document.createElement('div');
  utilityInner.className = 'nav-utility-inner';
  utility.append(utilityInner);
  let locale = null;
  let signInTrigger = null;
  if (sections.utility) {
    const signInLink = sections.utility.querySelector(':scope > p a');
    if (signInLink) {
      signInTrigger = document.createElement('button');
      signInTrigger.type = 'button';
      signInTrigger.className = 'nav-signin-toggle';
      signInTrigger.textContent = signInLink.textContent.trim();
      signInTrigger.setAttribute('aria-expanded', 'false');
      signInTrigger.setAttribute('aria-controls', 'nav-signin');
      utilityInner.append(signInTrigger);
    }
    const list = sections.utility.querySelector(':scope > ul');
    locale = list ? buildLocale(list) : null;
    if (locale) utilityInner.append(locale.wrapper);
  }

  // main row: brand, hamburger, sections, search
  const main = document.createElement('div');
  main.className = 'nav-main';
  const mainInner = document.createElement('div');
  mainInner.className = 'nav-main-inner';
  main.append(mainInner);

  if (sections.brand) {
    const brand = document.createElement('div');
    brand.className = 'nav-brand';
    const link = sections.brand.querySelector('a');
    if (link) {
      link.className = 'nav-brand-link';
      brand.append(link);
    }
    mainInner.append(brand);
  }

  const hamburger = document.createElement('button');
  hamburger.type = 'button';
  hamburger.className = 'nav-hamburger';
  hamburger.setAttribute('aria-controls', 'nav-sections');
  hamburger.setAttribute('aria-expanded', 'false');
  hamburger.setAttribute('aria-label', 'Open navigation');
  hamburger.innerHTML = '<span class="nav-hamburger-icon"></span>';
  mainInner.append(hamburger);

  const navSections = document.createElement('div');
  navSections.className = 'nav-sections';
  navSections.id = 'nav-sections';
  if (sections.sections) {
    const list = sections.sections.querySelector('ul');
    if (list) {
      const current = normalizePath(window.location.pathname);
      list.querySelectorAll('a').forEach((a) => {
        if (normalizePath(new URL(a.href).pathname) === current) a.setAttribute('aria-current', 'page');
      });
      navSections.append(list);
    }
  }
  mainInner.append(navSections);
  if (sections.search) mainInner.append(buildSearch(sections.search));

  nav.append(utility, main);
  const signIn = sections.signin ? buildSignIn(sections.signin) : null;

  const navWrapper = document.createElement('div');
  navWrapper.className = 'nav-wrapper';
  navWrapper.append(nav);
  if (signIn) navWrapper.append(signIn);
  block.append(navWrapper);

  // --- behavior ---
  const setMenu = (open) => {
    hamburger.setAttribute('aria-expanded', open);
    hamburger.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    nav.classList.toggle('is-menu-open', open);
    document.body.classList.toggle('nav-menu-open', open && !isDesktop.matches);
  };
  hamburger.addEventListener('click', () => setMenu(hamburger.getAttribute('aria-expanded') !== 'true'));

  const setSignIn = (open) => {
    if (!signIn || !signInTrigger) return;
    signInTrigger.setAttribute('aria-expanded', open);
    signIn.hidden = !open;
    if (open) signIn.querySelector('input')?.focus();
  };
  if (signInTrigger) {
    signInTrigger.addEventListener('click', (e) => {
      e.stopPropagation();
      if (locale) closePanel(locale.trigger, locale.panel);
      setSignIn(signIn.hidden);
    });
  }

  document.addEventListener('click', (e) => {
    if (locale && !locale.wrapper.contains(e.target)) closePanel(locale.trigger, locale.panel);
    if (signIn && !signIn.hidden && !signIn.contains(e.target)) setSignIn(false);
  });
  document.addEventListener('keydown', (e) => {
    if (e.key !== 'Escape') return;
    if (locale && !locale.panel.hidden) {
      closePanel(locale.trigger, locale.panel);
      locale.trigger.focus();
    } else if (signIn && !signIn.hidden) {
      setSignIn(false);
      signInTrigger.focus();
    } else if (hamburger.getAttribute('aria-expanded') === 'true') {
      setMenu(false);
      hamburger.focus();
    }
  });

  // compact header once the page scrolls
  const onScroll = () => navWrapper.classList.toggle('is-scrolled', window.scrollY > 0);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  // reset open states when crossing the desktop breakpoint
  isDesktop.addEventListener('change', () => {
    setMenu(false);
    if (locale) closePanel(locale.trigger, locale.panel);
  });
}
