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
 * - quotes inside plain text -> one-paragraph blockquotes (the quote component, with its
 *   attribution/definition paragraphs, is the boxed pull quote)
 * - image captions -> an italic paragraph after the image
 * - body of rich-text h2s -> section style "plain-headings" (no underline, text width)
 * - download component -> default content (label h3, description, file details, button link)
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

  // quotations inside ordinary text (arctic surfing) are plain on WKND; only the quote
  // component is the boxed pull quote (quote + attribution/definition paragraphs, see above).
  // Keep them one-paragraph blockquotes, which styles.css sets in the running text.
  element.querySelectorAll('.cmp-text blockquote').forEach((quote) => {
    if (quote.closest('.cmp-text--quote')) return;
    const p = document.createElement('p');
    p.textContent = quote.textContent.replace(/\s+/g, ' ').trim();
    quote.replaceChildren(p);
  });

  // image captions (the image component's title, shown under the image on WKND) -> an italic
  // paragraph right after the image (styled as the caption in styles.css)
  element.querySelectorAll('.cmp-image__title').forEach((caption) => {
    const text = caption.textContent.trim();
    const image = caption.closest('.image, .cmp-image');
    caption.remove();
    if (!text || !image || image.closest('aside')) return;
    const p = document.createElement('p');
    const em = document.createElement('em');
    em.textContent = text;
    p.append(em);
    image.after(p);
  });

  // body headings that are part of the running text (san diego surf) have no underline and
  // run text-wide on WKND, unlike title components (western australia): mark the body
  // section "plain-headings" when all of its h2s are rich text
  const body = element.querySelector('main main');
  // (the byline name is an h2 on WKND too; the columns-author parser turns it into text)
  const bodyH2 = body ? [...body.querySelectorAll('h2')].filter((h) => !h.closest('aside, .byline')) : [];
  if (bodyH2.length && bodyH2.every((h) => !h.closest('.title'))) {
    const meta = WebImporter.Blocks.createBlock(document, { name: 'Section Metadata', cells: { style: 'plain-headings' } });
    const aside = body.querySelector('aside');
    if (aside) aside.before(meta); else body.append(meta);
  }

  // download (sidebar PDF, e.g. LA skateparks) -> default content: a label heading, description,
  // file details and a bold link (the dark primary button). The label is plain text so the
  // PDF isn't linked twice. upload-to-da.mjs localizes the PDF.
  element.querySelectorAll('.cmp-download').forEach((download) => {
    const action = download.querySelector('.cmp-download__action, .cmp-download__title-link');
    if (!action || !action.getAttribute('href')) return;
    const out = [];
    const title = download.querySelector('.cmp-download__title');
    if (title && title.textContent.trim()) {
      const h3 = document.createElement('h3');
      h3.textContent = title.textContent.trim();
      out.push(h3);
    }
    out.push(...download.querySelectorAll('.cmp-download__description p'));
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

  // most WKND sidebars have a hidden 36px spacer under "Share this story"; those without it
  // (arctic surfing, ski touring) get the extra section style "compact"
  const aside = element.querySelector('aside.cmp-layoutcontainer--sidebar');
  if (aside && !aside.querySelector('.cmp-separator--hidden')) aside.dataset.sectionStyle = 'compact';

  element.querySelectorAll('aside .title h1, aside .title h2, aside .title h3, aside .title h4, aside .title h5, aside .title h6').forEach((h) => {
    if (h.tagName === 'H2') return;
    const h2 = document.createElement('h2');
    h2.textContent = h.textContent.trim();
    h.replaceWith(h2);
  });
}
