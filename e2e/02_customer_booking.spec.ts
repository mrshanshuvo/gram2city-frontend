import { test, expect } from '@playwright/test';
import { setupMockAuth } from './fixtures/auth.fixture';
import { mockPendingParcel } from './fixtures/mockData';

test.describe('Customer / Merchant Journey — Multi-Step Parcel Booking', () => {
  test.beforeEach(async ({ page }) => {
    // Set up authenticated customer session
    await setupMockAuth(page, 'user');

    // Mock parcels API for booking and myParcels (handles query params)
    await page.route('**/parcels*', async (route) => {
      if (route.request().method() === 'POST') {
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            id: 'parcel-new-e2e-1',
            data: mockPendingParcel,
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify({
            success: true,
            data: [mockPendingParcel],
          }),
        });
      }
    });

    // Mock tracking creation log
    await page.route('**/trackings', async (route) => {
      await route.fulfill({
        status: 201,
        contentType: 'application/json',
        body: JSON.stringify({ success: true }),
      });
    });
  });

  test('should render booking wizard and validate required steps', async ({ page }) => {
    await page.goto('/addParcel');

    // Step 1: Check parcel details heading
    await expect(page.getByRole('heading', { name: 'Parcel Details' })).toBeVisible();
    await expect(page.getByText('What are you sending?')).toBeVisible();

    // Check live estimate panel is displayed
    await expect(page.getByText('Live Estimate')).toBeVisible();
  });

  test('should complete the 3-step booking flow and confirm order', async ({ page }) => {
    await page.goto('/addParcel');

    // --- STEP 1: Parcel Details ---
    const weightInput = page.getByPlaceholder('0.0');
    await weightInput.fill('2.5');

    const descInput = page.getByPlaceholder('e.g. Important documents, laptop, clothes...');
    await descInput.fill('Handloom Silk Sarees');

    // Click continue to Pickup Info
    const toPickupBtn = page.getByRole('button', { name: /Continue to Pickup Info/i });
    await toPickupBtn.click();

    // --- STEP 2: Pickup Info ---
    await expect(page.getByRole('heading', { name: 'Pickup Information' })).toBeVisible();

    const senderContact = page.getByPlaceholder('01XXXXXXXXX');
    await senderContact.fill('01712345678');

    // Select sender region
    const regionTrigger = page.getByRole('combobox').filter({ hasText: /Select region/i });
    await regionTrigger.click();
    await page.getByRole('option', { name: 'Dhaka', exact: true }).click();

    // Select sender district
    const districtTrigger = page.getByRole('combobox').filter({ hasText: /Select district/i });
    await districtTrigger.click();
    await page.getByRole('option', { name: 'Dhaka', exact: true }).click();

    // Select sender hub
    const hubTrigger = page.getByRole('combobox').filter({ hasText: /Select hub/i });
    if (await hubTrigger.isVisible()) {
      await hubTrigger.click();
      await page.getByRole('option', { name: 'Mirpur', exact: true }).click();
    }

    // Fill sender address
    const addressInput = page.getByPlaceholder('House #, Road #, Area...');
    await addressInput.fill('House 12, Road 5, Mirpur-10');

    // Click continue to Delivery Info
    const toDeliveryBtn = page.getByRole('button', { name: /Continue to Delivery Info/i });
    await toDeliveryBtn.click();

    // --- STEP 3: Delivery Info ---
    await expect(page.getByRole('heading', { name: 'Delivery Information' })).toBeVisible();

    const receiverNameInput = page.getByPlaceholder('Full name');
    await receiverNameInput.fill('Karim Ahmed');

    const receiverPhoneInput = page.getByPlaceholder('01XXXXXXXXX').last();
    await receiverPhoneInput.fill('01812345678');

    // Select receiver region
    const receiverRegionTrigger = page.getByRole('combobox').filter({ hasText: /Select region/i });
    await receiverRegionTrigger.click();
    await page.getByRole('option', { name: 'Dhaka', exact: true }).click();

    // Select receiver district
    const receiverDistrictTrigger = page.getByRole('combobox').filter({ hasText: /Select district/i });
    await receiverDistrictTrigger.click();
    await page.getByRole('option', { name: 'Dhaka', exact: true }).click();

    // Select receiver hub
    const receiverHubTrigger = page.getByRole('combobox').filter({ hasText: /Select hub/i });
    if (await receiverHubTrigger.isVisible()) {
      await receiverHubTrigger.click();
      await page.getByRole('option', { name: 'Dhanmondi', exact: true }).click();
    }

    const receiverAddressInput = page.getByPlaceholder('House #, Road #, Area...').last();
    await receiverAddressInput.fill('Plot 45, Road 27, Dhanmondi');

    // Submit the form to open confirmation modal
    const calculateBtn = page.getByRole('button', { name: /Calculate & Book Shipment/i });
    await calculateBtn.click();

    // --- Confirmation Dialog ---
    const confirmDialog = page.getByText('Confirm Shipment Details');
    await expect(confirmDialog).toBeVisible();

    // Confirm booking
    const confirmBtn = page.getByRole('button', { name: /Confirm & Book Shipment/i });
    await confirmBtn.click();

    // Verify redirection to myParcels
    await expect(page).toHaveURL(/.*myParcels/, { timeout: 10000 });
  });
});
