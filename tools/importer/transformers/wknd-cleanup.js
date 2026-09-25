/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND site-wide cleanup (AEM Core Components).
 * All selectors verified in migration-work/cleaned.html.
 */
const TransformHook = { beforeTransform: 'beforeTransform', afterTransform: 'afterTransform' };

export default function transform(hookName, element, payload) {
  if (hookName === TransformHook.beforeTransform) {
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
  }
}
