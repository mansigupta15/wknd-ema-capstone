# Cards

Block Collection cards: one row per card, `[image] | [text]`. Options are class-based variants of
this one block (`Cards (article, locked)` in the document → `.cards.article.locked`); their logic
lives in the modules next to `cards.js`, their styles in `cards.css`.

| Option | Used on | Authoring |
|---|---|---|
| (none) | — | one row per card: image, then title / description / links |
| `contributors` | About Us | image, then name (heading), role, one paragraph per social link ("Facebook") |
| `article` | home, magazine, adventures | `cards-article.js`: one row per card, linked image, then linked title (bold) and description |
| `article, locked` | magazine (members only) | as `article`, plus a last non-link label ("Read More") |
| `article, filter` | — | as `article`, plus a third cell with the card's categories ("Cycling, Travel") |
| `article, index` | home rails, magazine grid | no card rows: a key / value table rendered from `/query-index.json` |
| `article, index, filter` | adventures listing | as `index`, with category buttons from each page's `category` |
| `related` | article sidebar | `cards-related.js`: cards without images, one row per card, linked title then date |
| `related, facts` | adventure sidebar | one row per fact: label, then value |

## Index-driven cards (`article, index`)

| Key | Value |
|---|---|
| Source | path prefix of the pages to list, e.g. `/us/en/magazine/` (the listing page itself is not included) |
| Sort | index field, `-` for descending: `title`, `-title`, `-date` |
| Limit | maximum number of cards (optional) |
| Exclude | comma-separated paths to leave out, e.g. the page's featured article (optional) |

Each card shows the page's index `image`, `title` and `summary` (else `description`). Publishing a
page under the source path adds its card; nothing is authored on the listing. The index is defined
in the configuration service (mirrored in `helix-query.yaml`); page metadata `Image`, `Summary`,
`Category` and `Publication Date` feed it.
