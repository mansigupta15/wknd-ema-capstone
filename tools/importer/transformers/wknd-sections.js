/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND section breaks (+ Section Metadata for styled sections).
 *
 * Section selectors come from payload.template.sections (page-templates.json),
 * verified against migration-work/cleaned.html:
 *   section-1  .carousel.cmp-carousel--hero
 *   section-2  .teaser.cmp-teaser--featured
 *   section-3  .teaser.cmp-teaser--featured + .title.cmp-title--underline
 *   section-4  .cmp-layout-container--fixed .separator + .title.cmp-title--underline
 *   section-5  .teaser.cmp-teaser--hero + .cmp-layout-container--fixed
 *
 * Breaks are inserted in beforeTransform (before parsers replace section
 * elements). The source .separator rules are NOT converted to <hr>; the
 * cleanup transformer drops them in afterTransform so only these breaks remain.
 */
const SECTION_MARKER_ATTR = 'data-excat-section-id';

function querySection(root, selectors) {
  const list = Array.isArray(selectors) ? selectors : [selectors];
  for (const sel of list) {
    if (!sel) continue;
    const el = root.querySelector(sel);
    if (el) return el;
  }
  return null;
}

export default function transform(hookName, element, payload) {
  const sections = (payload && payload.template && payload.template.sections) || [];
  if (sections.length < 2) return;

  if (hookName === 'beforeTransform') {
    // Reverse order so earlier sections' elements are unaffected by insertions.
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (i === 0 && !section.style) continue;
      const sectionEl = querySection(element, section.selector);
      if (!sectionEl) continue;

      const hr = document.createElement('hr');
      if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
      sectionEl.before(hr);
    }
  }

  if (hookName === 'afterTransform') {
    for (let i = sections.length - 1; i >= 0; i -= 1) {
      const section = sections[i];
      if (!section.style) continue;

      const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
      const anchor = marker || querySection(element, section.selector);
      if (!anchor) continue;

      const metadataBlock = WebImporter.Blocks.createBlock(document, {
        name: 'Section Metadata',
        cells: { style: section.style },
      });
      anchor.after(metadataBlock);

      if (marker) {
        marker.removeAttribute(SECTION_MARKER_ATTR);
        if (i === 0) marker.remove();
      }
    }
  }
}
