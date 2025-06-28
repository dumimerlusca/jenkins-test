import { test, expect } from '@playwright/test';
import { openDashboard } from '../helpers/dashboardAccessHelper';
import dotenv from 'dotenv';
import { createTestCustomer, createRandomCustomer } from '../helpers/customerSetup';
dotenv.config();

test('User can upgrade from Free to Basic yearly plan', async ({ page }) => {

  let {intpcId, intpWebsiteId} = await createRandomCustomer()

  // Step 1: Go to dashboard
  await openDashboard(page, intpcId, intpWebsiteId);
  await expect(page).toHaveURL(/.*\/dashboard\/overview/);

  // Step 2: Start upgrade from dashboard
  await page.getByText('Click for details').click();
  await page.getByRole('button', { name: 'Increase your limits' }).click();
  await page.waitForURL('**/upgrade*');

  // Step 3: Select the new plan
  await expect(page.getByText('Basic')).toBeVisible();
  await page.getByText('Yearly · You Save 20%').click();
  await expect(page.getByText('-20%€12.99€10.39Monthly')).toBeVisible();

  // Step 4: Fill in required fields
  await page.getByRole('button', { name: 'Country*' }).click();
  await page.getByTestId('form-upgrade-plan-country').type('Germany');
  await page.locator('#DE').click();

  // Confirm email is autofilled
  await page.locator('div').filter({ hasText: /^Email\*$/ }).nth(2).click();

  // Step 5: Click Upgrade
  await page.getByRole('button', { name: 'Upgrade Now & Save 20%' }).click();
  // await page.waitForURL('**/upgrade');

  // Step 6: Stripe payment form
  const stripe = page.frameLocator('iframe[name="embedded-checkout"]');

  await expect(
    stripe.getByTestId('product-summary').locator('div').filter({ hasText: '€124.68per year' }).nth(3)
  ).toBeVisible();

  await stripe.getByRole('textbox', { name: 'Card number' }).type('4242 4242 4242 4242');
  await stripe.getByRole('textbox', { name: 'Expiration' }).type('12/34');
  await stripe.getByRole('textbox', { name: 'CVC' }).type('123');
  await stripe.getByRole('textbox', { name: 'Cardholder name' }).type('Camelia Test');

  await stripe.getByTestId('hosted-payment-submit-button').click();

  // Step 7: Success message
  await expect(page.getByText('Success!The subscription was')).toBeVisible();
  await page.getByRole('button', { name: 'To Main Dashboard' }).click();
  await page.waitForURL('**/dashboard/overview*', { timeout: 15000 });
  await page.waitForTimeout(3000); // Wait for the page to load
  // Check that the new plan is visible
  await expect(page.getByText('11,000')).toBeVisible();
});
