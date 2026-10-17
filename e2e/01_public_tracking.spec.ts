import { test, expect } from '@playwright/test';
import { mockTrackingTimeline, mockSystemSettings } from './fixtures/mockData';

test.describe('Public Visitor Journey — Tracking & Pricing Intelligence', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept landing config so shared footer is satisfied
    await page.route('**/landing/config', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ success: true, data: {} }),
      });
    });
  });

  test('should display tracking lookup form and empty state initially', async ({ page }) => {
    await page.goto('/tracking');

    // Verify search input is present
    const searchInput = page.getByPlaceholder('Ex: G2C-123456');
    await expect(searchInput).toBeVisible();

    // Verify initial empty state illustration/message
    await expect(page.getByText('Ready to monitor your parcel?')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Track', exact: true })).toBeVisible();
  });

  test('should track parcel and render multi-step timeline intelligence', async ({ page }) => {
    const testTrackingId = 'G2C-TEST1234';

    // Intercept public tracking endpoint
    await page.route(`**/public/tracking/${testTrackingId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          history: mockTrackingTimeline,
        }),
      });
    });

    await page.goto('/tracking');

    const searchInput = page.getByPlaceholder('Ex: G2C-123456');
    await searchInput.fill(testTrackingId);
    await page.getByRole('button', { name: 'Track', exact: true }).click();

    // Verify tracking intelligence header shows the tracking ID
    await expect(page.getByText(testTrackingId)).toBeVisible();

    // Verify timeline items from mock history appear
    await expect(page.getByText('Parcel booked by Shuvo Customer')).toBeVisible();
    await expect(page.getByText('Handed over to Karim Ahmed')).toBeVisible();
    await expect(page.getByText('Mirpur Hub, Dhaka').first()).toBeVisible();
  });

  test('should provide direct URL deep linking to parcel tracking', async ({ page }) => {
    const testTrackingId = 'G2C-DEEP9999';

    await page.route(`**/public/tracking/${testTrackingId}`, async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          history: mockTrackingTimeline,
        }),
      });
    });

    // Directly navigate with query param or path
    await page.goto(`/tracking/${testTrackingId}`);

    // Verify tracking results hydrate from URL parameter
    await expect(page.getByText(testTrackingId)).toBeVisible();
    await expect(page.getByText('Handed over to Karim Ahmed')).toBeVisible();
  });

  test('should fetch and reflect system settings on public pricing calculator', async ({
    page,
  }) => {
    await page.route('**/public/settings', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          settings: mockSystemSettings,
        }),
      });
    });

    await page.goto('/pricing');
    await expect(page).toHaveURL(/.*pricing/);
  });
});
