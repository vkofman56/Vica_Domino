/**
 * E2E tests using Playwright.
 *
 * These tests launch a real browser, serve index.html, and interact
 * with the game UI the way a player would.
 *
 * Run: npm run test:e2e
 * Headed: npm run test:e2e:headed
 */
const { test, expect } = require('@playwright/test');

// ---------------------------------------------------------------------------
// App launch
// ---------------------------------------------------------------------------
test.describe('App launch', () => {
  test('loads without errors and shows creator screen', async ({ page }) => {
    const errors = [];
    page.on('pageerror', err => errors.push(err.message));

    await page.goto('/');
    await expect(page.locator('#creator-screen')).toBeVisible();
    await expect(page.locator('#creator-screen h1')).toHaveText('Pinky-Math Domino');
    expect(errors).toEqual([]);
  });

  test('Games button navigates to intro screen', async ({ page }) => {
    await page.goto('/');
    await page.click('#creator-games-btn');
    await expect(page.locator('#intro-screen')).toBeVisible();
    await expect(page.locator('#creator-screen')).not.toBeVisible();
  });

  test('Play button navigates to start screen', async ({ page }) => {
    await page.goto('/');
    await page.click('#creator-games-btn');
    await page.click('#intro-play-btn');
    await expect(page.locator('#start-screen')).toBeVisible();
    await expect(page.locator('#intro-screen')).not.toBeVisible();
  });

  test('back arrow from intro screen returns to creator', async ({ page }) => {
    await page.goto('/');
    await page.click('#creator-games-btn');
    await page.click('#back-to-creator-btn');
    await expect(page.locator('#creator-screen')).toBeVisible();
  });

  test('back arrow from start screen returns to intro', async ({ page }) => {
    await page.goto('/');
    await page.click('#creator-games-btn');
    await page.click('#intro-play-btn');
    await page.click('#back-to-intro-btn');
    await expect(page.locator('#intro-screen')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Level selection
// ---------------------------------------------------------------------------
test.describe('Level selection', () => {
  test('three level buttons are visible', async ({ page }) => {
    await page.goto('/');
    await page.click('#creator-games-btn');
    await page.click('#intro-play-btn');
    const buttons = page.locator('.level-btn');
    await expect(buttons).toHaveCount(3);
  });

  test('clicking a level button highlights it', async ({ page }) => {
    await page.goto('/');
    await page.click('#creator-games-btn');
    await page.click('#intro-play-btn');

    const triangleBtn = page.locator('[data-level="triangle"]');
    await triangleBtn.click();
    await expect(triangleBtn).toHaveClass(/selected/);

    // Circle should no longer be selected
    const circleBtn = page.locator('[data-level="circle"]');
    await expect(circleBtn).not.toHaveClass(/selected/);
  });
});

// ---------------------------------------------------------------------------
// Player setup
// ---------------------------------------------------------------------------
test.describe('Player setup', () => {
  test('player count buttons are functional', async ({ page }) => {
    await page.goto('/');
    await page.click('#creator-games-btn');
    await page.click('#intro-play-btn');

    const playerBtns = page.locator('.player-btn');
    await expect(playerBtns.first()).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Find the Double gameplay
// ---------------------------------------------------------------------------
test.describe('Find the Double gameplay', () => {
  test('single player game can be started and played', async ({ page }) => {
    await page.goto('/');
    await page.click('#creator-games-btn');
    await page.click('#intro-play-btn');

    // Select 1 player
    await page.click('.player-btn[data-count="1"]');

    // Wait for name input to appear and start game
    await page.waitForSelector('#start-game-btn');
    await page.click('#start-game-btn');

    // Game screen should be visible
    await page.waitForSelector('#game-screen', { state: 'visible' });

    // Cards should be dealt — look for domino elements
    const dominoes = page.locator('.domino');
    await expect(dominoes.first()).toBeVisible({ timeout: 5000 });
  });

  test('keyboard controls work in game', async ({ page }) => {
    await page.goto('/');
    await page.click('#creator-games-btn');
    await page.click('#intro-play-btn');
    await page.click('.player-btn[data-count="1"]');
    await page.click('#start-game-btn');
    await page.waitForSelector('#game-screen', { state: 'visible' });
    await page.waitForSelector('.domino', { state: 'visible' });

    // Press key 1 — should trigger a card interaction (animation or sound)
    await page.keyboard.press('1');

    // Small wait for any animation/state change
    await page.waitForTimeout(500);

    // Game should still be running or in won state (valid interaction)
    const gameScreen = page.locator('#game-screen');
    await expect(gameScreen).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Create and Edit screen
// ---------------------------------------------------------------------------
test.describe('Create and Edit', () => {
  test('Create and Edit button opens card library', async ({ page }) => {
    await page.goto('/');
    await page.click('#creator-create-edit-btn');
    await expect(page.locator('#card-library-screen')).toBeVisible();
    await expect(page.locator('#creator-screen')).not.toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Responsive layout
// ---------------------------------------------------------------------------
test.describe('Responsive layout', () => {
  test('works on iPad landscape viewport', async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto('/');
    await expect(page.locator('#creator-screen')).toBeVisible();
    await expect(page.locator('#creator-screen h1')).toBeVisible();
  });

  test('works on iPad portrait viewport', async ({ page }) => {
    await page.setViewportSize({ width: 768, height: 1024 });
    await page.goto('/');
    await expect(page.locator('#creator-screen')).toBeVisible();
  });

  test('works on mobile viewport', async ({ page }) => {
    await page.setViewportSize({ width: 375, height: 812 });
    await page.goto('/');
    await expect(page.locator('#creator-screen')).toBeVisible();
    await expect(page.locator('#creator-games-btn')).toBeVisible();
  });
});

// ---------------------------------------------------------------------------
// Context menu disabled
// ---------------------------------------------------------------------------
test.describe('Security', () => {
  test('right-click context menu is prevented', async ({ page }) => {
    await page.goto('/');
    const prevented = await page.evaluate(() => {
      let wasPrevented = false;
      const handler = (e) => { wasPrevented = e.defaultPrevented; };
      document.addEventListener('contextmenu', handler);
      const event = new MouseEvent('contextmenu', { bubbles: true, cancelable: true });
      document.dispatchEvent(event);
      document.removeEventListener('contextmenu', handler);
      return wasPrevented;
    });
    expect(prevented).toBe(true);
  });
});
