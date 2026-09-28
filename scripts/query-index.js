/**
 * Reads the site's query index (/query-index.json, defined in the configuration service and
 * mirrored in helix-query.yaml). The index is fetched once per page and shared by every block
 * that queries it. Pages appear in it when they are published.
 */
let indexPromise;

async function loadIndex() {
  if (!indexPromise) {
    indexPromise = (async () => {
      const rows = [];
      const limit = 500;
      for (let offset = 0; ; offset += limit) {
        // eslint-disable-next-line no-await-in-loop
        const resp = await fetch(`/query-index.json?offset=${offset}&limit=${limit}`);
        if (!resp.ok) break;
        // eslint-disable-next-line no-await-in-loop
        const json = await resp.json();
        rows.push(...(json.data || []));
        if (offset + limit >= (json.total || 0)) break;
      }
      return rows;
    })().catch(() => []);
  }
  return indexPromise;
}

/**
 * Pages below a path, sorted and limited.
 * @param {Object} query
 * @param {string} query.source Path prefix, e.g. "/us/en/magazine/" (the listing page itself
 *   is not included)
 * @param {string} [query.sort] Index field to sort by, "-" prefix for descending
 *   (e.g. "title", "-date"); default: index order
 * @param {number} [query.limit] Maximum number of pages
 * @param {string[]} [query.exclude] Paths to leave out (e.g. the page's featured article)
 * @returns {Promise<Object[]>} Index rows (path, title, description, summary, image, ...)
 */
export default async function queryIndex({
  source, sort, limit, exclude = [],
}) {
  const prefix = source.endsWith('/') ? source : `${source}/`;
  const skip = new Set(exclude.map((p) => p.replace(/\/$/, '')));
  let rows = (await loadIndex())
    .filter((row) => row.path.startsWith(prefix) && !skip.has(row.path));
  if (sort) {
    const desc = sort.startsWith('-');
    const field = sort.replace(/^-/, '');
    rows = [...rows].sort((a, b) => {
      const order = String(a[field] || '').localeCompare(String(b[field] || ''), undefined, { numeric: true });
      return desc ? -order : order;
    });
  }
  return limit ? rows.slice(0, limit) : rows;
}
