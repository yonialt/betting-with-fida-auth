import { chromium } from 'playwright-core';
import { existsSync } from 'fs';

const candidates = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
];
const executablePath = candidates.find((p) => existsSync(p));

const VIEWPORTS = [
  { name: 'mobile', width: 390, height: 844 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'ipad-pro', width: 1024, height: 1366 },
  { name: 'pc', width: 1440, height: 900 },
];

const browser = await chromium.launch({ executablePath, headless: true });

// Mock the backend: age verification accepted, valid session, positive balance.
// (No real backend needed — pure frontend layout verification.)
const MOCK_USER = {
  id: 'u-test-1',
  username: 'Tester',
  balance: 1250,
  bonusBalance: 0,
  currency: 'ETB',
  phone: '+251900000000',
};

const setupRoutes = async (context) => {
  await context.route('**/api/age-verification/**', (route) => {
    const url = route.request().url();
    if (url.includes('/status')) {
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({ verified: true }),
      });
    }
    return route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ verified: true, status: 'VERIFIED', message: 'ok' }),
    });
  });
  await context.route('**/api/auth/session', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ token: 'mock-token', user: MOCK_USER }),
    })
  );
  await context.route('**/api/wallet/**', (route) =>
    route.fulfill({
      contentType: 'application/json',
      body: JSON.stringify({ balance: 1250, bonusBalance: 0, currency: 'ETB' }),
    })
  );
  // Mock every other API call so slow/absent backend does not break rendering
  await context.route('**/api/**', (route) => {
    const url = route.request().url();
    if (url.includes('age-verification') || url.includes('auth/session') || url.includes('wallet')) {
      return route.fallback();
    }
    return route.fulfill({ contentType: 'application/json', body: JSON.stringify([]) });
  });
};

const measure = (page, sel) =>
  page.evaluate((selector) => {
    const el = document.querySelector(selector);
    if (!el) return { exists: false };
    const cs = getComputedStyle(el);
    const r = el.getBoundingClientRect();
    const visible =
      cs.display !== 'none' && cs.visibility !== 'hidden' && r.width > 0 && r.height > 0;
    return {
      exists: true,
      visible,
      display: cs.display,
      bg: cs.backgroundColor,
      x: Math.round(r.left),
      y: Math.round(r.top),
      right: Math.round(r.right),
      w: Math.round(r.width),
      h: Math.round(r.height),
      offscreenRight: r.right > window.innerWidth + 1,
      offscreenLeft: r.left < -1,
    };
  }, sel);

const overflow = (page) =>
  page.evaluate(() => ({
    scrollW: document.documentElement.scrollWidth,
    innerW: window.innerWidth,
  }));

const results = [];
const log = (ok, msg) => {
  results.push({ ok, msg });
  console.log((ok ? 'PASS' : 'FAIL') + ' | ' + msg);
};

const seed = async (page) => {
  await page.addInitScript(() => {
    try {
      localStorage.setItem('fidabet_age_verified', '1');
      localStorage.setItem('fidabet_token', 'mock-token');
      localStorage.setItem('fidabet_refresh_token', 'mock-refresh');
    } catch {}
  });
};

try {
  for (const v of VIEWPORTS) {
    const ctx = await browser.newContext({
      viewport: { width: v.width, height: v.height },
      isMobile: v.width < 1024,
      hasTouch: v.width < 1024,
    });
    await setupRoutes(ctx);
    const page = await ctx.newPage();
    await seed(page);

    // ---------- SPORTS BETTING PAGE ----------
    await page.goto('http://localhost:5199/', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);

    const gate = await measure(page, '#fayda-id-input');
    if (gate.exists && gate.visible) {
      log(false, `[sports ${v.name}] AGE GATE still showing (app did not render)`);
      await ctx.close();
      continue;
    }

    const ovf = await overflow(page);
    log(ovf.scrollW <= ovf.innerW + 1, `[sports ${v.name}] no horizontal overflow (${ovf.scrollW} <= ${ovf.innerW})`);

    const logoTrigger = await measure(page, '#btn-mobile-left-sidebar');
    if (v.width < 1024) {
      log(logoTrigger.exists && logoTrigger.visible, `[sports ${v.name}] mobile logo trigger visible`);
      if (logoTrigger.exists) {
        log(logoTrigger.bg === 'rgba(0, 0, 0, 0)', `[sports ${v.name}] logo trigger transparent bg -> ${logoTrigger.bg}`);
        log(!logoTrigger.offscreenLeft, `[sports ${v.name}] logo trigger on-screen (x=${logoTrigger.x})`);
      }
    } else {
      log(!logoTrigger.exists || !logoTrigger.visible, `[sports ${v.name}] mobile logo trigger hidden on desktop`);
    }

    const profile = await measure(page, '#btn-user-profile');
    log(profile.exists && profile.visible, `[sports ${v.name}] profile capsule visible`);
    if (profile.exists) {
      log(!profile.offscreenRight && profile.right <= ovf.innerW, `[sports ${v.name}] profile NOT clipped (right=${profile.right} vw=${ovf.innerW})`);
    }

    const hamburger = await measure(page, '#btn-mobile-categories');
    const pm = await measure(page, '#nav-polymarket');
    if (v.width < 1024) {
      log(hamburger.exists && hamburger.visible, `[sports ${v.name}] nav hamburger visible`);
      if (hamburger.exists && pm.exists) {
        log(hamburger.x > pm.right, `[sports ${v.name}] hamburger right of POLYMARKET (${hamburger.x} > ${pm.right})`);
        log(hamburger.right <= ovf.innerW, `[sports ${v.name}] hamburger within edge (right=${hamburger.right})`);
      }
    } else {
      log(!hamburger.exists || !hamburger.visible, `[sports ${v.name}] nav hamburger hidden on desktop`);
      log(pm.exists && pm.visible, `[sports ${v.name}] POLYMARKET button visible on desktop`);
    }

    const slipBar = await measure(page, '#mobile-betslip-bar');
    const slipPanel = await measure(page, '#bet-slip-panel');
    if (v.width < 1024) {
      log(slipBar.exists && slipBar.visible, `[sports ${v.name}] mobile betslip bar visible`);
    } else {
      log(slipPanel.exists && slipPanel.visible, `[sports ${v.name}] desktop bet slip column visible`);
    }

    // ---------- POLYMARKET PAGE ----------
    await page.goto('http://localhost:5199/polymarket', { waitUntil: 'domcontentloaded', timeout: 45000 });
    await page.waitForTimeout(3000);

    const gate2 = await measure(page, '#fayda-id-input');
    if (gate2.exists && gate2.visible) {
      log(false, `[poly ${v.name}] AGE GATE still showing (app did not render)`);
      await ctx.close();
      continue;
    }

    const ovf2 = await overflow(page);
    log(ovf2.scrollW <= ovf2.innerW + 1, `[poly ${v.name}] no horizontal overflow (${ovf2.scrollW} <= ${ovf2.innerW})`);

    const searchIcon = await measure(page, '#btn-mobile-search-open');
    const searchInput = await measure(page, '#polymarket-search-input');
    if (v.width < 640) {
      log(searchIcon.exists && searchIcon.visible, `[poly ${v.name}] search ICON visible`);
      log(!searchInput.exists || !searchInput.visible, `[poly ${v.name}] search BOX hidden`);
    } else {
      log(!searchIcon.exists || !searchIcon.visible, `[poly ${v.name}] search icon hidden (sm+)`);
      log(searchInput.exists && searchInput.visible, `[poly ${v.name}] search pill visible (sm+)`);
    }

    const pmProfile = await measure(page, '#btn-user-profile');
    log(pmProfile.exists && pmProfile.visible, `[poly ${v.name}] profile capsule visible`);
    if (pmProfile.exists) {
      log(!pmProfile.offscreenRight && pmProfile.right <= ovf2.innerW, `[poly ${v.name}] profile NOT clipped (right=${pmProfile.right} vw=${ovf2.innerW})`);
    }

    const pmHam = await measure(page, '#btn-pm-categories-hamburger');
    const liveBtn = await measure(page, '#nav-sportsbook-live-cta');
    const catScroll = await page.evaluate(() => {
      const bar = document.getElementById('polymarket-categories-bar');
      if (!bar) return { exists: false };
      const scrollDiv = bar.querySelector('div > div:nth-child(2)');
      if (!scrollDiv) return { exists: false };
      const cs = getComputedStyle(scrollDiv);
      const r = scrollDiv.getBoundingClientRect();
      return { exists: true, visible: cs.display !== 'none' && r.width > 0 };
    });
    if (v.width < 1024) {
      log(pmHam.exists && pmHam.visible, `[poly ${v.name}] categories hamburger visible`);
      if (pmHam.exists && liveBtn.exists) {
        log(pmHam.x > liveBtn.right, `[poly ${v.name}] hamburger right of LIVE btn (${pmHam.x} > ${liveBtn.right})`);
        log(pmHam.right <= ovf2.innerW, `[poly ${v.name}] hamburger within edge (right=${pmHam.right})`);
      }
      log(!catScroll.exists || !catScroll.visible, `[poly ${v.name}] carousel hidden (mobile)`);
    } else {
      log(!pmHam.exists || !pmHam.visible, `[poly ${v.name}] categories hamburger hidden (desktop)`);
      log(catScroll.exists && catScroll.visible, `[poly ${v.name}] carousel visible (desktop)`);
      log(liveBtn.exists && liveBtn.visible, `[poly ${v.name}] SPORTS LIVE visible (desktop)`);
    }

    await ctx.close();
  }

  // ---------- INTERACTION TESTS (mobile) ----------
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, isMobile: true, hasTouch: true });
  await setupRoutes(ctx);
  const page = await ctx.newPage();
  await seed(page);

  const safe = async (fn, label) => {
    try {
      await fn();
      return true;
    } catch (e) {
      log(false, `[interaction] ${label}: ${String(e).split('\n')[0].slice(0, 100)}`);
      return false;
    }
  };

  // Polymarket interactions
  await page.goto('http://localhost:5199/polymarket', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2500);

  if (await safe(() => page.click('#btn-mobile-search-open', { timeout: 5000 }), 'open search icon')) {
    await page.waitForTimeout(300);
    const inputAfterOpen = await measure(page, '#polymarket-search-input');
    log(inputAfterOpen.exists && inputAfterOpen.visible, '[interaction] search icon expands input');
    await page.fill('#polymarket-search-input', 'btc');
    await page.waitForTimeout(400);
    if (await safe(() => page.click('#btn-mobile-search-close', { timeout: 5000 }), 'close search')) {
      await page.waitForTimeout(300);
      const after = await measure(page, '#polymarket-search-input');
      log(!after.visible, '[interaction] close collapses search to icon');
    }
  }

  if (await safe(() => page.click('#btn-pm-categories-hamburger', { timeout: 5000 }), 'open category menu')) {
    await page.waitForTimeout(300);
    const menu = await measure(page, '#pm-categories-menu');
    log(menu.exists && menu.visible, '[interaction] hamburger opens category menu');
    const within = await page.evaluate(() => {
      const r = document.querySelector('#pm-categories-menu')?.getBoundingClientRect();
      return r && r.right <= window.innerWidth + 1 && r.left >= -1;
    });
    log(!!within, '[interaction] category menu within viewport');
    const perps = await page.evaluate(() => {
      const b = [...document.querySelectorAll('#pm-categories-menu button')].find((x) =>
        x.textContent?.toLowerCase().includes('perps')
      );
      return !!b;
    });
    log(perps, '[interaction] menu lists Perps');
    if (perps) {
      await page.click('#pm-categories-menu button:has-text("Perps")');
      await page.waitForTimeout(800);
      const gone = await measure(page, '#pm-categories-menu');
      log(!gone.visible, '[interaction] menu closes after selecting Perps');
    }
  }

  // Sports interactions
  await page.goto('http://localhost:5199/', { waitUntil: 'domcontentloaded', timeout: 45000 });
  await page.waitForTimeout(2500);

  if (await safe(() => page.click('#btn-mobile-left-sidebar', { timeout: 5000 }), 'click logo trigger')) {
    await page.waitForTimeout(600);
    const drawerVisible = await page.evaluate(() => {
      const el = document.querySelector('#mobile-sports-drawer');
      if (!el) return false;
      const r = el.getBoundingClientRect();
      return r.left >= 0 && r.left < 100 && r.width > 100;
    });
    log(drawerVisible, '[interaction] logo trigger opens sports drawer');
    if (await safe(() => page.click('#btn-close-mobile-sports-drawer', { timeout: 5000 }), 'close drawer')) {
      await page.waitForTimeout(500);
      const closed = await page.evaluate(() => {
        const el = document.querySelector('#mobile-sports-drawer');
        if (!el) return true;
        const r = el.getBoundingClientRect();
        return r.left < -50;
      });
      log(closed, '[interaction] drawer closes via X');
    }
  }

  await ctx.close();
} finally {
  await browser.close();
}

const fails = results.filter((r) => !r.ok);
console.log(`\n===== ${results.length - fails.length}/${results.length} checks passed =====`);
if (fails.length) {
  console.log('FAILED CHECKS:');
  fails.forEach((f) => console.log(' - ' + f.msg));
  process.exitCode = 1;
}
