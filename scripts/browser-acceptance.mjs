import assert from 'node:assert/strict';
import { mkdir, mkdtemp, writeFile } from 'node:fs/promises';
import { tmpdir } from 'node:os';
import { join, resolve } from 'node:path';
import { chromium } from 'playwright';
import { preview } from 'vite';
import { DRILLS, DRILL_ORDER } from '../src/data/drills.js';

// Serve the production build on an available port in the browser's process tree.
const output = process.env.SWIM_QA_DIR
  ? resolve(process.env.SWIM_QA_DIR)
  : await mkdtemp(join(tmpdir(), 'swim-visual-coach-qa-'));
await mkdir(output, { recursive: true });
const server = await preview({
  preview: { host: '127.0.0.1', port: 0, strictPort: true },
  logLevel: 'error',
});
let browser, activePage;
const checks = [],
  errors = [],
  failures = [];
const record = (name) => {
  checks.push(name);
  console.log(`PASS ${name}`);
};
const observe = (page) => {
  activePage = page;
  page.on('crash', () => errors.push('Browser page crashed'));
  page.on('pageerror', (error) => errors.push(error.message));
  page.on('console', (message) => {
    if (message.type() === 'error') errors.push(message.text());
  });
  page.on('response', (response) => {
    if (response.status() >= 400)
      failures.push(`${response.status()} ${response.url()}`);
  });
};
const button = (page, name) => page.getByRole('button', { name, exact: true });
const pressed = async (page, name, value = true) =>
  assert.equal(
    await button(page, name).getAttribute('aria-pressed'),
    String(value),
  );
const title = async (page, text) =>
  assert.equal(await page.locator('h1').innerText(), text);
const shot = (page, name) =>
  page.screenshot({
    path: join(output, `${name}.png`),
    fullPage: true,
    timeout: 60000,
  });
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const launchBrowser = () =>
  chromium.launch({
    headless: true,
    ...(process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH
      ? { executablePath: process.env.PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH }
      : {}),
    args: [
      '--no-sandbox',
      '--use-gl=angle',
      '--use-angle=swiftshader',
      '--enable-unsafe-swiftshader',
    ],
  });

try {
  browser = await launchBrowser();
  const url = `http://127.0.0.1:${server.httpServer.address().port}${server.config.base}`;
  const page = await browser.newPage({
    viewport: { width: 1600, height: 1000 },
  });
  observe(page);
  await page.goto(url, { waitUntil: 'networkidle' });
  const begin = button(page, 'Begin practice');
  assert.equal(
    await begin.evaluate((el) => el === document.activeElement),
    true,
  );
  for (const key of ['Tab', 'Shift+Tab']) {
    await page.keyboard.press(key);
    assert.equal(
      await begin.evaluate((el) => el === document.activeElement),
      true,
    );
  }
  assert.equal(await page.locator('.coach-shell').getAttribute('inert'), '');
  await page.locator('canvas').waitFor();
  await page.evaluate(() => document.fonts.ready);
  await shot(page, 'onboarding');
  await begin.click();
  assert.equal(
    await page.locator('h1').evaluate((el) => el === document.activeElement),
    true,
  );
  await page.locator('canvas').waitFor();
  await page.evaluate(() => document.fonts.ready);
  assert.equal(
    await page.evaluate(
      () =>
        document.fonts.check('500 16px Fraunces') &&
        document.fonts.check('400 16px Outfit'),
    ),
    true,
  );
  const canvas = await page.locator('canvas').boundingBox();
  assert.ok(canvas.width > 400 && canvas.height > 350);
  record(
    'onboarding keyboard containment, focus handoff, self-hosted fonts, and real WebGL canvas',
  );

  await title(page, 'Superman Glide');
  assert.equal(
    await page
      .getByRole('navigation', { name: 'Curriculum' })
      .getByRole('button')
      .count(),
    14,
  );
  assert.equal(await button(page, 'Previous drill').isDisabled(), true);
  const notes = page.locator('.lesson-notes');
  assert.equal(await notes.getAttribute('open'), null);
  await notes.locator('summary').focus();
  await page.keyboard.press('Space');
  assert.equal(await button(page, 'Pause').isVisible(), true);
  assert.equal(await notes.locator('p').isVisible(), true);
  assert.equal(
    await notes.locator('p').innerText(),
    DRILLS.superman.description,
  );
  await button(page, 'Next drill').click();
  await title(page, 'Lazy Flutter');
  assert.equal(await page.locator('.lesson-notes').getAttribute('open'), null);
  await button(page, 'Previous drill').click();
  await title(page, 'Superman Glide');
  record('visible curriculum, full lesson notes, and previous/next navigation');

  await button(page, 'Pause').click();
  await button(page, 'Restart demonstration').click();
  assert.equal(await button(page, 'Play').isVisible(), true);
  await button(page, '0.5x').click();
  await pressed(page, '0.5x');
  await button(page, 'Heavy head').click();
  await pressed(page, 'Heavy head');
  await button(page, 'Common error').click();
  await pressed(page, 'Common error');
  await pressed(page, 'Heavy head');
  await button(page, 'Ghost').click();
  await pressed(page, 'Ghost');
  assert.match(
    await page.locator('.lane-legend').innerText(),
    /efficient form/,
  );
  await button(page, 'Efficient').click();
  assert.match(await page.locator('.lane-legend').innerText(), /common error/);
  await button(page, 'Ghost').click();
  await button(page, 'Heavy head').click();
  await button(page, '1x').click();
  record(
    'pause, restart, playback speed, form comparison, and persistent cue selection',
  );

  for (const name of ['Side', '3/4', 'Overhead', 'Head-on', 'Under']) {
    await button(page, name).click();
    await pressed(page, name);
    // Let the camera interpolation settle for the screenshots.
    await page.waitForTimeout(500);
    await shot(
      page,
      `camera-${name.replace(/[^a-z0-9]/gi, '-').toLowerCase()}`,
    );
  }
  await button(page, '3/4').click();
  await button(page, 'Restart demonstration').click();
  await page.waitForTimeout(500);
  await shot(page, 'workspace-desktop');
  record('all five camera views render without application or shader errors');

  await button(page, 'Guides').click();
  await pressed(page, 'Guides', false);
  await button(page, 'Guides').click();
  await button(page, 'Narrate').click();
  await pressed(page, 'Narrate');
  await button(page, 'Narrate').click();
  await button(page, 'Focus').click();
  assert.equal(
    await page.getByRole('navigation', { name: 'Curriculum' }).isVisible(),
    false,
  );
  assert.equal(
    await page
      .getByRole('complementary', { name: 'Lesson guidance' })
      .isVisible(),
    false,
  );
  await button(page, 'Exit focus').focus();
  await page.keyboard.press('Escape');
  assert.equal(
    await page.getByRole('navigation', { name: 'Curriculum' }).isVisible(),
    true,
  );
  const shortcuts = page.locator('.shortcut-help');
  await shortcuts.locator('summary').focus();
  await page.keyboard.press('Space');
  assert.equal(await page.locator('.shortcut-popover').isVisible(), true);
  assert.equal(await button(page, 'Play').isVisible(), true);
  await page.keyboard.press('Enter');
  assert.equal(await page.locator('.shortcut-popover').isVisible(), false);
  await page.locator('h1').click();
  await page.keyboard.press('Space');
  assert.equal(await button(page, 'Pause').isVisible(), true);
  await page.keyboard.press('Space');
  assert.equal(await button(page, 'Play').isVisible(), true);
  await page.keyboard.press('ArrowRight');
  await title(page, 'Lazy Flutter');
  await page.keyboard.press('ArrowLeft');
  await title(page, 'Superman Glide');
  record(
    'guides, narration controls, focus mode, Escape, and keyboard shortcuts',
  );

  await button(page, 'Mark mastered').click();
  assert.equal(
    await page.locator('[role="progressbar"]').getAttribute('aria-valuenow'),
    '1',
  );
  await button(page, 'Next drill').click();
  await page.reload({ waitUntil: 'networkidle' });
  await title(page, 'Lazy Flutter');
  assert.equal(
    await page.locator('[role="progressbar"]').getAttribute('aria-valuenow'),
    '1',
  );
  assert.equal(await page.getByRole('dialog').count(), 0);
  await button(page, 'Previous drill').click();
  assert.equal(await button(page, 'Mastered').isDisabled(), true);
  record(
    'explicit mastery, progress persistence, and last-lesson resume after reload',
  );

  for (const id of DRILL_ORDER) {
    await page
      .getByRole('navigation', { name: 'Curriculum' })
      .getByRole('button', { name: new RegExp(escapeRegex(DRILLS[id].title)) })
      .click();
    await title(page, DRILLS[id].title);
    assert.equal(
      await page.locator('[role="progressbar"]').getAttribute('aria-valuenow'),
      '1',
    );
  }
  assert.equal(await button(page, 'Next drill').isDisabled(), true);
  assert.equal(await button(page, 'Ghost').isDisabled(), true);
  await page.locator('h1').click();
  await page.keyboard.press('g');
  assert.equal(
    await button(page, 'Ghost').getAttribute('aria-pressed'),
    'false',
  );
  assert.match(
    await page.locator('.lane-legend').innerText(),
    /Far lane.*efficient/,
  );
  await button(page, 'Overhead').click();
  await page.waitForTimeout(500);
  await shot(page, 'paired-comparison');
  record(
    'all 14 lessons, truthful paired legend, and disabled redundant ghost control',
  );

  for (const size of [
    { width: 1366, height: 900 },
    { width: 1280, height: 800 },
    { width: 1024, height: 768 },
    { width: 390, height: 844 },
  ]) {
    await page.setViewportSize(size);
    await button(page, '3/4').click();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
      `horizontal overflow at ${size.width}`,
    );
    assert.equal(await button(page, 'Focus').isVisible(), true);
    await shortcuts.locator('summary').click();
    assert.equal(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= window.innerWidth,
      ),
      true,
      `shortcut help overflow at ${size.width}`,
    );
    await shortcuts.locator('summary').click();
    await shot(page, `workspace-${size.width}`);
  }
  record(
    'desktop, laptop, compact, and narrow fallback layouts without page overflow',
  );
  // Release software WebGL resources before testing independent sessions.
  await browser.close();
  browser = await launchBrowser();

  const reduced = await browser.newPage({
    viewport: { width: 1366, height: 900 },
    reducedMotion: 'reduce',
  });
  observe(reduced);
  await reduced.goto(url, { waitUntil: 'networkidle' });
  await button(reduced, 'Begin practice').click();
  assert.equal(await button(reduced, 'Play').isVisible(), true);
  await button(reduced, 'Play').click();
  assert.equal(await button(reduced, 'Pause').isVisible(), true);
  await reduced.close();
  record('reduced-motion starts paused and permits deliberate playback');
  await browser.close();
  browser = await launchBrowser();

  const restricted = await browser.newPage({
    viewport: { width: 1366, height: 900 },
  });
  observe(restricted);
  await restricted.addInitScript(() => {
    for (const method of ['getItem', 'setItem'])
      Storage.prototype[method] = () => {
        throw new DOMException(
          'Simulated storage restriction',
          'SecurityError',
        );
      };
  });
  await restricted.goto(url, { waitUntil: 'networkidle' });
  await button(restricted, 'Begin practice').click();
  await button(restricted, 'Next drill').click();
  await title(restricted, 'Lazy Flutter');
  await button(restricted, 'Mark mastered').click();
  assert.equal(
    await restricted
      .locator('[role="progressbar"]')
      .getAttribute('aria-valuenow'),
    '1',
  );
  await restricted.close();
  record(
    'simulated storage denial preserves onboarding, navigation, and in-memory progress',
  );
  assert.deepEqual(errors, [], 'browser application or console errors');
  assert.deepEqual(failures, [], 'failed asset responses');
  await writeFile(
    join(output, 'verdict.json'),
    JSON.stringify(
      {
        passed: true,
        node: process.version,
        platform: process.platform,
        browser: await browser.version(),
        base: server.config.base,
        checks,
        errors,
        failures,
      },
      null,
      2,
    ),
  );
  console.log(`Browser acceptance passed. Evidence: ${output}`);
} catch (error) {
  if (activePage && !activePage.isClosed()) {
    await shot(activePage, 'failure').catch(() => {});
  }
  await writeFile(
    join(output, 'verdict.json'),
    JSON.stringify(
      { passed: false, checks, errors, failures, error: String(error) },
      null,
      2,
    ),
  );
  throw error;
} finally {
  await browser?.close();
  await new Promise((resolveClose, reject) =>
    server.httpServer.close((error) =>
      error ? reject(error) : resolveClose(),
    ),
  );
}
