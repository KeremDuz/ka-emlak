#!/usr/bin/env node
// Hepsiemlak ofis sayfasındaki ilanları çeker ve SourceListing formatında JSON üretir.
// Kullanım: node scripts/sync-hepsiemlak.mjs [--dry-run] [--out data/import/hepsiemlak-sync.json]
// GitHub Actions cron'u bu scripti günde bir kez çalıştırır.

import { chromium } from 'playwright';
import { readFile, writeFile } from 'node:fs/promises';
import { resolve, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const ROOT = resolve(__dirname, '..');

const OFFICE_URL = 'https://www.hepsiemlak.com/emlak-ofisi/ka-emlak-29750';
const OFFICE_ID = '29750';
const MAX_PAGES = 5;
const DETAIL_DELAY_MS = 2000;

function parseArgs() {
  const args = process.argv.slice(2);
  return {
    dryRun: args.includes('--dry-run'),
    out: args.includes('--out') ? args[args.indexOf('--out') + 1] : resolve(ROOT, 'data/import/hepsiemlak-sync.json'),
  };
}

async function fetchListingUrls(page, baseUrl) {
  const urls = [];
  for (let p = 1; p <= MAX_PAGES; p++) {
    const url = p === 1 ? baseUrl : `${baseUrl}?page=${p}`;
    console.log(`  Sayfa ${p}: ${url}`);
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    try { await page.waitForSelector('a.card-link, a.listingCard__media-link, .listingCard', { timeout: 15000 }); } catch { /* timeout */ }
    await page.waitForTimeout(2000);

    const title = await page.title();
    if (title.includes('lütfen') || title.includes('moment') || title.includes('Attention')) {
      console.log(`    Cloudflare challenge algılandı, bekleniyor...`);
      await page.waitForTimeout(15000);
      try { await page.waitForSelector('a.card-link, a.listingCard__media-link, .listingCard', { timeout: 20000 }); } catch { /* timeout */ }
    }

    const pageUrls = await page.evaluate((officeId) => {
      const links = [];
      for (const a of document.querySelectorAll('a.card-link, a.listingCard__media-link')) {
        const href = a.getAttribute('href');
        if (href && href.includes(`/${officeId}-`)) {
          links.push(new URL(href, location.origin).href);
        }
      }
      return [...new Set(links)];
    }, OFFICE_ID);

    urls.push(...pageUrls);
    console.log(`    ${pageUrls.length} ilan bulundu`);

    if (pageUrls.length === 0) break;
  }
  return [...new Set(urls)];
}

async function fetchDetail(page, url, retries = 2) {
  for (let attempt = 0; attempt <= retries; attempt++) {
    await page.goto(url, { waitUntil: 'domcontentloaded', timeout: 30000 });
    await page.waitForTimeout(DETAIL_DELAY_MS);
    try { await page.waitForSelector('tr.spec-item', { timeout: 5000 }); } catch { /* spec tablosu yüklenmedi, devam et */ }

    const result = await page.evaluate(() => {
    const t = (el) => el ? el.textContent.replace(/\s+/g, ' ').trim() : '';
    const lines = (el) => {
      if (!el) return '';
      const c = el.cloneNode(true);
      c.querySelectorAll('br').forEach(b => b.replaceWith('\n'));
      c.querySelectorAll('p,div,li,h1,h2,h3').forEach(b => b.append('\n'));
      return c.textContent.replace(/ /g, ' ').replace(/[ \t]+\n/g, '\n').replace(/\n{3,}/g, '\n\n').trim().slice(0, 20000);
    };
    const attrs = (root, re) => {
      const out = [];
      if (!root) return out;
      root.querySelectorAll('img,source').forEach(i => {
        ['src', 'data-src', 'srcset', 'data-srcset'].forEach(a => {
          (i.getAttribute(a) || '').split(/[\s,]+/).forEach(s => {
            if (re.test(s) && !out.includes(s)) out.push(s);
          });
        });
      });
      return out.slice(0, 60);
    };

    const id = (location.pathname.match(/(\d+-\d+)\/?$/) || [])[1];
    if (!id) return null;

    const specs = {};
    document.querySelectorAll('tr.spec-item').forEach(r => {
      const k = t(r.querySelector('th'));
      if (k) specs[k] = t(r.querySelector('td'));
    });

    return {
      source: 'hepsiemlak',
      url: location.origin + location.pathname.replace(/\/$/, ''),
      id,
      title: t(document.querySelector('h1')),
      price: t(document.querySelector('[class*=price]')).slice(0, 80),
      breadcrumb: Array.from(document.querySelectorAll('[class*=breadcrumb] a')).map(t),
      specs,
      description: lines(document.querySelector('.description-content')),
      photos: attrs(document, /\/mnresize\/\d+\/\d+\/ds01\//),
      hasSpecs: Object.keys(specs).length > 0,
    };
    });

    if (result && result.hasSpecs) {
      delete result.hasSpecs;
      return result;
    }
    if (attempt < retries) {
      console.log(`    Detay yüklenemedi, tekrar deneniyor (${attempt + 1}/${retries})...`);
      await page.waitForTimeout(3000);
    }
  }
  return null;
}

function safetyCheck(newListings, previousPath) {
  let previous = [];
  try {
    const raw = JSON.parse(readFileSync(previousPath, 'utf-8'));
    previous = Array.isArray(raw) ? raw : [];
  } catch { /* dosya yoksa ilk çalıştırma */ }

  if (newListings.length === 0) {
    console.error('UYARI: Hiçbir ilan çekilemedi. Mevcut veri korunuyor.');
    return false;
  }
  if (previous.length > 0 && newListings.length < previous.length * 0.5) {
    console.error(`UYARI: İlan sayısı ${previous.length}'dan ${newListings.length}'a düştü (>%50). Mevcut veri korunuyor.`);
    return false;
  }
  return true;
}

async function main() {
  const opts = parseArgs();
  console.log('Hepsiemlak senkronizasyonu başlıyor...');
  console.log(`  Çıkış: ${opts.out}`);
  console.log(`  Dry run: ${opts.dryRun}`);

  const browser = await chromium.launch({ headless: true });
  const context = await browser.newContext({
    locale: 'tr-TR',
    timezoneId: 'Europe/Istanbul',
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();

  try {
    console.log('Ofis sayfası okunuyor...');
    const urls = await fetchListingUrls(page, OFFICE_URL);
    console.log(`Toplam ${urls.length} benzersiz ilan bulundu.`);

    const listings = [];
    for (let i = 0; i < urls.length; i++) {
      const url = urls[i];
      console.log(`[${i + 1}/${urls.length}] ${url}`);
      try {
        const data = await fetchDetail(page, url);
        if (data && data.id) {
          listings.push(data);
          console.log(`  OK: ${data.title.slice(0, 60)} | ${data.price} | ${data.photos.length} foto`);
        } else {
          console.warn(`  ATLANILDI: detay sayfası okunamadı`);
        }
      } catch (err) {
        console.error(`  HATA: ${err.message}`);
      }
    }

    console.log(`\n${listings.length}/${urls.length} ilan başarıyla çekildi.`);

    // Güvenlik kontrolü
    let previous = [];
    try { previous = JSON.parse(await readFile(opts.out, 'utf-8')); } catch { /* ilk çalıştırma */ }
    if (listings.length === 0) {
      console.error('UYARI: Hiçbir ilan çekilemedi. Mevcut veri korunuyor.');
      process.exit(1);
    }
    if (previous.length > 0 && listings.length < previous.length * 0.5) {
      console.error(`UYARI: İlan sayısı ${previous.length}'dan ${listings.length}'a düştü (>%50). Mevcut veri korunuyor.`);
      process.exit(1);
    }

    if (opts.dryRun) {
      console.log('Dry run — dosya yazılmadı.');
      console.log(JSON.stringify(listings.slice(0, 2), null, 2));
    } else {
      await writeFile(opts.out, JSON.stringify(listings, null, 2), 'utf-8');
      console.log(`${opts.out} dosyasına ${listings.length} ilan yazıldı.`);
    }

    // Değişiklik raporu
    const prevIds = new Set(previous.map(l => l.id));
    const newIds = new Set(listings.map(l => l.id));
    const added = listings.filter(l => !prevIds.has(l.id));
    const removed = previous.filter(l => !newIds.has(l.id));
    const updated = listings.filter(l => {
      const old = previous.find(p => p.id === l.id);
      return old && old.price !== l.price;
    });
    if (added.length || removed.length || updated.length) {
      console.log('\nDeğişiklikler:');
      for (const l of added) console.log(`  + YENİ: ${l.id} — ${l.title.slice(0, 50)}`);
      for (const l of removed) console.log(`  - KALDIRILDI: ${l.id} — ${l.title?.slice(0, 50) ?? l.id}`);
      for (const l of updated) {
        const old = previous.find(p => p.id === l.id);
        console.log(`  ~ FİYAT: ${l.id} — ${old.price} → ${l.price}`);
      }
    } else {
      console.log('\nDeğişiklik yok.');
    }
  } finally {
    await browser.close();
  }
}

main().catch(err => { console.error(err); process.exit(1); });
