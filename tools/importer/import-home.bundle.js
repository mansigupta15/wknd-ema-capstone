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

  // tools/importer/import-home.js
  var import_home_exports = {};
  __export(import_home_exports, {
    default: () => import_home_default
  });

  // tools/importer/parsers/carousel-hero.js
  function resolveImage(container, document2) {
    var _a;
    if (!container) return null;
    const img = container.querySelector("img");
    const cmp = container.matches("[data-cmp-src]") ? container : container.querySelector("[data-cmp-src]");
    const isReal = (u) => u && !/^data:/i.test(u) && !/^about:/i.test(u);
    let src = img ? img.getAttribute("src") || "" : "";
    if (!isReal(src) && img) {
      const lazy = img.getAttribute("data-src") || img.getAttribute("data-lazy-src");
      if (isReal(lazy)) src = lazy;
    }
    if (!isReal(src) && img && img.getAttribute("srcset")) {
      const candidates = img.getAttribute("srcset").split(",").map((s) => s.trim().split(/\s+/)).filter(([u]) => isReal(u)).map(([u, w]) => ({ u, w: parseInt(w, 10) || 0 })).sort((a, b) => b.w - a.w);
      if (candidates.length) src = candidates[0].u;
    }
    if (!isReal(src) && cmp) {
      const tpl = cmp.getAttribute("data-cmp-src") || "";
      if (tpl) src = tpl.replace("{.width}", ".1600");
    }
    if (!isReal(src)) return null;
    const alt = img && (img.getAttribute("alt") || img.getAttribute("title")) || ((_a = cmp == null ? void 0 : cmp.querySelector('meta[itemprop="caption"]')) == null ? void 0 : _a.getAttribute("content")) || "";
    const out = document2.createElement("img");
    out.src = src;
    out.alt = alt.trim();
    return out;
  }
  function descriptionParagraphs(desc, document2) {
    if (!desc) return [];
    const ps = [...desc.querySelectorAll(":scope > p")].filter((p2) => p2.textContent.trim());
    if (ps.length) return ps;
    if (!desc.textContent.trim()) return [];
    const p = document2.createElement("p");
    p.innerHTML = desc.innerHTML.trim();
    return [p];
  }
  function parse(element, { document: document2 }) {
    let items = [...element.querySelectorAll(".cmp-carousel__item")];
    if (!items.length) items = [...element.querySelectorAll(".cmp-teaser")];
    const mini = element.matches(".cmp-carousel--mini") || !!element.closest(".cmp-carousel--mini");
    const cells = [];
    items.forEach((item) => {
      const teaser = item.matches(".cmp-teaser") ? item : item.querySelector(".cmp-teaser") || item;
      const image = resolveImage(
        teaser.querySelector(".cmp-teaser__image, .cmp-image") || teaser,
        document2
      );
      const content = [];
      const titleEl = teaser.querySelector(".cmp-teaser__title, h1, h2, h3");
      if (titleEl && titleEl.textContent.trim()) {
        const h2 = document2.createElement("h2");
        const titleLink = titleEl.querySelector("a");
        if (titleLink) {
          const a = document2.createElement("a");
          a.href = titleLink.getAttribute("href");
          a.textContent = titleEl.textContent.trim();
          h2.append(a);
        } else {
          h2.textContent = titleEl.textContent.trim();
        }
        content.push(h2);
      }
      content.push(...descriptionParagraphs(teaser.querySelector(".cmp-teaser__description"), document2));
      const ctas = [...teaser.querySelectorAll(".cmp-teaser__action-container a, a.cmp-teaser__action-link")].filter((a, i, arr) => arr.indexOf(a) === i && a.textContent.trim());
      ctas.forEach((a) => {
        const link = document2.createElement("a");
        link.href = a.getAttribute("href");
        link.textContent = a.textContent.trim();
        const strong = document2.createElement("strong");
        const em = document2.createElement("em");
        em.append(link);
        strong.append(em);
        const p = document2.createElement("p");
        p.append(strong);
        content.push(p);
      });
      if (!image && !content.length) return;
      cells.push(mini ? [image] : [image || "", content.length ? content : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const name = mini ? "carousel-hero (mini)" : "carousel-hero";
    const block = WebImporter.Blocks.createBlock(document2, { name, cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/columns-featured.js
  function resolveImage2(container, document2) {
    var _a;
    if (!container) return null;
    const img = container.querySelector("img");
    const cmp = container.matches("[data-cmp-src]") ? container : container.querySelector("[data-cmp-src]");
    const isReal = (u) => u && !/^data:/i.test(u) && !/^about:/i.test(u);
    let src = img ? img.getAttribute("src") || "" : "";
    if (!isReal(src) && img) {
      const lazy = img.getAttribute("data-src") || img.getAttribute("data-lazy-src");
      if (isReal(lazy)) src = lazy;
    }
    if (!isReal(src) && img && img.getAttribute("srcset")) {
      const candidates = img.getAttribute("srcset").split(",").map((s) => s.trim().split(/\s+/)).filter(([u]) => isReal(u)).map(([u, w]) => ({ u, w: parseInt(w, 10) || 0 })).sort((a, b) => b.w - a.w);
      if (candidates.length) src = candidates[0].u;
    }
    if (!isReal(src) && cmp) {
      const tpl = cmp.getAttribute("data-cmp-src") || "";
      if (tpl) src = tpl.replace("{.width}", ".1600");
    }
    if (!isReal(src)) return null;
    const alt = img && (img.getAttribute("alt") || img.getAttribute("title")) || ((_a = cmp == null ? void 0 : cmp.querySelector('meta[itemprop="caption"]')) == null ? void 0 : _a.getAttribute("content")) || "";
    const out = document2.createElement("img");
    out.src = src;
    out.alt = alt.trim();
    return out;
  }
  function descriptionParagraphs2(desc, document2) {
    if (!desc) return [];
    const ps = [...desc.querySelectorAll(":scope > p")].filter((p2) => p2.textContent.trim());
    if (ps.length) return ps;
    if (!desc.textContent.trim()) return [];
    const p = document2.createElement("p");
    p.innerHTML = desc.innerHTML.trim();
    return [p];
  }
  function parse2(element, { document: document2 }) {
    const teaser = element.matches(".cmp-teaser") ? element : element.querySelector(".cmp-teaser") || element;
    const image = resolveImage2(teaser.querySelector(".cmp-teaser__image, .cmp-image") || teaser, document2);
    const content = [];
    const pretitle = teaser.querySelector(".cmp-teaser__pretitle");
    if (pretitle && pretitle.textContent.trim()) {
      const p = document2.createElement("p");
      p.textContent = pretitle.textContent.trim();
      content.push(p);
    }
    const titleEl = teaser.querySelector(".cmp-teaser__title, h1, h2, h3");
    if (titleEl && titleEl.textContent.trim()) {
      const h2 = document2.createElement("h2");
      const titleLink = titleEl.querySelector("a");
      if (titleLink) {
        const a = document2.createElement("a");
        a.href = titleLink.getAttribute("href");
        a.textContent = titleEl.textContent.trim();
        h2.append(a);
      } else {
        h2.textContent = titleEl.textContent.trim();
      }
      content.push(h2);
    }
    content.push(...descriptionParagraphs2(teaser.querySelector(".cmp-teaser__description"), document2));
    const ctas = [...teaser.querySelectorAll(".cmp-teaser__action-container a, a.cmp-teaser__action-link")].filter((a, i, arr) => arr.indexOf(a) === i && a.textContent.trim());
    ctas.forEach((a) => {
      const link = document2.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.trim();
      const strong = document2.createElement("strong");
      const em = document2.createElement("em");
      em.append(link);
      strong.append(em);
      const p = document2.createElement("p");
      p.append(strong);
      content.push(p);
    });
    if (!image && !content.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [[image || "", content.length ? content : ""]];
    const block = WebImporter.Blocks.createBlock(document2, { name: "columns-featured", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/cards-article.js
  function resolveImage3(container, document2) {
    var _a;
    if (!container) return null;
    const img = container.querySelector("img");
    const cmp = container.matches("[data-cmp-src]") ? container : container.querySelector("[data-cmp-src]");
    const isReal = (u) => u && !/^data:/i.test(u) && !/^about:/i.test(u);
    let src = img ? img.getAttribute("src") || "" : "";
    if (!isReal(src) && img) {
      const lazy = img.getAttribute("data-src") || img.getAttribute("data-lazy-src");
      if (isReal(lazy)) src = lazy;
    }
    if (!isReal(src) && img && img.getAttribute("srcset")) {
      const candidates = img.getAttribute("srcset").split(",").map((s) => s.trim().split(/\s+/)).filter(([u]) => isReal(u)).map(([u, w]) => ({ u, w: parseInt(w, 10) || 0 })).sort((a, b) => b.w - a.w);
      if (candidates.length) src = candidates[0].u;
    }
    if (!isReal(src) && cmp) {
      const tpl = cmp.getAttribute("data-cmp-src") || "";
      if (tpl) src = tpl.replace("{.width}", ".1600");
    }
    if (!isReal(src)) return null;
    const alt = img && (img.getAttribute("alt") || img.getAttribute("title")) || ((_a = cmp == null ? void 0 : cmp.querySelector('meta[itemprop="caption"]')) == null ? void 0 : _a.getAttribute("content")) || "";
    const out = document2.createElement("img");
    out.src = src;
    out.alt = alt.trim();
    return out;
  }
  function parseLockedTeasers(element, document2) {
    const teasers = [element];
    let next = element.nextElementSibling;
    while (next && next.matches(".teaser.cmp-teaser--secure")) {
      teasers.push(next);
      next = next.nextElementSibling;
    }
    const cells = [];
    teasers.forEach((teaser) => {
      var _a, _b, _c;
      const title = ((_a = teaser.querySelector(".cmp-teaser__title")) == null ? void 0 : _a.textContent.trim()) || "";
      const img = resolveImage3(teaser.querySelector(".cmp-teaser__image") || teaser, document2);
      if (img && !img.alt && title) img.alt = title;
      const content = [];
      if (title) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        strong.textContent = title;
        p.append(strong);
        content.push(p);
      }
      const desc = (_b = teaser.querySelector(".cmp-teaser__description")) == null ? void 0 : _b.textContent.trim();
      if (desc) {
        const p = document2.createElement("p");
        p.textContent = desc;
        content.push(p);
      }
      const action = (_c = teaser.querySelector(".cmp-teaser__action-container")) == null ? void 0 : _c.textContent.trim();
      if (action) {
        const p = document2.createElement("p");
        p.textContent = action;
        content.push(p);
      }
      if (img || content.length) cells.push([img || "", content.length ? content : ""]);
    });
    teasers.slice(1).forEach((t) => t.remove());
    if (!cells.length) {
      element.remove();
      return;
    }
    element.replaceWith(WebImporter.Blocks.createBlock(document2, { name: "cards-article (locked)", cells }));
  }
  function parse3(element, { document: document2 }) {
    if (element.matches(".teaser.cmp-teaser--secure")) {
      parseLockedTeasers(element, document2);
      return;
    }
    let items = [...element.querySelectorAll("li.cmp-image-list__item")];
    if (!items.length) items = [...element.querySelectorAll("article.cmp-image-list__item-content, .cmp-image-list > li")];
    const cells = [];
    items.forEach((item) => {
      var _a;
      const imageLink = item.querySelector("a.cmp-image-list__item-image-link");
      const titleLink = item.querySelector("a.cmp-image-list__item-title-link");
      const titleText = ((_a = item.querySelector(".cmp-image-list__item-title") || titleLink) == null ? void 0 : _a.textContent.trim()) || "";
      const href = (titleLink == null ? void 0 : titleLink.getAttribute("href")) || (imageLink == null ? void 0 : imageLink.getAttribute("href")) || "";
      const img = resolveImage3(item.querySelector(".cmp-image-list__item-image, .cmp-image") || item, document2);
      let imageCell = "";
      if (img) {
        if (!img.alt && titleText) img.alt = titleText;
        const imgHref = (imageLink == null ? void 0 : imageLink.getAttribute("href")) || href;
        if (imgHref) {
          const a = document2.createElement("a");
          a.href = imgHref;
          a.append(img);
          imageCell = a;
        } else {
          imageCell = img;
        }
      }
      const content = [];
      if (titleText) {
        const p = document2.createElement("p");
        const strong = document2.createElement("strong");
        if (href) {
          const a = document2.createElement("a");
          a.href = href;
          a.textContent = titleText;
          strong.append(a);
        } else {
          strong.textContent = titleText;
        }
        p.append(strong);
        content.push(p);
      }
      const desc = item.querySelector(".cmp-image-list__item-description");
      if (desc && desc.textContent.trim()) {
        const p = document2.createElement("p");
        p.textContent = desc.textContent.trim();
        content.push(p);
      }
      if (!imageCell && !content.length) return;
      cells.push([imageCell, content.length ? content : ""]);
    });
    if (!cells.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const block = WebImporter.Blocks.createBlock(document2, { name: "cards-article", cells });
    element.replaceWith(block);
  }

  // tools/importer/parsers/hero-teaser.js
  function resolveImage4(container, document2) {
    var _a;
    if (!container) return null;
    const img = container.querySelector("img");
    const cmp = container.matches("[data-cmp-src]") ? container : container.querySelector("[data-cmp-src]");
    const isReal = (u) => u && !/^data:/i.test(u) && !/^about:/i.test(u);
    let src = img ? img.getAttribute("src") || "" : "";
    if (!isReal(src) && img) {
      const lazy = img.getAttribute("data-src") || img.getAttribute("data-lazy-src");
      if (isReal(lazy)) src = lazy;
    }
    if (!isReal(src) && img && img.getAttribute("srcset")) {
      const candidates = img.getAttribute("srcset").split(",").map((s) => s.trim().split(/\s+/)).filter(([u]) => isReal(u)).map(([u, w]) => ({ u, w: parseInt(w, 10) || 0 })).sort((a, b) => b.w - a.w);
      if (candidates.length) src = candidates[0].u;
    }
    if (!isReal(src) && cmp) {
      const tpl = cmp.getAttribute("data-cmp-src") || "";
      if (tpl) src = tpl.replace("{.width}", ".1600");
    }
    if (!isReal(src)) return null;
    const alt = img && (img.getAttribute("alt") || img.getAttribute("title")) || ((_a = cmp == null ? void 0 : cmp.querySelector('meta[itemprop="caption"]')) == null ? void 0 : _a.getAttribute("content")) || "";
    const out = document2.createElement("img");
    out.src = src;
    out.alt = alt.trim();
    return out;
  }
  function descriptionParagraphs3(desc, document2) {
    if (!desc) return [];
    const ps = [...desc.querySelectorAll(":scope > p")].filter((p2) => p2.textContent.trim());
    if (ps.length) return ps;
    if (!desc.textContent.trim()) return [];
    const p = document2.createElement("p");
    p.innerHTML = desc.innerHTML.trim();
    return [p];
  }
  function parse4(element, { document: document2 }) {
    const teaser = element.matches(".cmp-teaser") ? element : element.querySelector(".cmp-teaser") || element;
    const image = resolveImage4(teaser.querySelector(".cmp-teaser__image, .cmp-image") || teaser, document2);
    const content = [];
    const titleEl = teaser.querySelector(".cmp-teaser__title, h1, h2, h3");
    if (titleEl && titleEl.textContent.trim()) {
      const h2 = document2.createElement("h2");
      const titleLink = titleEl.querySelector("a");
      if (titleLink) {
        const a = document2.createElement("a");
        a.href = titleLink.getAttribute("href");
        a.textContent = titleEl.textContent.trim();
        h2.append(a);
      } else {
        h2.textContent = titleEl.textContent.trim();
      }
      content.push(h2);
    }
    content.push(...descriptionParagraphs3(teaser.querySelector(".cmp-teaser__description"), document2));
    const ctas = [...teaser.querySelectorAll(".cmp-teaser__action-container a, a.cmp-teaser__action-link")].filter((a, i, arr) => arr.indexOf(a) === i && a.textContent.trim());
    ctas.forEach((a) => {
      const link = document2.createElement("a");
      link.href = a.getAttribute("href");
      link.textContent = a.textContent.trim();
      const strong = document2.createElement("strong");
      const em = document2.createElement("em");
      em.append(link);
      strong.append(em);
      const p = document2.createElement("p");
      p.append(strong);
      content.push(p);
    });
    if (!image && !content.length) {
      element.replaceWith(...element.childNodes);
      return;
    }
    const cells = [];
    if (image) cells.push([image]);
    if (content.length) cells.push([content]);
    const block = WebImporter.Blocks.createBlock(document2, { name: "hero-teaser", cells });
    element.replaceWith(block);
  }

  // tools/importer/transformers/wknd-cleanup.js
  var TransformHook = { beforeTransform: "beforeTransform", afterTransform: "afterTransform" };
  function transform(hookName, element, payload) {
    if (hookName === TransformHook.beforeTransform) {
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

  // tools/importer/import-home.js
  var parsers = {
    "carousel-hero": parse,
    "columns-featured": parse2,
    "cards-article": parse3,
    "hero-teaser": parse4
  };
  var PAGE_TEMPLATE = {
    "name": "home",
    "description": "WKND homepage: hero carousel, featured article, article/adventure card grids and a hero teaser",
    "urls": [
      "https://wknd.site/us/en.html"
    ],
    "blocks": [
      {
        "name": "carousel-hero",
        "instances": [
          ".carousel.cmp-carousel--hero"
        ]
      },
      {
        "name": "columns-featured",
        "instances": [
          ".teaser.cmp-teaser--featured"
        ]
      },
      {
        "name": "cards-article",
        "instances": [
          ".image-list.list"
        ]
      },
      {
        "name": "hero-teaser",
        "instances": [
          ".teaser.cmp-teaser--hero.cmp-teaser--imagebottom"
        ]
      }
    ],
    "sections": [
      {
        "id": "section-1",
        "name": "hero-carousel",
        "selector": [
          ".carousel.cmp-carousel--hero"
        ],
        "style": null,
        "blocks": [
          "carousel-hero"
        ],
        "defaultContent": []
      },
      {
        "id": "section-2",
        "name": "featured-article",
        "selector": [
          ".teaser.cmp-teaser--featured"
        ],
        "style": null,
        "blocks": [
          "columns-featured"
        ],
        "defaultContent": []
      },
      {
        "id": "section-3",
        "name": "recent-articles",
        "selector": [
          ".teaser.cmp-teaser--featured + .title.cmp-title--underline"
        ],
        "style": null,
        "blocks": [
          "cards-article"
        ],
        "defaultContent": [
          ".teaser.cmp-teaser--featured + .title.cmp-title--underline",
          ".teaser.cmp-teaser--featured ~ .button.cmp-button--primary"
        ]
      },
      {
        "id": "section-4",
        "name": "next-adventures",
        "selector": [
          ".cmp-layout-container--fixed .separator + .title.cmp-title--underline"
        ],
        "style": null,
        "blocks": [
          "hero-teaser"
        ],
        "defaultContent": [
          ".cmp-layout-container--fixed .separator + .title.cmp-title--underline"
        ]
      },
      {
        "id": "section-5",
        "name": "where-to-go",
        "selector": [
          ".teaser.cmp-teaser--hero + .cmp-layout-container--fixed"
        ],
        "style": null,
        "blocks": [
          "cards-article"
        ],
        "defaultContent": [
          ".teaser.cmp-teaser--hero + .cmp-layout-container--fixed .title",
          ".teaser.cmp-teaser--hero + .cmp-layout-container--fixed .button.cmp-button--primary"
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
  var import_home_default = {
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
      WebImporter.rules.createMetadata(main, document2);
      WebImporter.rules.transformBackgroundImages(main, document2);
      WebImporter.rules.adjustImageUrls(main, url, params.originalURL);
      const rawPath = new URL(params.originalURL).pathname.replace(/\/$/, "").replace(/\.html?$/, "");
      const path = WebImporter.FileUtils.sanitizePath(rawPath === "" ? "/index" : rawPath);
      return [{
        element: main,
        path,
        report: {
          title: document2.title,
          template: PAGE_TEMPLATE.name,
          blocks: pageBlocks.map((b) => b.name)
        }
      }];
    }
  };
  return __toCommonJS(import_home_exports);
})();
