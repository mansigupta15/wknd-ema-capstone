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
| `article, index, search` | search results (`/us/en/search`) | as `index` (Source `/us/en/`), plus a search form; shows the pages matching `?q=` |
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

## Search results (`article, index, search`)

The header's search field submits to `/us/en/search?q=…` (the nav's "Search results" link). The block
lists every page under Source from the index and shows those whose title, description, summary or
category contain every word of the query (case- and accent-insensitive), title matches first. New
searches update the results in place and the URL (`?q=`), so results can be shared and back / forward
work. A visible status line (`role="status"`) gives the count. The results page is excluded from the
index, so it never lists itself.
