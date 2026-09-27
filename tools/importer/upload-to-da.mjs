#!/usr/bin/env node
/*
 * Uploads imported pages to Document Authoring (DA) and previews them.
 *
 * For each content/<path>.plain.html:
 *   1. every external <img src> is downloaded and uploaded once to /assets/<path>/<file>
 *      (DA assets are ingested as optimized media_<hash> images on preview)
 *   2. every external linked PDF is uploaded (and previewed) the same way, linked as /assets/<path>/<file>
 *   3. the page is wrapped as a DA document with the rewritten image and file URLs
 *   4. the document is uploaded to /<path>.html and previewed (not published)
 *
 * Usage:
 *   node tools/importer/upload-to-da.mjs us/en/magazine [us/en/other ...] [--org=o --repo=r] [--no-preview]
 * org/repo default to the DA content source in .migration/project.json.
 * Credentials are injected by the environment; no token handling here.
 */
import { execFileSync } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';

const args = process.argv.slice(2);
const opt = (name) => args.find((a) => a.startsWith(`--${name}=`))?.split('=')[1];
const pages = args.filter((a) => !a.startsWith('--'));
const preview = !args.includes('--no-preview');

function daSource() {
  if (opt('org') && opt('repo')) return { org: opt('org'), repo: opt('repo') };
  const project = JSON.parse(fs.readFileSync('.migration/project.json', 'utf8'));
  const site = Object.values(project.sites || {})[0] || {};
  const m = (site.contentHostUrl || '').match(/content\.da\.live\/([^/]+)\/([^/]+)/);
  if (!m) throw new Error('No DA content source found; pass --org and --repo');
  return { org: m[1], repo: m[2] };
}

// curl keeps credential injection identical to the documented DA/admin workflow
function curl(curlArgs) {
  return execFileSync('curl', ['-s', '-S', '--fail-with-body', ...curlArgs], { encoding: 'utf8', maxBuffer: 64 * 1024 * 1024 });
}

const CONTENT_TYPES = { jpg: 'image/jpeg', jpeg: 'image/jpeg', png: 'image/png', gif: 'image/gif', webp: 'image/webp', avif: 'image/avif' };

function main() {
  if (!pages.length) {
    console.error('Usage: node tools/importer/upload-to-da.mjs <page-path> [...] [--org= --repo=] [--no-preview]');
    process.exit(1);
  }
  const { org, repo } = daSource();
  const tmp = fs.mkdtempSync(path.join(os.tmpdir(), 'da-upload-'));

  pages.forEach((raw) => {
    const page = raw.replace(/^\/+|\.plain\.html$|\.html$/g, '');
    const file = `content/${page}.plain.html`;
    let html = fs.readFileSync(file, 'utf8');
    const uploaded = new Map();

    [...html.matchAll(/<img\b[^>]*\bsrc="(https?:\/\/[^"]+)"/g)].forEach(([, src]) => {
      if (uploaded.has(src) || src.includes('content.da.live')) return;
      const url = new URL(src.replace(/&amp;/g, '&'));
      const base = path.basename(url.pathname).toLowerCase().replace(/[^a-z0-9.-]+/g, '-');
      const ext = (base.split('.').pop() || '').toLowerCase();
      if (!CONTENT_TYPES[ext]) throw new Error(`Unsupported image type for ${src}`);
      const local = path.join(tmp, base);
      curl(['-L', '-o', local, url.href]);
      const assetPath = `assets/${page}/${base}`;
      curl(['-X', 'POST', '-F', `data=@${local};type=${CONTENT_TYPES[ext]}`, `https://admin.da.live/source/${org}/${repo}/${assetPath}`]);
      uploaded.set(src, `https://content.da.live/${org}/${repo}/${assetPath}`);
      console.log(`  asset  ${assetPath}`);
    });
    uploaded.forEach((daUrl, src) => { html = html.split(src).join(daUrl); });

    // linked PDFs (download buttons): uploaded to /assets/<path>/ and linked site-relative;
    // AEM's ".coredownload.pdf" suffix is dropped from the file name
    const files = new Map();
    [...html.matchAll(/<a\b[^>]*\bhref="(https?:\/\/[^"]+\.pdf)"/g)].forEach(([, href]) => {
      if (files.has(href)) return;
      const url = new URL(href.replace(/&amp;/g, '&'));
      const base = path.basename(url.pathname).toLowerCase()
        .replace(/\.coredownload\.pdf$/, '').replace(/[^a-z0-9.-]+/g, '-');
      const local = path.join(tmp, base);
      curl(['-L', '-o', local, url.href]);
      const assetPath = `assets/${page}/${base}`;
      curl(['-X', 'POST', '-F', `data=@${local};type=application/pdf`, `https://admin.da.live/source/${org}/${repo}/${assetPath}`]);
      if (preview) curl(['-X', 'POST', `https://admin.hlx.page/preview/${org}/${repo}/main/${assetPath}`]);
      files.set(href, `/${assetPath}`);
      console.log(`  file   ${assetPath}`);
    });
    files.forEach((local, href) => { html = html.split(href).join(local); });

    const doc = path.join(tmp, `${path.basename(page)}.html`);
    fs.writeFileSync(doc, `<body><header></header><main>${html}</main><footer></footer></body>\n`);
    curl(['-X', 'POST', '-F', `data=@${doc};type=text/html`, `https://admin.da.live/source/${org}/${repo}/${page}.html`]);
    console.log(`  doc    /${page}.html (${uploaded.size} images)`);
    if (preview) {
      curl(['-X', 'POST', `https://admin.hlx.page/preview/${org}/${repo}/main/${page}`]);
      console.log(`  preview https://main--${repo}--${org}.aem.page/${page}`);
    }
  });
  fs.rmSync(tmp, { recursive: true, force: true });
}

main();
