import { test, expect } from '@playwright/test';
import { setupMockAuth } from './fixtures/auth.fixture';
import { mockAssignedParcel } from './fixtures/mockData';

test.describe('Rider Journey — Delivery Acceptance & Status Transitions', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as Rider
    await setupMockAuth(page, 'rider');

    // Mock tracking log creation
    await page.route('**/trackings', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
  });

  test('should display assigned deliveries and transition status to picked up', async ({
    page,
  }) => {
    let pickTriggered = false;

    // Mock assigned parcels initially
    await page.route('**/rider/parcels', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [mockAssignedParcel],
        }),
      });
    });

    // Mock pick PATCH endpoint
    await page.route('**/parcels/*/pick', async (route) => {
      pickTriggered = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Parcel marked as picked up',
        }),
      });
    });

    await page.goto('/dashboard/pendingDeliveries');

    // Verify parcel card is rendered with tracking ID and name
    await expect(page.getByText(`ID: ${mockAssignedParcel.trackingId}`)).toBeVisible();
    await expect(page.getByText(mockAssignedParcel.parcelName)).toBeVisible();

    // Verify Mark as Picked button
    const pickBtn = page.getByRole('button', { name: /Mark as Picked/i });
    await expect(pickBtn).toBeVisible();
    await pickBtn.click();

    expect(pickTriggered).toBe(true);
  });

  test('should allow rider to complete delivery and confirm settlement', async ({ page }) => {
    let deliverTriggered = false;

    // Mock parcel already on the way
    const onTheWayParcel = {
      ...mockAssignedParcel,
      delivery_status: 'on_the_way',
    };

    await page.route('**/rider/parcels', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [onTheWayParcel],
        }),
      });
    });

    // Mock deliver PATCH endpoint
    await page.route('**/parcels/*/deliver', async (route) => {
      deliverTriggered = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Parcel marked as delivered',
        }),
      });
    });

    await page.goto('/dashboard/pendingDeliveries');

    // Click Mark as Delivered
    const deliverBtn = page.getByRole('button', { name: /Mark as Delivered/i });
    await expect(deliverBtn).toBeVisible();
    await deliverBtn.click();

    // Verify confirmation modal opens
    await expect(page.getByText('Confirm Delivery?')).toBeVisible();

    // Confirm delivery
    const yesDeliveredBtn = page.getByRole('button', { name: /Yes, Delivered/i });
    await expect(yesDeliveredBtn).toBeVisible();
    await yesDeliveredBtn.click();

    expect(deliverTriggered).toBe(true);
  });
});
