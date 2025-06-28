import { test, expect } from "@playwright/test";
import { openDashboard } from "../helpers/dashboardAccessHelper";
import dotenv from "dotenv";
import {
  createTestCustomer,
  createRandomCustomer,
} from "../helpers/customerSetup";
import {
  goToSubscriptionPage,
  validateSubscriptionPage,
} from "../helpers/subscriptionPageHelper";
import { upgradePlan } from "../helpers/upgradeHelper";
import { fillStripeCard } from "../helpers/stripeHelper";
dotenv.config();

test("Subscription page displays correct details after upgrade", async ({
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

  // Step 8a: Verify that clicking the “+” button on the Current Plan section navigates to the Upgrade Plan page
  await page.locator("#current-plan").getByRole("button").first().click();
  await expect(page).toHaveURL(/.*\/upgrade/);
  await page.goBack();

  // Step 8b: Verify that clicking the edit icon opens the Stripe Billing management page in a new tab
  const [billingPage] = await Promise.all([
    context.waitForEvent("page"), // wait for a new tab
    page.locator("#current-plan").getByRole("link").getByRole("button").click(), // trigger the popup
  ]);
  await billingPage.waitForLoadState("domcontentloaded");
  await expect(billingPage).toHaveURL(/billing\.stripe\.com/);
  await expect(billingPage.getByText("Current subscription")).toBeVisible();
  await expect(
    billingPage.getByText('Payment method', { exact: true }).first()
  ).toBeVisible();  await billingPage.close(); // close the popup

  // Step 8c: Verify that clicking the “Turn off auto-renewal” button opens the subscription cancellation dialog
  await page.getByRole("button", { name: "Turn off auto-renewal" }).click();
  await expect(
    page.getByRole("button", { name: "Cancel Subscription" })
  ).toBeVisible();
  await page.getByRole("button", { name: "Go Back" }).click();

  // Step 8d: Verify that clicking “Manage Payment Methods” redirects to the Stripe Billing management page
  // Listen for the popup and click the link in parallel
  const [stripePage] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("button", { name: "Manage Payment Methods" }).click(),
  ]);

  // Wait for it to load and assert the URL
  await stripePage.waitForLoadState("domcontentloaded");
  await expect(stripePage).toHaveURL(/billing\.stripe\.com/);
  await expect(stripePage.getByText("Current subscription")).toBeVisible();
  await expect(
    stripePage.getByRole('link', { name: 'Add payment method', exact: true }).first()
  ).toBeVisible(); // Check for the payment method section

  // Close the popup and return to original
  await stripePage.close();

  // Step 8e: Verify that clicking the invoice link icon opens the Stripe Invoice page in a new tab
  const [invoicePage] = await Promise.all([
    context.waitForEvent("page"),
    page.getByTestId("generic-table-cell-url").getByRole("button").click(),
  ]);
  await invoicePage.waitForLoadState("domcontentloaded");
  await expect(invoicePage).toHaveURL(/invoice\.stripe\.com/);
  await expect(
    invoicePage.getByTestId('invoice-amount-post-payment').getByText('€')
  ).toBeVisible();
  await expect(invoicePage.getByRole('button', { name: 'Download invoice' })).toBeVisible(); // Check for the download invoice button
  await expect(invoicePage.getByTestId('download-invoice-receipt-pdf-button')).toBeVisible(); // Check for the download receipt button
  
  // Close the popup and return to original
  await invoicePage.close();

  // Step 9: Validate all sections in one call
  await validateSubscriptionPage(
    page,
    "Basic", // planName
    "11,000", // touchpoints
    "active", // status
    "Visa", // cardType
    "4242", // cardMask
    "Basic", // invoiceProduct
    "€12.99" // invoicePrice
  );
});
