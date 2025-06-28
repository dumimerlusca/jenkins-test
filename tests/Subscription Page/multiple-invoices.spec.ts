import { test, expect } from "@playwright/test";
import { openDashboard } from "../helpers/dashboardAccessHelper";
import dotenv from "dotenv";
import {
  createTestCustomer,
  createRandomCustomer,
} from "../helpers/customerSetup";
import { upgradePlan } from "../helpers/upgradeHelper";
import { fillStripeCard } from "../helpers/stripeHelper";
import { goToSubscriptionPage } from "../helpers/subscriptionPageHelper";
dotenv.config();

test("User can verify multiple invoices on Subscription Page", async ({
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
  // Check that the new plan is visible
  await expect(page.getByText("11,000")).toBeVisible();

  // Step 7: Upgrade to Advanced plan
  await page.getByText("Click for details").click();
  await page.getByRole("button", { name: "Increase your limits" }).click();
  await page.waitForURL("**/upgrade*");
  await expect(page.getByText("Advanced")).toBeVisible();
  await expect(page.getByText("€24.99Monthly")).toBeVisible();

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

  // Step 11: Confirm upgrade
  await page.waitForURL(/.*\/dashboard\/overview.*/, { timeout: 60000 });
  await page.reload();
  // Check that the new plan is visible
  await expect(page.getByText("27,500")).toBeVisible({ timeout: 30000 });

  // Step 12: Navigate to Subscription page
  await goToSubscriptionPage(page);

  // Step 13: Verify that clicking the invoice link icon opens the Stripe Invoice page in a new tab
  const invoiceButtons = page
    .locator('[data-testid="generic-table-cell-url"]')
    .getByRole("button");

  // Check if the invoice buttons are visible
  const count = await invoiceButtons.count();
  for (let i = 0; i < count; i++) {
    const btn = invoiceButtons.nth(i);

    // open the invoice in a new tab
    const [invoicePage] = await Promise.all([
      context.waitForEvent("page"),
      btn.click(),
    ]);

    // wait for the Stripe invoice UI
    await invoicePage.waitForLoadState("domcontentloaded");
    await expect(invoicePage).toHaveURL(/invoice\.stripe\.com/);

    // check that the invoice page is visible
    await expect(
      invoicePage.getByTestId("invoice-amount-post-payment")
    ).toBeVisible();

    // check that the "download invoice" button is visible
    await expect(
      invoicePage.getByRole("button", { name: "Download invoice" })
    ).toBeVisible();

    // check that the "download receipt" button is visible
    await expect(
      invoicePage.getByRole("button", { name: "Download receipt" })
    ).toBeVisible();

    // check that the "download invoice receipt PDF" button is visible
    await expect(
      invoicePage.getByTestId("download-invoice-receipt-pdf-button")
    ).toBeVisible();

    // close and go back to subscription page
    await invoicePage.close();
  }
});
