/* eslint-disable */
var CustomImportScript = (() => {
  var __defProp = Object.defineProperty;
  var __defProps = Object.defineProperties;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropDescs = Object.getOwnPropertyDescriptors;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __getOwnPropSymbols = Object.getOwnPropertySymbols;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __propIsEnum = Object.prototype.propertyIsEnumerable;
  var __defNormalProp = (obj, key, value) => key in obj ? __defProp(obj, key, { enumerable: true, configurable: true, writable: true, value }) : obj[key] = value;
  var __spreadValues = (a, b) => {
    for (var prop in b || (b = {}))
      if (__hasOwnProp.call(b, prop))
        __defNormalProp(a, prop, b[prop]);
    if (__getOwnPropSymbols)
      for (var prop of __getOwnPropSymbols(b)) {
        if (__propIsEnum.call(b, prop))
          __defNormalProp(a, prop, b[prop]);
      }
    return a;
  };
  var __spreadProps = (a, b) => __defProps(a, __getOwnPropDescs(b));
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // tools/importer/import-article.js
  var import_article_exports = {};
  __export(import_article_exports, {
    default: () => import_article_default
  });

  // tools/importer/parsers/columns-author.js
  function resolveImage(container, document2) {
    if (!container) return null;
    const img = container.querySelector("img");
    const cmp = container.matches("[data-cmp-src]") ? container : container.querySelector("[data-cmp-src]");
    const isReal = (u) => u && !/^data:/i.test(u) && !/^about:/i.test(u);
    let src = img ? img.getAttribute("src") || "" : "";
    if (!isReal(src) && cmp) src = (cmp.getAttribute("data-cmp-src") || "").replace("{.width}", ".1600");
    if (!isReal(src)) return null;
    const out = document2.createElement("img");
    out.src = src;
    out.alt = img && img.getAttribute("alt") || "";
    return out;
  }
  function parse(element, { document: document2 }) {
    var _a, _b;
    const byline = element.querySelector(".cmp-byline") || element;
    const name = ((_a = byline.querySelector(".cmp-byline__name")) == null ? void 0 : _a.textContent.trim()) || "";
    const avatar = resolveImage(byline.querySelector(".cmp-byline__image"), document2);
    if (avatar && !avatar.alt && name) avatar.alt = name;
    const text = [];
    if (name) {
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      strong.textContent = name;
      p.append(strong);
      text.push(p);
    }
    const role = (_b = byline.querySelector(".cmp-byline__occupations")) == null ? void 0 : _b.textContent.trim();
    if (role) {
      const p = document2.createElement("p");
      p.textContent = role;
      text.push(p);
    }
    const social = [];
    const grid = element.parentElement || element;
    const buttons = [...grid.querySelectorAll(".button.cmp-button--icononly")].filter((b) => element.compareDocumentPosition(b) & Node.DOCUMENT_POSITION_FOLLOWING);
    buttons.forEach((next) => {
      const a = next.querySelector("a");
      const label = ((a == null ? void 0 : a.getAttribute("aria-label")) || (a == null ? void 0 : a.textContent) || "").trim();
      if (a && label) {
        const link = document2.createElement("a");
        link.href = a.getAttribute("href") || "#";
        link.textContent = label.charAt(0).toUpperCase() + label.slice(1);
        const p = document2.createElement("p");
        p.append(link);
        social.push(p);
      }
      next.remove();
    });
    const socialCell = social.length ? social : "";
    if (!avatar && !text.length && !social.length) {
      element.remove();
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, {
      name: "columns (author)",
      cells: [[avatar || "", text.length ? text : "", socialCell]]
    });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-related.js
  function parse2(element, { document: document2 }) {
    const cells = [];
    const facts = [...element.querySelectorAll(".cmp-contentfragment__element")];
    if (facts.length) {
      facts.forEach((fact) => {
        var _a, _b;
        const label = (_a = fact.querySelector(".cmp-contentfragment__element-title")) == null ? void 0 : _a.textContent.trim();
        const value = (_b = fact.querySelector(".cmp-contentfragment__element-value")) == null ? void 0 : _b.textContent.trim();
        if (!label || !value) return;
        const l = document2.createElement("p");
        l.textContent = label;
        const v = document2.createElement("p");
        v.textContent = value;
        cells.push([[l, v]]);
      });
      if (!cells.length) element.remove();
      else element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "cards (related, facts)", cells }));
      return;
    }
    element.querySelectorAll("li.cmp-list__item").forEach((item) => {
      var _a, _b;
      const link = item.querySelector("a.cmp-list__item-link, a");
      const title = ((_a = item.querySelector(".cmp-list__item-title")) == null ? void 0 : _a.textContent.trim()) || (link == null ? void 0 : link.textContent.trim()) || "";
      if (!title) return;
      const content = [];
      const p = document2.createElement("p");
      const strong = document2.createElement("strong");
      if (link == null ? void 0 : link.getAttribute("href")) {
        const a = document2.createElement("a");
        a.href = link.getAttribute("href");
        a.textContent = title;
        strong.append(a);
      } else {
        strong.textContent = title;
      }
      p.append(strong);
      content.push(p);
      const date = (_b = item.querySelector(".cmp-list__item-date")) == null ? void 0 : _b.textContent.trim();
      if (date) {
        const d = document2.createElement("p");
        d.textContent = date;
        content.push(d);
      }
      cells.push([content]);
    });
    if (!cells.length) {
      element.remove();
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "cards (related)", cells }));
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
      if (payload && typeof payload.html === "string" && /&nbsp;|\u00a0/.test(payload.html)) {
        const raw = new DOMParser().parseFromString(payload.html, "text/html");
        const withNbsp = /* @__PURE__ */ new Map();
        const rawWalker = raw.createTreeWalker(raw.body, NodeFilter.SHOW_TEXT);
        while (rawWalker.nextNode()) {
          const text = rawWalker.currentNode.nodeValue;
          if (text.includes("\xA0")) withNbsp.set(text.replace(/\u00a0/g, " "), text);
        }
        if (withNbsp.size) {
          const walker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
          while (walker.nextNode()) {
            const restored = withNbsp.get(walker.currentNode.nodeValue);
            if (restored) walker.currentNode.nodeValue = restored;
          }
        }
      }
      document.documentElement.setAttribute("data-featured-links", JSON.stringify(
        [...element.querySelectorAll(".cmp-teaser--featured a[href]")].map((a) => a.getAttribute("href"))
      ));
      WebImporter.DOMUtils.remove(element, [
        "header.experiencefragment",
        "footer.experiencefragment",
        ".cmp-experiencefragment--header",
        ".cmp-experiencefragment--footer",
        // Mobile nav toggle + drawer: <div id="toggleNav">, <div id="mobileNav" class="cmp-navigation--mobile">
        "#toggleNav",
        "#mobileNav",
        // Header widgets (inside header XF; listed defensively)
        ".sign-in-buttons",
        ".languagenavigation",
        ".search.cmp-search--header",
        // Adobe ID sync tracking iframe: <iframe id="destination_publishing_iframe_wkndsite_0">
        'iframe[id^="destination_publishing_iframe"]'
      ]);
      element.querySelectorAll(".button.cmp-button--primary a.cmp-button").forEach((a) => {
        const text = a.textContent.trim();
        if (!text) return;
        a.textContent = text;
        const strong = document.createElement("strong");
        const em = document.createElement("em");
        a.replaceWith(strong);
        em.append(a);
        strong.append(em);
      });
    }
    if (hookName === TransformHook.afterTransform) {
      WebImporter.DOMUtils.remove(element, [
        // Carousel controls (prev/next buttons, indicator list duplicating slide titles)
        ".cmp-carousel__actions",
        ".cmp-carousel__indicators",
        // Visual horizontal-rule separators: <div class="separator ..."><div class="cmp-separator"><hr class="cmp-separator__horizontal-rule">
        // They coincide with section breaks; section transformer inserts its own bare <hr>.
        // Removed in afterTransform so the section-4 selector (.separator + .title) still matches in beforeTransform.
        "div.separator",
        // Empty <meta> left inside .cmp-image wrappers
        ".cmp-image meta",
        // Safe non-content elements
        "iframe",
        "link",
        "noscript",
        "script",
        "style"
      ]);
      const pageTitle = (payload && payload.document || document).title.trim();
      const fileAlt = (src) => {
        const file = decodeURIComponent((src || "").split(/[?#]/)[0].split("/").pop() || "").replace(/\.[a-z0-9]+$/i, "");
        const words = file.split(/[-_\s]+/).filter((w) => w && !/^\d+$/.test(w));
        if (words.length < 2 || words.some((w) => !/^[a-z]{2,}$/i.test(w)) || /adobestock|^(img|dsc|pxl)$/i.test(words[0])) return "";
        const text = words.join(" ").toLowerCase();
        return text[0].toUpperCase() + text.slice(1);
      };
      const seen = /* @__PURE__ */ new Map();
      let context = "";
      element.querySelectorAll("h1, h2, h3, h4, h5, h6, img").forEach((node) => {
        if (node.tagName !== "IMG") {
          context = node.textContent.trim();
          return;
        }
        let alt = (node.getAttribute("alt") || "").replace(/\s+/g, " ").trim();
        let review = "";
        if (alt.length > 125) {
          const sentence = alt.match(/^.{20,125}?[.!?](?=\s|$)/);
          alt = sentence ? sentence[0] : `${alt.slice(0, 120).replace(/\s+\S*$/, "")}\u2026`;
        }
        if (!alt && context) {
          alt = context;
          review = "empty alt, used nearest heading";
        }
        if (!alt) {
          alt = fileAlt(node.getAttribute("src"));
          if (alt) review = "empty alt, used file name";
        }
        if (!alt && pageTitle) {
          alt = pageTitle;
          review = "empty alt, used page title";
        }
        const count = (seen.get(alt) || 0) + 1;
        seen.set(alt, count);
        if (alt && count > 1) {
          alt = `${alt} (image ${count})`;
          review = review || "duplicate alt";
        }
        node.setAttribute("alt", alt);
        if (review || !alt) node.setAttribute("data-alt-review", review || "no alt and no heading context");
      });
      element.querySelectorAll("a[href]").forEach((a) => {
        const href = a.getAttribute("href");
        const m = href.match(/^(?:https?:\/\/(?:www\.)?wknd\.site)?(\/[^?#]*?)\.html?([?#].*)?$/i);
        if (m) a.setAttribute("href", `${m[1]}${m[2] || ""}`);
      });
      const nbspWalker = document.createTreeWalker(element, NodeFilter.SHOW_TEXT);
      while (nbspWalker.nextNode()) {
        const node = nbspWalker.currentNode;
        if (node.nodeValue.includes("\xA0")) node.nodeValue = node.nodeValue.replace(/\u00a0/g, "\u202F");
      }
      if (!element.querySelector("h1") && pageTitle) {
        const h1 = document.createElement("h1");
        h1.textContent = pageTitle;
        element.prepend(h1);
      }
    }
  }

  // tools/importer/transformers/wknd-article.js
  function transform2(hookName, element, payload) {
    if (hookName !== "beforeTransform") return;
    element.querySelectorAll(".breadcrumb, .cmp-contentfragment__title").forEach((t) => t.remove());
    element.querySelectorAll(".title").forEach((title) => {
      var _a;
      const heading = title.querySelector("h4, h5, h6");
      const prevHeading = (_a = title.previousElementSibling) == null ? void 0 : _a.querySelector("h1");
      if (heading && prevHeading) {
        const p = document.createElement("p");
        p.textContent = heading.textContent.trim();
        heading.replaceWith(p);
      }
    });
    element.querySelectorAll(".cmp-text--quote .cmp-text").forEach((text) => {
      const quote = text.querySelector("blockquote");
      if (!quote) return;
      if (!quote.querySelector("p")) {
        const p = document.createElement("p");
        p.append(...quote.childNodes);
        quote.append(p);
      }
      [...text.querySelectorAll(":scope > p")].forEach((p) => quote.append(p));
    });
    element.querySelectorAll(".cmp-text blockquote").forEach((quote) => {
      if (quote.closest(".cmp-text--quote")) return;
      const p = document.createElement("p");
      p.textContent = quote.textContent.replace(/\s+/g, " ").trim();
      quote.replaceChildren(p);
    });
    element.querySelectorAll(".cmp-image__title").forEach((caption) => {
      const text = caption.textContent.trim();
      const image = caption.closest(".image, .cmp-image");
      caption.remove();
      if (!text || !image || image.closest("aside")) return;
      const p = document.createElement("p");
      const em = document.createElement("em");
      em.textContent = text;
      p.append(em);
      image.after(p);
    });
    const body = element.querySelector("main main");
    const bodyH2 = body ? [...body.querySelectorAll("h2")].filter((h) => !h.closest("aside, .byline")) : [];
    if (bodyH2.length && bodyH2.every((h) => !h.closest(".title"))) {
      const meta = WebImporter.Blocks.createBlock(document, { name: "Section Metadata", cells: { style: "plain-headings" } });
      const aside2 = body.querySelector("aside");
      if (aside2) aside2.before(meta);
      else body.append(meta);
    }
    element.querySelectorAll(".cmp-download").forEach((download) => {
      const action = download.querySelector(".cmp-download__action, .cmp-download__title-link");
      if (!action || !action.getAttribute("href")) return;
      const out = [];
      const title = download.querySelector(".cmp-download__title");
      if (title && title.textContent.trim()) {
        const h3 = document.createElement("h3");
        h3.textContent = title.textContent.trim();
        out.push(h3);
      }
      out.push(...download.querySelectorAll(".cmp-download__description p"));
      const props = [...download.querySelectorAll(".cmp-download__property-content")].map((d) => d.textContent.trim()).filter(Boolean);
      if (props.length) {
        const p2 = document.createElement("p");
        p2.textContent = props.join(" \xB7 ");
        out.push(p2);
      }
      const a = document.createElement("a");
      a.href = new URL(action.getAttribute("href"), "https://wknd.site").href;
      a.textContent = action.textContent.trim() || "Download";
      const strong = document.createElement("strong");
      strong.append(a);
      const p = document.createElement("p");
      p.append(strong);
      out.push(p);
      download.replaceWith(...out);
    });
    const aside = element.querySelector("aside.cmp-layoutcontainer--sidebar");
    if (aside && !aside.querySelector(".cmp-separator--hidden")) aside.dataset.sectionStyle = "compact";
    element.querySelectorAll("aside .title h1, aside .title h2, aside .title h3, aside .title h4, aside .title h5, aside .title h6").forEach((h) => {
      if (h.tagName === "H2") return;
      const h2 = document.createElement("h2");
      h2.textContent = h.textContent.trim();
      h.replaceWith(h2);
    });
  }

  // tools/importer/transformers/wknd-listing-card.js
  var LISTINGS = {
    "/us/en/magazine/": "/us/en/magazine.html",
    "/us/en/adventures/": "/us/en/adventures.html"
  };
  function fetchListing(path) {
    const cache = window.wkndListingCache = window.wkndListingCache || {};
    if (!(path in cache)) {
      cache[path] = null;
      try {
        const xhr = new XMLHttpRequest();
        xhr.open("GET", new URL(path, "https://wknd.site").href, false);
        xhr.send();
        if (xhr.status === 200) cache[path] = new DOMParser().parseFromString(xhr.responseText, "text/html");
      } catch (e) {
        console.warn("listing lookup failed", path, e);
      }
    }
    return cache[path];
  }
  function transform3(hookName, element, payload) {
    var _a, _b, _c, _d, _e;
    if (hookName !== "beforeTransform") return;
    let url;
    try {
      url = new URL(payload && (((_a = payload.params) == null ? void 0 : _a.originalURL) || payload.url) || window.location.href);
    } catch (e) {
      return;
    }
    const pagePath = url.pathname;
    const prefix = Object.keys(LISTINGS).find((p) => pagePath.startsWith(p));
    const meta = {};
    const cf = document.querySelector(".cmp-contentfragment[data-cmp-data-layer]");
    if (cf && prefix === "/us/en/magazine/") {
      try {
        const layer = Object.values(JSON.parse(cf.getAttribute("data-cmp-data-layer")))[0];
        if (layer && layer["repo:modifyDate"]) meta["Publication Date"] = layer["repo:modifyDate"];
      } catch (e) {
      }
    }
    const listing = prefix && fetchListing(LISTINGS[prefix]);
    if (listing) {
      const matches = (a) => a && new URL(a.getAttribute("href"), url).pathname === pagePath;
      const items = [...listing.querySelectorAll(".cmp-image-list__item")].filter((i) => matches(i.querySelector("a[href]")));
      const item = items[0];
      if (item) {
        const img = item.querySelector("img");
        const src = img && (img.getAttribute("src") || img.getAttribute("data-src"));
        if (src && !src.startsWith("data:")) meta.Image = { src: new URL(src, "https://wknd.site").href, alt: ((_b = item.querySelector(".cmp-image-list__item-title")) == null ? void 0 : _b.textContent.trim()) || "" };
        const summary = (_c = item.querySelector(".cmp-image-list__item-description")) == null ? void 0 : _c.textContent.trim();
        const description = (_e = (_d = document.querySelector('meta[name="description"]')) == null ? void 0 : _d.getAttribute("content")) == null ? void 0 : _e.trim();
        if (summary && summary !== description) meta.Summary = summary;
      }
      const tabs = [...listing.querySelectorAll(".cmp-tabs__tab")].map((t) => t.textContent.trim());
      const panels = [...listing.querySelectorAll(".cmp-tabs__tabpanel")];
      if (prefix === "/us/en/adventures/" && panels.length > 1) {
        const cats = panels.slice(1).map((panel, i) => [...panel.querySelectorAll("a[href]")].some(matches) ? tabs[i + 1] : null).filter(Boolean);
        meta.Category = [...new Set(cats)].join(", ");
      }
    }
    document.documentElement.setAttribute("data-import-meta", JSON.stringify(meta));
  }

  // tools/importer/transformers/wknd-sections.js
  var SECTION_MARKER_ATTR = "data-excat-section-id";
  var EXTRA_STYLE_ATTR = "data-excat-section-extra-style";
  function querySection(root, selectors) {
    const list = Array.isArray(selectors) ? selectors : [selectors];
    for (const sel of list) {
      if (!sel) continue;
      const el = root.querySelector(sel);
      if (el) return el;
    }
    return null;
  }
  function transform4(hookName, element, payload) {
    const sections = payload && payload.template && payload.template.sections || [];
    if (sections.length < 2) return;
    if (hookName === "beforeTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (i === 0 && !section.style) continue;
        const sectionEl = querySection(element, section.selector);
        if (!sectionEl) continue;
        const hr = document.createElement("hr");
        if (section.style) hr.setAttribute(SECTION_MARKER_ATTR, section.id);
        if (section.style && sectionEl.dataset.sectionStyle) hr.setAttribute(EXTRA_STYLE_ATTR, sectionEl.dataset.sectionStyle);
        sectionEl.before(hr);
      }
    }
    if (hookName === "afterTransform") {
      for (let i = sections.length - 1; i >= 0; i -= 1) {
        const section = sections[i];
        if (!section.style) continue;
        const marker = element.querySelector(`[${SECTION_MARKER_ATTR}="${section.id}"]`);
        const anchor = marker || querySection(element, section.selector);
        if (!anchor) continue;
        const extra = marker && marker.getAttribute(EXTRA_STYLE_ATTR);
        const metadataBlock = WebImporter.Blocks.createBlock(document, {
          name: "Section Metadata",
          cells: { style: extra ? `${section.style}, ${extra}` : section.style }
        });
        anchor.after(metadataBlock);
        if (marker) {
          marker.removeAttribute(SECTION_MARKER_ATTR);
          marker.removeAttribute(EXTRA_STYLE_ATTR);
          if (i === 0) marker.remove();
        }
      }
    }
  }

  // tools/importer/import-article.js
  var parsers = {
    "columns-author": parse,
    "cards-related": parse2
  };
  var PAGE_TEMPLATE = {
    "name": "article",
    "description": "WKND magazine article: hero image, title + byline + content-fragment body with quote, author card, up-next sidebar",
    "urls": [
      "https://wknd.site/us/en/magazine/western-australia.html"
    ],
    "metadata": {
      "Template": "article"
    },
    "blocks": [
      {
        "name": "columns-author",
        "instances": [
          ".byline"
        ]
      },
      {
        "name": "cards-related",
        "instances": [
          ".cmp-list--upnext"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "hero",
        "selector": [
          "main > .cmp-container > .aem-Grid > .image"
        ],
        "style": null,
        "blocks": [],
        "defaultContent": [
          "main > .cmp-container > .aem-Grid > .image"
        ]
      },
      {
        "id": "section-2",
        "name": "article-body",
        "selector": [
          "main main"
        ],
        "style": null,
        "blocks": [
          "columns-author"
        ],
        "defaultContent": [
          "main main .title",
          "main main .contentfragment"
        ]
      },
      {
        "id": "section-3",
        "name": "sidebar",
        "selector": [
          "aside.cmp-layoutcontainer--sidebar"
        ],
        "style": "sidebar",
        "blocks": [
          "cards-related"
        ],
        "defaultContent": [
          "aside .title.cmp-title--black"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    transform3,
    transform2,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform4] : []
  ];
  function executeTransformers(hookName, element, payload) {
    const enhancedPayload = __spreadProps(__spreadValues({}, payload), { template: PAGE_TEMPLATE });
    transformers.forEach((transformerFn) => {
      try {
        transformerFn.call(null, hookName, element, enhancedPayload);
      } catch (e) {
        console.error(`Transformer failed at ${hookName}:`, e);
      }
    });
  }
  function findBlocksOnPage(document2, template) {
    const pageBlocks = [];
    template.blocks.forEach((blockDef) => {
      blockDef.instances.forEach((selector) => {
        const elements = document2.querySelectorAll(selector);
        if (elements.length === 0) {
          console.warn(`Block "${blockDef.name}" selector not found: ${selector}`);
        }
        elements.forEach((element) => {
          pageBlocks.push({
            name: blockDef.name,
            selector,
            element,
            section: blockDef.section || null
          });
        });
      });
    });
    console.log(`Found ${pageBlocks.length} block instances on page`);
    return pageBlocks;
  }
  var import_article_default = {
    transform: (payload) => {
      const { document: document2, url, params } = payload;
      const main = document2.body;
      executeTransformers("beforeTransform", main, payload);
      const pageBlocks = findBlocksOnPage(document2, PAGE_TEMPLATE);
      pageBlocks.forEach((block) => {
        if (!block.element.parentNode) return;
        const parser = parsers[block.name];
        if (parser) {
          try {
            parser(block.element, { document: document2, url, params });
          } catch (e) {
            console.error(`Failed to parse ${block.name} (${block.selector}):`, e);
          }
        } else {
          console.warn(`No parser found for block: ${block.name}`);
        }
      });
      executeTransformers("afterTransform", main, payload);
      const hr = document2.createElement("hr");
      main.appendChild(hr);
      const meta = WebImporter.Blocks.getMetadata(document2) || {};
      Object.assign(meta, PAGE_TEMPLATE.metadata || {});
      const card = JSON.parse(document2.documentElement.getAttribute("data-import-meta") || "{}");
      if (card.Image) {
        const img = document2.createElement("img");
        img.src = card.Image.src;
        img.alt = card.Image.alt;
        card.Image = img;
      }
      Object.assign(meta, card);
      main.append(WebImporter.Blocks.getMetadataBlock(document2, meta));
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      const altReview = [...main.querySelectorAll("img[data-alt-review]")].map((img) => {
        const entry = `${img.getAttribute("alt") || "(empty)"} \u2014 ${img.getAttribute("data-alt-review")}`;
        img.removeAttribute("data-alt-review");
        return entry;
      });
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name),
          altReview
        }
      }];
    }
  };
  return __toCommonJS(import_article_exports);
})();
