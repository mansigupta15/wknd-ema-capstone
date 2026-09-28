import decorateFeatured from './columns-featured.js';
import decorateAuthor from './columns-author.js';

/**
 * Columns (Block Collection): one row, one cell per column.
 * Options (variants of this one block, logic in the modules next to this file):
 * - "featured" (columns-featured.js): image + text teaser (featured article)
 * - "author" (columns-author.js): author card, [avatar] | [name, role] | [social links]
 */
export default function decorate(block) {
  if (block.classList.contains('featured')) {
    decorateFeatured(block);
    return;
  }
  if (block.classList.contains('author')) {
    decorateAuthor(block);
    return;
  }

  const cols = [...block.firstElementChild.children];
  block.classList.add(`columns-${cols.length}-cols`);

  // setup image columns
  [...block.children].forEach((row) => {
    [...row.children].forEach((col) => {
      const pic = col.querySelector('picture');
      if (pic) {
        const picWrapper = pic.closest('div');
        if (picWrapper && picWrapper.children.length === 1) {
          // picture is only content in column
          picWrapper.classList.add('columns-img-col');
        }
      }
    });
  });
}
