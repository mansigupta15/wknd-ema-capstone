/* eslint-disable */
/* global WebImporter */

// PARSER IMPORTS
import carouselHeroParser from './parsers/carousel-hero.js';
import cardsRelatedParser from './parsers/cards-related.js';
import tabsParser from './parsers/tabs.js';

// TRANSFORMER IMPORTS
import wkndCleanupTransformer from './transformers/wknd-cleanup.js';
import wkndAdventureTransformer from './transformers/wknd-adventure.js';
import wkndSectionsTransformer from './transformers/wknd-sections.js';

// PARSER REGISTRY
const parsers = {
  'carousel-hero': carouselHeroParser,
  'cards-related': cardsRelatedParser,
  tabs: tabsParser,
};

// PAGE TEMPLATE CONFIGURATION - Embedded from page-templates.json
const PAGE_TEMPLATE = {
  "name": "adventure",
  "description": "WKND adventure detail: image slider, title, facts sidebar (activity, length, price...), Overview / Itinerary / What to Bring tabs",
  "urls": [
    "https://wknd.site/us/en/adventures/climbing-new-zealand.html",
    "https://wknd.site/us/en/adventures/downhill-skiing-wyoming.html",
    "https://wknd.site/us/en/adventures/tahoe-skiing.html",
    "https://wknd.site/us/en/adventures/west-coast-cycling.html",
    "https://wknd.site/us/en/adventures/whistler-mountain-biking.html",
    "https://wknd.site/us/en/adventures/yosemite-backpacking.html"
  ],
  "metadata": {
    "Template": "adventure"
  },
  "blocks": [
    {
      "name": "carousel-hero",
      "instances": [
        ".carousel.cmp-carousel--mini"
      ]
    },
    {
      "name": "cards-related",
      "instances": [
        ".contentfragment.cmp-contentfragment--elements"
      ]
    },
    {
      "name": "tabs",
      "instances": [
        ".tabs.panelcontainer"
      ]
    }
  ],
  "sections": [
    {
      "id": "section-1",
      "name": "slider",
      "selector": [
        ".carousel.cmp-carousel--mini"
      ],
      "style": null,
      "blocks": [
        "carousel-hero"
      ],
      "defaultContent": []
    },
    {
      "id": "section-2",
      "name": "title",
      "selector": [
        ".cmp-layout-container--fixed .title.cmp-title--underline"
      ],
      "style": null,
      "blocks": [],
      "defaultContent": [
        ".title.cmp-title--underline"
      ]
    },
    {
      "id": "section-3",
      "name": "sidebar",
      "selector": [
        "main[class*=\"aem-GridColumn--default--3\"]"
      ],
      "style": "sidebar",
      "blocks": [
        "cards-related"
      ],
      "defaultContent": [
        "main[class*=\"aem-GridColumn--default--3\"] .title"
      ]
    },
    {
      "id": "section-4",
      "name": "details",
      "selector": [
        ".tabs.panelcontainer"
      ],
      "style": null,
      "blocks": [
        "tabs"
      ],
      "defaultContent": []
    }
  ]
};

// TRANSFORMER REGISTRY - cleanup must run before sections
const transformers = [
  wkndCleanupTransformer,
  wkndAdventureTransformer,
  ...(PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [wkndSectionsTransformer] : []),
];

/**
 * Execute all page transformers for a specific hook
 * @param {string} hookName - 'beforeTransform' or 'afterTransform'
 * @param {Element} element - The DOM element to transform
 * @param {Object} payload - { document, url, html, params }
 */
function executeTransformers(hookName, element, payload) {
  const enhancedPayload = { ...payload, template: PAGE_TEMPLATE };
  transformers.forEach((transformerFn) => {
    try {
      transformerFn.call(null, hookName, element, enhancedPayload);
    } catch (e) {
      console.error(`Transformer failed at ${hookName}:`, e);
    }
  });
}

/**
 * Find all blocks on the page based on the embedded template configuration
 * @param {Document} document - The DOM document
 * @param {Object} template - The embedded PAGE_TEMPLATE object
 * @returns {Array} Block instances found on the page
 */
function findBlocksOnPage(document, template) {
  const pageBlocks = [];
  template.blocks.forEach((blockDef) => {
    blockDef.instances.forEach((selector) => {
      const elements = document.querySelectorAll(selector);
      if (elements.length === 0) {
        console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
      }
      elements.forEach((element) => {
        pageBlocks.push({
          name: blockDef.name,
          selector,
          element,
          section: blockDef.section || null,
        });
      });
    });
  });
  console.log(`Found ${pageBlocks.length} block instances on page`);
  return pageBlocks;
}

export default {
  transform: (payload) => {
    const { document, url, params } = payload;
    const main = document.body;

    // 1. Initial cleanup + section breaks
    executeTransformers('beforeTransform', main, payload);

    // 2. Find blocks
    const pageBlocks = findBlocksOnPage(document, PAGE_TEMPLATE);

    // 3. Parse blocks (skip elements already replaced by an earlier parser)
    pageBlocks.forEach((block) => {
      if (!block.element.parentNode) return;
      const parser = parsers[block.name];
      if (parser) {
        try {
          parser(block.element, { document, url, params });
        } catch (e) {
          console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
        }
      } else {
        console.warn(`No parser found for block: ${block.name}`);
      }
    });

    // 4. Final cleanup
    executeTransformers('afterTransform', main, payload);

    // 5. Built-in rules
    const hr = document.createElement('hr');
    main.appendChild(hr);
    // page metadata from the source head, plus template-level fields (e.g. Template: article)
    const meta = WebImporter.Blocks.getMetadata(document) || {};
    Object.assign(meta, PAGE_TEMPLATE.metadata || {});
    main.append(WebImporter.Blocks.getMetadataBlock(document, meta));
    WebImporter.rules.transformBackgroundImages(main, document);
    WebImporter.rules.adjustImageUrls(main, url, params.originalURL);

    // 6. Sanitized path (root URL maps to /index)
    const rawPath = new URL(params.originalURL).pathname
      .replace(/\/$/, '')
      .replace(/\.html?$/, '');
    const path = WebImporter.FileUtils.sanitizePath(rawPath === '' ? '/index' : rawPath);

    // 7. Images whose alt came from a fallback (see wknd-cleanup) -> report for editorial review
    const altReview = [...main.querySelectorAll('img[data-alt-review]')].map((img) => {
      const entry = `${img.getAttribute('alt') || '(empty)'} — ${img.getAttribute('data-alt-review')}`;
      img.removeAttribute('data-alt-review');
      return entry;
    });

    return [{
      element: main,
      path,
      report: {
        title: document.title,
        template: PAGE_TEMPLATE.name,
        blocks: pageBlocks.map((b) => b.name),
        altReview,
      },
    }];
  },
};
