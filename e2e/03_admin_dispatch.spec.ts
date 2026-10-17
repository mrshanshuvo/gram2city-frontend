import { test, expect } from '@playwright/test';
import { setupMockAuth } from './fixtures/auth.fixture';
import { mockPendingParcel, mockAvailableRiders } from './fixtures/mockData';

test.describe('Admin Fleet Journey — Pending Parcel Dispatch & Rider Assignment', () => {
  test.beforeEach(async ({ page }) => {
    // Authenticate as Admin
    await setupMockAuth(page, 'admin');

    // Mock admin parcels endpoint
    await page.route('**/admin/all-parcels*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          parcels: [mockPendingParcel],
        }),
      });
    });

    // Mock available riders endpoint
    await page.route('**/riders*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockAvailableRiders),
      });
    });

    // Mock tracking log creation
    await page.route('**/trackings', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
  });

  test('should render dispatch center and display pending parcels', async ({ page }) => {
    await page.goto('/dashboard/assignRider');

    // Header validation
    await expect(page.getByText('Dispatch Center')).toBeVisible();
    await expect(page.getByText('Assign pending parcels to available field riders')).toBeVisible();

    // Table content validation
    await expect(page.getByText(`ID: #${mockPendingParcel.trackingId}`).or(page.getByText(`#${mockPendingParcel.trackingId}`))).toBeVisible();
    await expect(page.getByText(mockPendingParcel.parcelName)).toBeVisible();
    await expect(page.getByText(`৳${mockPendingParcel.cost}`)).toBeVisible();
  });

  test('should open assignment modal, select available rider, and confirm dispatch', async ({
    page,
  }) => {
    let assignedRiderId = '';

    // Intercept assignment PATCH mutation
    await page.route('**/parcels/*/assign', async (route) => {
      const postData = route.request().postDataJSON();
      assignedRiderId = postData.riderId;

      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          data: {
            ...mockPendingParcel,
            delivery_status: 'assigned',
            assigned_rider: assignedRiderId,
          },
        }),
      });
    });

    await page.goto('/dashboard/assignRider');

    // Click Assign button in table row
    const assignBtn = page.getByRole('button', { name: 'Assign', exact: true });
    await expect(assignBtn).toBeVisible();
    await assignBtn.click();

    // Verify modal appears
    await expect(page.getByRole('heading', { name: 'Assign Rider', level: 3 })).toBeVisible();
    await expect(page.getByText(mockPendingParcel.parcelName).last()).toBeVisible();

    // Select rider from dropdown
    const riderSelect = page.locator('select');
    await expect(riderSelect).toBeVisible();
    await riderSelect.selectOption(mockAvailableRiders[0]._id);

    // Click confirm assignment
    const confirmBtn = page.getByRole('button', { name: 'Confirm Assignment' });
    await expect(confirmBtn).toBeEnabled();
    await confirmBtn.click();

    // Verify request payload matched rider ID
    expect(assignedRiderId).toBe(mockAvailableRiders[0]._id);
  });
});
