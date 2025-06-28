import { test, expect } from '@playwright/test';
import { openDashboard } from '../helpers/dashboardAccessHelper';
import dotenv from 'dotenv';
import { createTestCustomer, createRandomCustomer } from '../helpers/customerSetup';
import { upgradePlan } from "../helpers/upgradeHelper";
import { fillStripeCard } from "../helpers/stripeHelper";
dotenv.config();

test('User can upgrade from Free to Basic plan', async ({ page }) => {

  let {intpcId, intpWebsiteId} = await createRandomCustomer()

  // Step 1: Go to dashboard
  await openDashboard(page, intpcId, intpWebsiteId);

  // Step 2: Start upgrade from dashboard
  await upgradePlan(page, "Basic", "11,000 Monthly Page", "€12.99Monthly");


  // Step 3: Fill in required fields
  await page.getByRole('button', { name: 'Country*' }).click();
  await page.getByTestId('form-upgrade-plan-country').type('Germany');
  await page.locator('#DE').click();

  // Confirm email is autofilled
  await page.locator('div').filter({ hasText: /^Email\*$/ }).nth(2).click();

  // Step 4: Click Upgrade
  await page.getByRole('button', { name: 'Upgrade now!' }).click();
  // await page.waitForURL('**/upgrade');

  // Step 5: Stripe payment form
  const stripe = page.frameLocator('iframe[name="embedded-checkout"]');

  await expect(
    stripe.getByTestId('product-summary').locator('div').filter({ hasText: '€12.99per month' }).nth(3)
  ).toBeVisible();

  await fillStripeCard(stripe);

  // Step 7: Confirm upgrade
  await expect(page.getByText('Success!The subscription was')).toBeVisible();
  await page.getByRole('button', { name: 'To Main Dashboard' }).click();
  await page.waitForURL('**/dashboard/overview*', { timeout: 15000 });
  await page.waitForTimeout(3000); // Wait for the page to load
  // Check that the new plan is visible
  await expect(page.getByText('11,000')).toBeVisible();
});
