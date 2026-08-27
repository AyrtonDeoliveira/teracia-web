import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import puppeteer from 'puppeteer';

let browserPromise = null;

function findCachedChrome() {
  const cacheDir = path.join(os.homedir(), '.cache', 'puppeteer', 'chrome');
  if (!fs.existsSync(cacheDir)) return null;
  const versions = fs.readdirSync(cacheDir);
  for (const version of versions) {
    const exe = path.join(cacheDir, version, 'chrome-win64', 'chrome.exe');
    if (fs.existsSync(exe)) return exe;
  }
  return null;
}

async function launchBrowser() {
  try {
    return await puppeteer.launch({ headless: true });
  } catch (err) {
    const fallback = process.env.PUPPETEER_EXECUTABLE_PATH || findCachedChrome();
    if (!fallback) throw err;
    return puppeteer.launch({ headless: true, executablePath: fallback });
  }
}

export function getBrowser() {
  if (!browserPromise) browserPromise = launchBrowser();
  return browserPromise;
}

export async function closeBrowser() {
  if (!browserPromise) return;
  const browser = await browserPromise;
  await browser.close();
  browserPromise = null;
}

process.on('exit', () => {
  // best-effort; async close won't complete on 'exit' but avoids dangling handles in most cases
});
process.on('SIGINT', async () => {
  await closeBrowser();
  process.exit(0);
});
