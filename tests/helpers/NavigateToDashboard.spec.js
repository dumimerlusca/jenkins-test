const { test, expect } = require('@playwright/test');
const { createTestCustomer } = require('./customerSetup');
const { openDashboard } = require('./dashboardAccessHelper');
require('dotenv').config();

test.beforeAll(async () => {
  if (process.env.CREATE_CUSTOMER === 'true') {
    await createTestCustomer();
  }
});

test('Dashboard loads correctly', async ({ page }) => {
  const response = await openDashboard(page);
  await expect(response.status()).toBe(200);

  
  // Assert we are on the dashboard URL
  await expect(page).toHaveURL(/.*\/dashboard\/overview/);
});
