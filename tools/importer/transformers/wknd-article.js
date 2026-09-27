/* eslint-disable */
/* global WebImporter */

/**
 * Transformer: WKND article pages (magazine detail, AEM content fragment + byline + sidebar).
 * Runs after wknd-cleanup and before wknd-sections (beforeTransform), so the section
 * selectors in the article template still match.
 * - drops the source breadcrumb (generated at runtime from the URL) and the content fragment's hidden duplicate title (the visible title is the page h1)
 * - byline title ("By Sofia Sjöberg", an h4) -> paragraph
 * - quote: the definition paragraph after the <blockquote> ("noun") moves inside it
 * - sidebar heading ("Share this story", an h5) -> h2, for a valid heading order
 * - download component -> default content (description, file details, button link)
 */
export default function transform(hookName, element, payload) {
  if (hookName !== 'beforeTransform') return;

  // the breadcrumb is generated at runtime from the URL (blocks/breadcrumb), not authored
  element.querySelectorAll('.breadcrumb, .cmp-contentfragment__title').forEach((t) => t.remove());

  // byline: a title component holding h4-h6 right after the h1 title component
  element.querySelectorAll('.title').forEach((title) => {
    const heading = title.querySelector('h4, h5, h6');
    const prevHeading = title.previousElementSibling?.querySelector('h1');
    if (heading && prevHeading) {
      const p = document.createElement('p');
      p.textContent = heading.textContent.trim();
      heading.replaceWith(p);
    }
  });

  element.querySelectorAll('.cmp-text--quote .cmp-text').forEach((text) => {
    const quote = text.querySelector('blockquote');
    if (!quote) return;
    // wrap the quote's inline content in a paragraph, then append the trailing paragraphs
    if (!quote.querySelector('p')) {
      const p = document.createElement('p');
      p.append(...quote.childNodes);
      quote.append(p);
    }
    [...text.querySelectorAll(':scope > p')].forEach((p) => quote.append(p));
  });

  // download (sidebar PDF, e.g. LA skateparks) -> default content: description, file details
  // and a bold link (the dark primary button). The title link repeats the button and is
  // dropped, which also keeps the sidebar heading order. upload-to-da.mjs localizes the PDF.
  element.querySelectorAll('.cmp-download').forEach((download) => {
    const action = download.querySelector('.cmp-download__action, .cmp-download__title-link');
    if (!action || !action.getAttribute('href')) return;
    const out = [...download.querySelectorAll('.cmp-download__description p')];
    const props = [...download.querySelectorAll('.cmp-download__property-content')]
      .map((d) => d.textContent.trim()).filter(Boolean);
    if (props.length) {
      const p = document.createElement('p');
      p.textContent = props.join(' · ');
      out.push(p);
    }
    const a = document.createElement('a');
    a.href = new URL(action.getAttribute('href'), 'https://wknd.site').href;
    a.textContent = action.textContent.trim() || 'Download';
    const strong = document.createElement('strong');
    strong.append(a);
    const p = document.createElement('p');
    p.append(strong);
    out.push(p);
    download.replaceWith(...out);
  });

  element.querySelectorAll('aside .title h1, aside .title h2, aside .title h3, aside .title h4, aside .title h5, aside .title h6').forEach((h) => {
    if (h.tagName === 'H2') return;
    const h2 = document.createElement('h2');
    h2.textContent = h.textContent.trim();
    h.replaceWith(h2);
  });
}
