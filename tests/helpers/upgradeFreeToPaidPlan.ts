import { Page, expect } from '@playwright/test';
import { fillStripeCard } from './stripeHelper';

export async function upgradeFreeToPaidPlan(page: Page, planName: string, planLabel: string, priceLabel: string) {
  // Step 1: Start upgrade flow from dashboard
  await page.getByText("Click for details").click();
  await page.getByRole("button", { name: "Increase your limits" }).click();
  await page.waitForURL("**/upgrade*");

  // Step 2: Select plan
  await page.getByRole("button", { name: "Free 440 Monthly Page" }).click();
  await page.getByText(planLabel).click(); // e.g. "Executive 330,000 Monthly"
  await expect(page.getByText(planName)).toBeVisible(); // e.g. "Executive"
  await expect(page.getByText(priceLabel)).toBeVisible(); // e.g. "€229.00Monthly"

  // Step 3: Fill country
  await page.getByRole('button', { name: 'Country*' }).click();
  await page.getByTestId('form-upgrade-plan-country').type('Germany');
  await page.locator('#DE').click();

  // Confirm email is autofilled (safe fallback)
  await page.locator('div').filter({ hasText: /^Email\*$/ }).nth(2).click();

  // Step 4: Click Upgrade
  await page.getByRole('button', { name: 'Upgrade now!' }).click();

  // Step 5: Stripe checkout
  const stripe = page.frameLocator('iframe[name="embedded-checkout"]');
  await expect(
    stripe.getByTestId('product-summary').locator('div').filter({ hasText: `${priceLabel.replace("Monthly", "per month")}` }).nth(3)
  ).toBeVisible();
  await fillStripeCard(stripe);

  // Step 6: Post-upgrade verification
  await expect(page.getByText('Success!The subscription was')).toBeVisible();
  await page.getByRole('button', { name: 'To Main Dashboard' }).click();
  await page.waitForURL('**/dashboard/overview*', { timeout: 15000 });
  await page.waitForTimeout(3000); // Wait for the page to load
}
