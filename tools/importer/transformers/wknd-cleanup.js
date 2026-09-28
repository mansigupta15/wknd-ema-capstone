/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup (AEM Core Components).
 * All selectors verified in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
    // Non-breaking spaces: the importer's DOM has lost them (the raw HTML still has them), so
    // put them back in the matching text nodes; afterTransform carries them through markdown
    if (payload && typeof payload.html === 'string' && /&nbsp;|\u00a0/.test(payload.html)) {
      const raw = new DOMParser().parseFromString(payload.html, 'text/html');
      const withNbsp = new Map();
      const rawWalker = raw.createTreeWalker(raw.body, NodeFilter.SHOW_TEXT);
      while (rawWalker.nextNode()) {
        const text = rawWalker.currentNode.nodeValue;
        if (text.includes('\u00a0')) withNbsp.set(text.replace(/\u00a0/g, ' '), text);
      }
      if (withNbsp.size) {
        const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
        while (walker.nextNode()) {
          const restored = withNbsp.get(walker.currentNode.nodeValue);
          if (restored) walker.currentNode.nodeValue = restored;
        }
      }
    }
    // Featured-article links, recorded before the columns-featured parser replaces the teaser:
    // the cards-article parser leaves them out of index-driven lists on the same page
    document.documentElement.setAttribute('data-featured-links', JSON.stringify(
      [...element.querySelectorAll('.cmp-teaser--featured a[href]')].map((a) => a.getAttribute('href')),
    ));

    // Global chrome, migrated separately (header/footer experience fragments).
    // <header class="experiencefragment cmp-experiencefragment--header ...">
    // <footer class="experiencefragment cmp-experiencefragment--footer ...">
    // Removed before parsing so footer/header .cmp-layout-container--fixed,
    // .separator, .title and .image elements cannot match block/section selectors.
    WebImporter.DOMUtils.remove(element, [
      'header.experiencefragment',
      'footer.experiencefragment',
      '.cmp-experiencefragment--header',
      '.cmp-experiencefragment--footer',
      // Mobile nav toggle + drawer: <div id="toggleNav">, <div id="mobileNav" class="cmp-navigation--mobile">
      '#toggleNav',
      '#mobileNav',
      // Header widgets (inside header XF; listed defensively)
      '.sign-in-buttons',
      '.languagenavigation',
      '.search.cmp-search--header',
      // Adobe ID sync tracking iframe: <iframe id="destination_publishing_iframe_wkndsite_0">
      'iframe[id^="destination_publishing_iframe"]',
    ]);

    // Standalone Core Component buttons ("All Articles", "All Trips"):
    // <div class="button cmp-button--primary"><a class="cmp-button"><span class="cmp-button__text">
    // Emit as bold + italic links so decorateButtons renders the accent (yellow) button.
    element.querySelectorAll('.button.cmp-button--primary a.cmp-button').forEach((a) => {
      const text = a.textContent.trim();
      if (!text) return;
      a.textContent = text;
      const strong = document.createElement('strong');
      const em = document.createElement('em');
      a.replaceWith(strong);
      em.append(a);
      strong.append(em);
    });
  }

  if (hookName === TransformHook.afterTransform) {
    WebImporter.DOMUtils.remove(element, [
      // Carousel controls (prev/next buttons, indicator list duplicating slide titles)
      '.cmp-carousel__actions',
      '.cmp-carousel__indicators',
      // Visual horizontal-rule separators: <div class="separator ..."><div class="cmp-separator"><hr class="cmp-separator__horizontal-rule">
      // They coincide with section breaks; section transformer inserts its own bare <hr>.
      // Removed in afterTransform so the section-4 selector (.separator + .title) still matches in beforeTransform.
      'div.separator',
      // Empty <meta> left inside .cmp-image wrappers
      '.cmp-image meta',
      // Safe non-content elements
      'iframe',
      'link',
      'noscript',
      'script',
      'style',
    ]);

    // Alt text: every image gets a meaningful, unique alt.
    // - long captions (> 125 chars) are trimmed to their first sentence
    // - empty alts fall back to the nearest preceding heading, then a descriptive file name
    //   (surfer-wave-02.jpeg -> "Surfer wave"; stock IDs and one-word names are skipped),
    //   then the page title (e.g. a hero image above the h1)
    // - duplicates get a position suffix
    // Fallbacks are flagged with data-alt-review; the import script lists them in the
    // report (altReview) and strips the attribute, so editors can refine them in DA.
    const pageTitle = ((payload && payload.document) || document).title.trim();
    const fileAlt = (src) => {
      const file = decodeURIComponent((src || '').split(/[?#]/)[0].split('/').pop() || '').replace(/\.[a-z0-9]+$/i, '');
      const words = file.split(/[-_\s]+/).filter((w) => w && !/^\d+$/.test(w));
      if (words.length < 2 || words.some((w) => !/^[a-z]{2,}$/i.test(w)) || /adobestock|^(img|dsc|pxl)$/i.test(words[0])) return '';
      const text = words.join(' ').toLowerCase();
      return text[0].toUpperCase() + text.slice(1);
    };
    const seen = new Map();
    let context = '';
    element.querySelectorAll('h1, h2, h3, h4, h5, h6, img').forEach((node) => {
      if (node.tagName !== 'IMG') {
        context = node.textContent.trim();
        return;
      }
      let alt = (node.getAttribute('alt') || '').replace(/\s+/g, ' ').trim();
      let review = '';
      if (alt.length > 125) {
        const sentence = alt.match(/^.{20,125}?[.!?](?=\s|$)/);
        alt = sentence ? sentence[0] : `${alt.slice(0, 120).replace(/\s+\S*$/, '')}…`;
      }
      if (!alt && context) {
        alt = context;
        review = 'empty alt, used nearest heading';
      }
      if (!alt) {
        alt = fileAlt(node.getAttribute('src'));
        if (alt) review = 'empty alt, used file name';
      }
      if (!alt && pageTitle) {
        alt = pageTitle;
        review = 'empty alt, used page title';
      }
      const count = (seen.get(alt) || 0) + 1;
      seen.set(alt, count);
      if (alt && count > 1) {
        alt = `${alt} (image ${count})`;
        review = review || 'duplicate alt';
      }
      node.setAttribute('alt', alt);
      if (review || !alt) node.setAttribute('data-alt-review', review || 'no alt and no heading context');
    });

    // Internal links: Edge Delivery pages are extensionless and site-relative.
    // /us/en/magazine.html -> /us/en/magazine ; https://wknd.site/us/en.html#x -> /us/en#x
    element.querySelectorAll('a[href]').forEach((a) => {
      const href = a.getAttribute('href');
      const m = href.match(/^(?:https?:\/\/(?:www\.)?wknd\.site)?(\/[^?#]*?)\.html?([?#].*)?$/i);
      if (m) a.setAttribute('href', `${m[1]}${m[2] || ''}`);
    });

    // Non-breaking spaces decide where WKND's lines wrap ("the&nbsp;quintessential"), but the
    // markdown step turns them into plain spaces. Carry them as U+202F (narrow no-break space),
    // which survives; upload-to-da.mjs writes them back as &nbsp;.
    const nbspWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
    while (nbspWalker.nextNode()) {
      const node = nbspWalker.currentNode;
      if (node.nodeValue.includes('\u00a0')) node.nodeValue = node.nodeValue.replace(/\u00a0/g, '\u202f');
    }

    // Exactly one h1 per page. WKND pages led by a carousel (the homepage) have only h2s,
    // and a slide title can't be the h1 because inactive slides are aria-hidden.
    // Use the page title; placed right before the carousel it is visually hidden by
    // styles.css, so the page looks unchanged. Runs after the alt pass so it isn't used as alt context.
    if (!element.querySelector('h1') && pageTitle) {
      const h1 = document.createElement('h1');
      h1.textContent = pageTitle;
      element.prepend(h1);
    }
  }
}
