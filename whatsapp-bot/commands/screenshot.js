import { paths, siteSections } from '../config.js';
import { getBrowser } from '../lib/puppeteerBrowser.js';

function pickTarget(text) {
  const lower = text.toLowerCase();
  if (lower.includes('mvp')) {
    const wantsBoard = /tablero|board/.test(lower);
    return { file: paths.mvpHtml, selector: wantsBoard ? '#boardFrame' : null };
  }
  const section = siteSections.find((s) => lower.includes(s));
  return { file: paths.siteHtml, selector: section ? `#${section}` : null };
}

async function openPage(browser, filePath) {
  const page = await browser.newPage();
  await page.setViewport({ width: 1280, height: 900 });
  await page.goto('file://' + filePath, { waitUntil: 'networkidle0' });
  await new Promise((r) => setTimeout(r, 300));
  return page;
}

export async function takeScreenshot(text) {
  const { file, selector } = pickTarget(text);
  const browser = await getBrowser();
  const page = await openPage(browser, file);
  try {
    if (selector) {
      const el = await page.$(selector);
      if (el) return await el.screenshot();
    }
    return await page.screenshot({ fullPage: true });
  } finally {
    await page.close();
  }
}

export async function exportPdf(text) {
  const { file } = pickTarget(text);
  const browser = await getBrowser();
  const page = await openPage(browser, file);
  try {
    return await page.pdf({ format: 'A4', printBackground: true });
  } finally {
    await page.close();
  }
}
