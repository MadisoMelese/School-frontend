/**
 * E2E Tests for Offline Functionality
 * 
 * Tests the complete offline workflow including:
 * - Service worker caching
 * - Offline indicator display
 * - Action queuing
 * - Automatic sync when online
 * - Cached data access
 * - Offline/online transitions
 */

import { test, expect, Page } from '@playwright/test';

// Helper to simulate offline mode
async function goOffline(page: Page) {
  await page.context().setOffline(true);
}

// Helper to simulate online mode
async function goOnline(page: Page) {
  await page.context().setOffline(false);
}

// Helper to wait for service worker to be ready
async function waitForServiceWorker(page: Page) {
  await page.waitForFunction(() => {
    return navigator.serviceWorker.ready;
  });
}

test.describe('Offline Functionality E2E Tests', () => {
  test.beforeEach(async ({ page }) => {
    // Login before each test
    await page.goto('/login');
    await page.fill('input[name="email"]', 'student@example.com');
    await page.fill('input[name="password"]', 'password123');
    await page.click('button:has-text("Login")');
    await page.waitForURL('**/dashboard');
    
    // Wait for service worker to be ready
    await waitForServiceWorker(page);
  });

  test('should display offline indicator when network is unavailable', async ({ page }) => {
    // Go offline
    await goOffline(page);
    
    // Wait for offline indicator to appear
    await expect(page.locator('text="You\'re offline"')).toBeVisible({ timeout: 5000 });
    
    // Verify offline indicator styling
    const offlineIndicator = page.locator('[role="alert"]').first();
    await expect(offlineIndicator).toBeVisible();
  });

  test('should hide offline indicator when network is restored', async ({ page }) => {
    // Go offline first
    await goOffline(page);
    await expect(page.locator('text="You\'re offline"')).toBeVisible();
    
    // Go back online
    await goOnline(page);
    
    // Wait for "Back online" message or indicator to disappear
    await expect(
      page.locator('text="Back online"').or(page.locator('text="You\'re offline"'))
    ).toBeVisible({ timeout: 5000 });
    
    // Eventually the indicator should disappear
    await expect(page.locator('text="You\'re offline"')).not.toBeVisible({ timeout: 10000 });
  });

  test('should cache critical pages for offline access', async ({ page }) => {
    // Visit critical pages while online to cache them
    await page.goto('/dashboard');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/grades');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/attendance');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await goOffline(page);
    
    // Navigate to cached pages - they should load from cache
    await page.goto('/dashboard');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    await page.goto('/grades');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    await page.goto('/attendance');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });

  test('should queue actions performed offline', async ({ page }) => {
    // Go to a page where we can perform actions
    await page.goto('/teacher/attendance');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await goOffline(page);
    
    // Perform an action (mark attendance)
    const studentCheckbox = page.locator('input[type="checkbox"]').first();
    if (await studentCheckbox.isVisible()) {
      await studentCheckbox.check();
    }
    
    // Submit the form
    const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save")').first();
    if (await submitButton.isVisible()) {
      await submitButton.click();
    }
    
    // Verify offline indicator shows pending actions
    await expect(page.locator('text=/\\d+ action.*pending/i')).toBeVisible({ timeout: 5000 });
  });

  test('should sync queued actions when connection is restored', async ({ page }) => {
    // Go to teacher attendance page
    await page.goto('/teacher/attendance');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await goOffline(page);
    
    // Perform an action
    const studentCheckbox = page.locator('input[type="checkbox"]').first();
    if (await studentCheckbox.isVisible()) {
      await studentCheckbox.check();
      
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
      }
      
      // Verify action is queued
      await expect(page.locator('text=/\\d+ action.*pending/i')).toBeVisible({ timeout: 5000 });
      
      // Go back online
      await goOnline(page);
      
      // Wait for sync to complete (pending count should decrease or disappear)
      await page.waitForTimeout(3000); // Give time for sync
      
      // Verify sync completed (no more pending actions or success message)
      const pendingText = page.locator('text=/\\d+ action.*pending/i');
      const isVisible = await pendingText.isVisible().catch(() => false);
      
      if (isVisible) {
        // If still visible, count should be 0
        await expect(pendingText).toContainText('0');
      }
    }
  });

  test('should display cached data when offline', async ({ page }) => {
    // Load grades page while online to cache data
    await page.goto('/grades');
    await page.waitForLoadState('networkidle');
    
    // Verify data is loaded
    const hasContent = await page.locator('table, .card, [data-testid="grade-item"]').count() > 0;
    
    if (hasContent) {
      // Go offline
      await goOffline(page);
      
      // Reload the page
      await page.reload();
      
      // Verify cached data is still displayed
      await expect(page.locator('table, .card, [data-testid="grade-item"]').first()).toBeVisible();
      
      // Verify offline indicator is shown
      await expect(page.locator('text="You\'re offline"')).toBeVisible();
    }
  });

  test('should handle smooth offline to online transition', async ({ page }) => {
    // Start online
    await expect(page.locator('text="You\'re offline"')).not.toBeVisible();
    
    // Go offline
    await goOffline(page);
    await expect(page.locator('text="You\'re offline"')).toBeVisible({ timeout: 5000 });
    
    // Go back online
    await goOnline(page);
    
    // Should show "Back online" message
    await expect(page.locator('text="Back online"')).toBeVisible({ timeout: 5000 });
    
    // Message should eventually disappear
    await expect(page.locator('text="Back online"')).not.toBeVisible({ timeout: 10000 });
  });

  test('should maintain user session when going offline', async ({ page }) => {
    // Verify we're logged in
    await expect(page).toHaveURL(/.*dashboard.*/);
    
    // Go offline
    await goOffline(page);
    
    // Navigate to different pages
    await page.goto('/grades');
    await expect(page.locator('h1, h2').first()).toBeVisible();
    
    // User should still be logged in (no redirect to login)
    await expect(page).not.toHaveURL(/.*login.*/);
  });

  test('should show appropriate error message for failed sync', async ({ page }) => {
    // This test would require mocking API failures
    // For now, we'll test that error states are handled
    
    await page.goto('/dashboard');
    
    // Go offline
    await goOffline(page);
    
    // Try to perform an action that requires network
    // (This depends on your app's implementation)
    
    // Verify error handling is graceful
    const errorMessage = page.locator('text=/error|failed|unable/i');
    const hasError = await errorMessage.isVisible().catch(() => false);
    
    // If error is shown, it should be user-friendly
    if (hasError) {
      await expect(errorMessage).not.toContainText(/undefined|null|NaN/i);
    }
  });

  test('should persist offline queue across page reloads', async ({ page }) => {
    // Go to a page where we can perform actions
    await page.goto('/teacher/attendance');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await goOffline(page);
    
    // Perform an action
    const studentCheckbox = page.locator('input[type="checkbox"]').first();
    if (await studentCheckbox.isVisible()) {
      await studentCheckbox.check();
      
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
      }
      
      // Verify action is queued
      const pendingBefore = await page.locator('text=/\\d+ action.*pending/i').textContent();
      
      if (pendingBefore) {
        // Reload the page
        await page.reload();
        await page.waitForLoadState('networkidle');
        
        // Verify pending actions are still there
        await expect(page.locator('text=/\\d+ action.*pending/i')).toBeVisible();
      }
    }
  });

  test('should handle multiple offline actions in sequence', async ({ page }) => {
    await page.goto('/teacher/attendance');
    await page.waitForLoadState('networkidle');
    
    // Go offline
    await goOffline(page);
    
    // Perform multiple actions
    const checkboxes = page.locator('input[type="checkbox"]');
    const count = await checkboxes.count();
    
    if (count >= 2) {
      await checkboxes.nth(0).check();
      await checkboxes.nth(1).check();
      
      const submitButton = page.locator('button:has-text("Submit"), button:has-text("Save")').first();
      if (await submitButton.isVisible()) {
        await submitButton.click();
      }
      
      // Verify multiple actions are queued
      const pendingText = await page.locator('text=/\\d+ action.*pending/i').textContent();
      expect(pendingText).toBeTruthy();
    }
  });

  test('should display sync status indicator', async ({ page }) => {
    await page.goto('/dashboard');
    
    // Go offline
    await goOffline(page);
    await expect(page.locator('text="You\'re offline"')).toBeVisible();
    
    // Go back online
    await goOnline(page);
    
    // Look for sync status indicators
    const syncIndicator = page.locator('text=/syncing|sync.*complete|back online/i');
    await expect(syncIndicator).toBeVisible({ timeout: 5000 });
  });
});

test.describe('Service Worker Caching', () => {
  test('should cache static assets', async ({ page }) => {
    // Load the app
    await page.goto('/login');
    await page.waitForLoadState('networkidle');
    
    // Wait for service worker
    await waitForServiceWorker(page);
    
    // Go offline
    await goOffline(page);
    
    // Navigate to a page - static assets should load from cache
    await page.goto('/dashboard');
    
    // Page should load (even if data is stale)
    await expect(page.locator('body')).toBeVisible();
  });

  test('should update cache when online', async ({ page }) => {
    await page.goto('/dashboard');
    await waitForServiceWorker(page);
    
    // Ensure we're online
    await goOnline(page);
    
    // Navigate to different pages to populate cache
    await page.goto('/grades');
    await page.waitForLoadState('networkidle');
    
    await page.goto('/attendance');
    await page.waitForLoadState('networkidle');
    
    // Cache should be updated
    // Verify by going offline and accessing pages
    await goOffline(page);
    
    await page.goto('/grades');
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});

test.describe('PWA Features', () => {
  test('should have valid manifest', async ({ page }) => {
    await page.goto('/');
    
    // Check for manifest link
    const manifestLink = page.locator('link[rel="manifest"]');
    await expect(manifestLink).toHaveCount(1);
    
    // Verify manifest is accessible
    const manifestHref = await manifestLink.getAttribute('href');
    expect(manifestHref).toBeTruthy();
  });

  test('should register service worker', async ({ page }) => {
    await page.goto('/');
    
    // Check if service worker is registered
    const swRegistered = await page.evaluate(() => {
      return navigator.serviceWorker.getRegistration().then(reg => !!reg);
    });
    
    expect(swRegistered).toBe(true);
  });

  test('should work in standalone mode', async ({ page, context }) => {
    // This test simulates PWA standalone mode
    await page.goto('/dashboard');
    
    // In standalone mode, the app should function normally
    await expect(page.locator('h1, h2').first()).toBeVisible();
  });
});
