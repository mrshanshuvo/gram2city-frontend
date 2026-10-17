import { Page } from '@playwright/test';
import {
  mockCustomerUser,
  mockAdminUser,
  mockRiderUser,
  mockSystemSettings,
  mockWarehouses,
} from './mockData';

export type UserRole = 'user' | 'admin' | 'rider';

export const getUserForRole = (role: UserRole) => {
  switch (role) {
    case 'admin':
      return mockAdminUser;
    case 'rider':
      return mockRiderUser;
    case 'user':
    default:
      return mockCustomerUser;
  }
};

/**
 * Injects authenticated session and intercepts base core endpoints
 * so tests can run isolated from external network dependencies.
 */
export async function setupMockAuth(page: Page, role: UserRole = 'user') {
  const user = getUserForRole(role);

  // Inject token in localStorage before initial DOM load
  await page.addInitScript((userData) => {
    window.localStorage.setItem('gram2city_jwt_token', `mock_jwt_token_${userData.role}`);
  }, user);

  // Mock standard auth check route
  await page.route('**/auth/me', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        user,
      }),
    });
  });

  // Mock settings
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

  // Mock warehouses / service centers (matches both /landing/warehouses and /warehouses)
  await page.route('**/landing/warehouses*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: mockWarehouses,
      }),
    });
  });

  await page.route('**/warehouses*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({
        success: true,
        data: mockWarehouses,
      }),
    });
  });

  // Mock messages for chat widget
  await page.route('**/messages*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  // Mock landing config for footer
  await page.route('**/landing/config', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: {} }),
    });
  });

  // Mock notifications to prevent polling network noise
  await page.route('**/notifications*', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, data: [] }),
    });
  });

  // Mock refresh token endpoint
  await page.route('**/auth/refresh', async (route) => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify({ success: true, token: `mock_jwt_token_${user.role}` }),
    });
  });
}
