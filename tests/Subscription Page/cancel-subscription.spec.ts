import { test, expect } from "@playwright/test";
import { openDashboard } from "../helpers/dashboardAccessHelper";
import dotenv from "dotenv";
import { createRandomCustomer } from "../helpers/customerSetup";
import { goToSubscriptionPage } from "../helpers/subscriptionPageHelper";
import { upgradePlan } from "../helpers/upgradeHelper";
import { fillStripeCard } from "../helpers/stripeHelper";
dotenv.config();

test("Cancel subscription", async ({
  page,
  context,
}) => {
  let { intpcId, intpWebsiteId } = await createRandomCustomer();

  // Step 1: Go to dashboard
  await openDashboard(page, intpcId, intpWebsiteId);

  // Step 2: Select the new plan
  await upgradePlan(page, "Basic", "11,000 Monthly Page", "€12.99Monthly");

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

  // Step 6: Confirm upgrade
  await page.waitForURL("**/dashboard/overview*", { timeout: 15000 });
  await page.waitForTimeout(3000); // Wait for the page to load

  // Step 7: Check that the new plan is visible
  await expect(page.getByText("11,000")).toBeVisible();

  // Step 8: Navigate to Subscriptions page
  await goToSubscriptionPage(page);

  // Step 9: Verify that clicking the “Turn off auto-renewal” button opens the subscription cancellation modal
  await page.getByRole("button", { name: "Turn off auto-renewal" }).click();
  await page.getByRole("button", { name: "Cancel Subscription" }).click();
  // Listen for the popup and click the link in parallel
  const [stripePage1] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("button", { name: "Manage Payment Methods" }).click(),
  ]);

  // Step 10: Wait for it to load and assert the URL
  await stripePage1.waitForLoadState("domcontentloaded");
  await expect(stripePage1).toHaveURL(/billing\.stripe\.com/);
  await expect(
    stripePage1.getByText("Your subscription will be")
  ).toBeVisible();
  await expect(
    stripePage1.locator('[data-test="renew-subscription"]')
  ).toBeVisible();

  // Close the popup and return to original
  await stripePage1.close();
});
