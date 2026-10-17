import { test, expect } from '@playwright/test';
import { setupMockAuth } from './fixtures/auth.fixture';
import {
  mockPendingParcel,
  mockAvailableRiders,
  mockTrackingTimeline,
} from './fixtures/mockData';

test.describe('The Unified Golden Journey — Complete Parcel Lifecycle', () => {
  const goldenTrackingId = 'G2C-GOLDEN99';

  test('should execute complete lifecycle: Booking -> Dispatch -> Pickup -> Delivery -> Tracking', async ({
    page,
  }) => {
    // ----------------------------------------------------
    // ACTOR 1: CUSTOMER BOOKS PARCEL
    // ----------------------------------------------------
    await setupMockAuth(page, 'user');

    await page.route('**/parcels*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            id: 'parcel-golden-id',
            data: {
              ...mockPendingParcel,
              trackingId: goldenTrackingId,
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [{ ...mockPendingParcel, trackingId: goldenTrackingId }],
          }),
        });
      }
    });

    await page.route('**/trackings', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });

    await page.goto('/addParcel');

    // Step 1: Details
    await page.getByPlaceholder('0.0').fill('3.0');
    await page
      .getByPlaceholder('e.g. Important documents, laptop, clothes...')
      .fill('Gram2City Organic Mangoes');
    await page.getByRole('button', { name: /Continue to Pickup Info/i }).click();

    // Step 2: Pickup
    await page.locator('input[name="senderContact"]').fill('01712345678');

    // Select sender region & district
    const regionTrigger = page.getByRole('combobox').filter({ hasText: /Select region/i });
    await regionTrigger.click();
    await page.getByRole('option', { name: 'Dhaka', exact: true }).click();

    const districtTrigger = page.getByRole('combobox').filter({ hasText: /Select district/i });
    await districtTrigger.click();
    await page.getByRole('option', { name: 'Dhaka', exact: true }).click();

    const hubTrigger = page.getByRole('combobox').filter({ hasText: /Select hub/i });
    if (await hubTrigger.isVisible()) {
      await hubTrigger.click();
      await page.getByRole('option', { name: 'Mirpur', exact: true }).click();
    }

    await page.locator('input[name="senderAddress"]').fill('House 10, Road 4, Mirpur-10, Dhaka');
    await page.getByRole('button', { name: /Continue to Delivery Info/i }).click();

    // Step 3: Destination
    await page.locator('input[name="receiverName"]').fill('Fatima Begum');
    await page.locator('input[name="receiverContact"]').fill('01812345678');

    // Select receiver region & district
    const receiverRegionTrigger = page.getByRole('combobox').filter({ hasText: /Select region/i });
    await receiverRegionTrigger.click();
    await page.getByRole('option', { name: 'Dhaka', exact: true }).click();

    const receiverDistrictTrigger = page.getByRole('combobox').filter({ hasText: /Select district/i });
    await receiverDistrictTrigger.click();
    await page.getByRole('option', { name: 'Dhaka', exact: true }).click();

    const receiverHubTrigger = page.getByRole('combobox').filter({ hasText: /Select hub/i });
    if (await receiverHubTrigger.isVisible()) {
      await receiverHubTrigger.click();
      await page.getByRole('option', { name: 'Dhanmondi', exact: true }).click();
    }

    await page.locator('input[name="deliveryAddress"]').fill('Plot 45, Road 27, Gulshan-2, Dhaka');

    // Open confirmation
    await page.getByRole('button', { name: /Calculate & Book Shipment/i }).click();
    await expect(page.getByText('Confirm Shipment Details')).toBeVisible();

    // Confirm booking
    await page.getByRole('button', { name: /Confirm & Book Shipment/i }).click();
    await expect(page).toHaveURL(/.*myParcels/, { timeout: 10000 });

    // ----------------------------------------------------
    // ACTOR 2: ADMIN DISPATCHES TO RIDER
    // ----------------------------------------------------
    await setupMockAuth(page, 'admin');

    await page.route('**/admin/all-parcels*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          parcels: [
            {
              ...mockPendingParcel,
              trackingId: goldenTrackingId,
              parcelName: 'Gram2City Organic Mangoes',
            },
          ],
        }),
      });
    });

    await page.route('**/riders*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAvailableRiders),
      });
    });

    let assignedSuccess = false;
    await page.route('**/parcels/*/assign', async (route) => {
      assignedSuccess = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            ...mockPendingParcel,
            trackingId: goldenTrackingId,
            delivery_status: 'assigned',
          },
        }),
      });
    });

    await page.goto('/dashboard/assignRider');
    await expect(page.getByText(goldenTrackingId)).toBeVisible();

    await page.getByRole('button', { name: 'Assign', exact: true }).click();
    await page.locator('select').selectOption(mockAvailableRiders[0]._id);
    await page.getByRole('button', { name: 'Confirm Assignment' }).click();

    expect(assignedSuccess).toBe(true);

    // ----------------------------------------------------
    // ACTOR 3: RIDER ACCEPTS & DELIVERS
    // ----------------------------------------------------
    await setupMockAuth(page, 'rider');

    const goldenParcelOnWay = {
      ...mockPendingParcel,
      trackingId: goldenTrackingId,
      delivery_status: 'on_the_way',
    };

    await page.route('**/rider/parcels*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          data: [goldenParcelOnWay],
        }),
      });
    });

    let deliveryFinished = false;
    await page.route('**/parcels/*/deliver', async (route) => {
      deliveryFinished = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Parcel delivered',
        }),
      });
    });

    await page.goto('/dashboard/pendingDeliveries');
    await page.getByRole('button', { name: /Mark as Delivered/i }).click();
    await page.getByRole('button', { name: /Yes, Delivered/i }).click();

    expect(deliveryFinished).toBe(true);

    // ----------------------------------------------------
    // ACTOR 4: PUBLIC VERIFIES FINAL DELIVERED STATE
    // ----------------------------------------------------
    await page.route(`**/public/tracking/${goldenTrackingId}`, async (route) => {
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
    await page.getByPlaceholder('Ex: G2C-123456').fill(goldenTrackingId);
    await page.getByRole('button', { name: 'Track', exact: true }).click();

    await expect(page.getByText(goldenTrackingId)).toBeVisible();
    await expect(page.getByText('Handed over to Karim Ahmed')).toBeVisible();
  });
});
