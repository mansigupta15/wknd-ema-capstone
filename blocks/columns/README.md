# Columns

Block Collection columns: one row, one cell per column. Options are class-based variants of this
one block (`Columns (author)` in the document → `.columns.author`); their logic lives in the modules
next to `columns.js`, their styles in `columns.css`.

| Option | Used on | Authoring |
|---|---|---|
| (none) | — | one row, one cell per column; an image-only cell becomes the image column |
| `featured` | home, magazine | `columns-featured.js`: one row, image cell then text cell (optional eyebrow paragraph, heading, text, CTA link) |
| `author` | articles | `columns-author.js`: one row, avatar, then name / role, then one paragraph per social link ("Facebook") |
