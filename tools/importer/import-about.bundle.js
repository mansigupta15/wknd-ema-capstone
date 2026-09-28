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

  // tools/importer/import-about.js
  var import_about_exports = {};
  __export(import_about_exports, {
    default: () => import_about_default
  });

  // tools/importer/parsers/cards.js
  function resolveImage(container, document2) {
    const img = container.querySelector("img");
    const cmp = container.matches("[data-cmp-src]") ? container : container.querySelector("[data-cmp-src]");
    const isReal = (u) => u && !/^data:/i.test(u) && !/^about:/i.test(u);
    let src = img ? img.getAttribute("src") || "" : "";
    if (!isReal(src) && img && img.getAttribute("srcset")) {
      const best = img.getAttribute("srcset").split(",").map((s) => s.trim().split(/\s+/)).filter(([u]) => isReal(u)).map(([u, w]) => ({ u, w: parseInt(w, 10) || 0 })).sort((a, b) => b.w - a.w)[0];
      if (best) src = best.u;
    }
    if (!isReal(src) && cmp && cmp.getAttribute("data-cmp-src")) src = cmp.getAttribute("data-cmp-src").replace("{.width}", ".1600");
    if (!isReal(src)) return null;
    const out = document2.createElement("img");
    out.src = src;
    out.alt = (img && img.getAttribute("alt") || "").trim();
    return out;
  }
  function contributorRow(fragment, document2) {
    var _a, _b;
    const titles = [...fragment.querySelectorAll(".cmp-title__text")];
    const name = (_a = titles[0]) == null ? void 0 : _a.textContent.trim();
    if (!name) return null;
    const img = resolveImage(fragment.querySelector(".cmp-image") || fragment, document2);
    if (img && !img.alt) img.alt = name;
    const content = [];
    const h3 = document2.createElement("h3");
    h3.textContent = name;
    content.push(h3);
    const role = (_b = titles[1]) == null ? void 0 : _b.textContent.trim();
    if (role) {
      const p = document2.createElement("p");
      p.textContent = role;
      content.push(p);
    }
    fragment.querySelectorAll("a.cmp-button").forEach((button) => {
      const label = button.textContent.trim() || button.getAttribute("aria-label") || "";
      if (!label) return;
      const a = document2.createElement("a");
      a.href = button.getAttribute("href") || "#";
      a.textContent = label;
      const p = document2.createElement("p");
      p.append(a);
      content.push(p);
    });
    return [img || "", content];
  }
  function parse(element, { document: document2 }) {
    const fragments = [element];
    let next = element.nextElementSibling;
    while (next && next.matches(".cmp-experience-fragment--contributor")) {
      fragments.push(next);
      next = next.nextElementSibling;
    }
    const cells = fragments.map((f) => contributorRow(f, document2)).filter(Boolean);
    fragments.slice(1).forEach((f) => f.remove());
    if (!cells.length) {
      element.remove();
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "cards (contributors)", cells }));
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
  function transform2(hookName, element, payload) {
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

  // tools/importer/import-about.js
  var parsers = {
    cards: parse
  };
  var PAGE_TEMPLATE = {
    "name": "about",
    "description": 'WKND About Us: title, "Our Contributors" and "WKND Guides" groups of contributor cards (photo, name, role, social links)',
    "urls": [
      "https://wknd.site/us/en/about-us.html"
    ],
    "metadata": {
      "Template": "about"
    },
    "blocks": [
      {
        "name": "cards",
        "instances": [
          ".cmp-experience-fragment--contributor"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "about",
        "selector": [
          "main .cmp-layout-container--fixed"
        ],
        "style": null,
        "blocks": [
          "cards"
        ],
        "defaultContent": [
          "main .title",
          "main .text"
        ]
      }
    ]
  };
  var transformers = [
    transform,
    ...PAGE_TEMPLATE.sections && PAGE_TEMPLATE.sections.length > 1 ? [transform2] : []
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
  var import_about_default = {
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
  return __toCommonJS(import_about_exports);
})();
