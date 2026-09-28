# Hero

Block Collection hero: a background image with a heading and text. Options are class-based
variants of this one block (`Hero (teaser, centered)` in the document → `.hero.teaser.centered`);
their logic lives in the modules next to `hero.js`, their styles in `hero.css`.

| Option | Used on | Authoring |
|---|---|---|
| (none) | — | the first picture becomes the background (optimized, LCP hints kept), the rest the content |
| `teaser` | home | `hero-teaser.js`: row 1 image, row 2 heading / text / CTA link; full-bleed image with an overlapping white box, image aligned to the bottom when cropped |
| `teaser, centered` | adventures listing | as `teaser`, image centred when cropped, text box as wide as its text below 1165px |
