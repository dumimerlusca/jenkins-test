import { test, expect } from "@playwright/test";
import { openDashboard } from "../helpers/dashboardAccessHelper";
import dotenv from "dotenv";
import {
  createTestCustomer,
  createRandomCustomer,
} from "../helpers/customerSetup";
import { upgradePlan } from "../helpers/upgradeHelper";
import { fillStripeCard } from "../helpers/stripeHelper";
dotenv.config();

test("User can upgrade from Free to Basic to Advanced plan", async ({
  page,
  context,
}) => {
  let { intpcId, intpWebsiteId } = await createRandomCustomer();

  // Step 1: Go to dashboard
  await openDashboard(page, intpcId, intpWebsiteId);

  // Step 2: Select the new plan
  await upgradePlan(
    page,
    "Basic",
    "11,000 Monthly Page",
    "€12.99Monthly"
  );

  // Step 3: Fill in required fields
  await page.getByRole("button", { name: "Country*" }).click();
  await page.getByTestId("form-upgrade-plan-country").type("Germany");
  await page.locator("#DE").click();

  // Confirm email is autofilled
  await page
    .locator("div")
    .filter({ hasText: /^Email\*$/ })
    .nth(2)
    .click();

  // Step 4: Click Upgrade
  await page.getByRole("button", { name: "Upgrade now!" }).click();
  // await page.waitForURL('**/upgrade');

  // Step 5: Stripe payment form
  const stripe = page.frameLocator('iframe[name="embedded-checkout"]');

  await expect(
    stripe
      .getByTestId("product-summary")
      .locator("div")
      .filter({ hasText: "€12.99per month" })
      .nth(3)
  ).toBeVisible();

  await fillStripeCard(stripe);

  // Step 6: Success message 
  await expect(page.getByText('Success!The subscription was')).toBeVisible();
  await page.getByRole('button', { name: 'To Main Dashboard' }).click();
  await page.waitForURL('**/dashboard/overview*', { timeout: 15000 });
  await page.waitForTimeout(3000); // Wait for the page to load
  // Check that the new plan is visible
  await expect(page.getByText("11,000")).toBeVisible();

  // Step 7: Upgrade to Advanced plan
  await page.getByText("Click for details").click();
  await page.getByRole("button", { name: "Increase your limits" }).click();
  await page.waitForURL("**/upgrade*");
  await expect(page.getByText('Advanced')).toBeVisible();
  await expect(page.getByText('€24.99Monthly')).toBeVisible();

  // Step 9: Click Upgrade
  await page.getByRole("button", { name: "Upgrade now!" }).click();
  await page.waitForURL("**/upgrade*");
  await page.waitForTimeout(5000); // Wait for the page to load

  // Step 10: Stripe payment form
  await page.getByRole("button").nth(2).click();

  await expect(page.getByText("-€")).toBeVisible();
  await expect(page.getByText("€24.99")).toBeVisible();
  await page.getByRole("button", { name: "Change subscription" }).click();
  await page.waitForTimeout(6000); // Wait for the payment to process

  // Step 11: Success message
  await expect(page.getByText('Success!The subscription was')).toBeVisible();
  await page.getByRole('button', { name: 'To Main Dashboard' }).click();
  await page.waitForURL('**/dashboard/overview*', { timeout: 15000 });
  await page.waitForTimeout(3000); // Wait for the page to load
  // Check that the new plan is visible
  await expect(page.getByText("27,500")).toBeVisible({ timeout: 30000 });
});
