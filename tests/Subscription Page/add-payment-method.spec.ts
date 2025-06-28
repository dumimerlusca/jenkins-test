import { test, expect } from "@playwright/test";
import { openDashboard } from "../helpers/dashboardAccessHelper"; // for dashboard access
import { createRandomCustomer } from "../helpers/customerSetup"; // for customer creation
import { goToSubscriptionPage } from "../helpers/subscriptionPageHelper"; // for subscription page
import { upgradePlan } from "../helpers/upgradeHelper"; // for upgrade plan
import { fillStripeCard } from "../helpers/stripeHelper"; // for checkout
import { addPaymentMethodInBillingPortal, authorizePaypalSetup } from "../helpers/paymentMethodHelper"; // for billing portal
import { AMEX, MASTERCARD } from "../testData/cards"; // for test cards
import {
  addPaypalMethodInBillingPortal,
} from "../helpers/paymentMethodHelper"; // for PayPal method

import dotenv from "dotenv";

dotenv.config();

test("Upgrade and add payment methods", async ({ page, context }) => {
  const { intpcId, intpWebsiteId } = await createRandomCustomer();

  // Step 1: Navigate to Dashboard and Upgrade Plan
  await openDashboard(page, intpcId, intpWebsiteId);
  await upgradePlan(page, "Basic", "11,000 Monthly Page", "€12.99Monthly");

  // Step 2: Fill in country (Germany)
  await page.getByRole("button", { name: "Country*" }).click();
  await page.getByTestId("form-upgrade-plan-country").type("Germany");
  await page.locator("#DE").click();

  // // Optional: confirm email field is focused
  // await expect(page.getByLabel("Email*")).toBeVisible();

  // Step 3: Click "Upgrade now!"
  await page.getByRole("button", { name: "Upgrade now!" }).click();

  // Step 4: Fill out Stripe Checkout
  const stripeCheckoutFrame = page.frameLocator(
    'iframe[name="embedded-checkout"]'
  );
  await expect(
    stripeCheckoutFrame.getByTestId("product-summary")
  ).toContainText("€12.99per month");
  await fillStripeCard(stripeCheckoutFrame);

  // Step 5: Confirm successful upgrade
  await page.waitForURL("**/dashboard/overview*", { timeout: 15000 });
  await expect(page.getByText("11,000")).toBeVisible();

  // Step 6: Navigate to Subscription page
  await goToSubscriptionPage(page);

  // Step 7: Click "Manage Payment Methods"
  const [stripeBillingPage] = await Promise.all([
    context.waitForEvent("page"),
    page.getByRole("button", { name: "Manage Payment Methods" }).click(),
  ]);

  await stripeBillingPage.waitForLoadState("domcontentloaded");

  // Step 8: Assert the Billing Portal page is open
  await expect(stripeBillingPage).toHaveURL(/billing\.stripe\.com/);
  await expect(
    stripeBillingPage.getByText("Current subscription")
  ).toBeVisible();

  // Step 9: Add a new payment method
  // Add AMEX
  await stripeBillingPage
    .getByRole("link", { name: "Add payment method" })
    .click();
  await stripeBillingPage.waitForTimeout(2000);
  const amexIframe = stripeBillingPage
    .frameLocator('iframe[name^="__privateStripeFrame"]')
    .first();
  await addPaymentMethodInBillingPortal(amexIframe, AMEX);
  await stripeBillingPage.getByTestId("confirm").click();
  await stripeBillingPage.waitForTimeout(2000);
  await expect(stripeBillingPage.getByText("Payment Methods")).toBeVisible();

  // Add MASTERCARD
  await stripeBillingPage
    .getByRole("link", { name: "Add payment method" })
    .click();
  await stripeBillingPage.waitForTimeout(2000);
  const mastercardIframe = stripeBillingPage
    .frameLocator('iframe[name^="__privateStripeFrame"]')
    .first();
  await addPaymentMethodInBillingPortal(mastercardIframe, MASTERCARD);
  await stripeBillingPage.getByTestId("confirm").click();
  await stripeBillingPage.waitForTimeout(2000);
  await expect(stripeBillingPage.getByText("Payment Methods")).toBeVisible();

  // Add PayPal method
  await stripeBillingPage
    .getByRole("link", { name: "Add payment method" })
    .click();
  await stripeBillingPage.waitForTimeout(2000);

  // Get the iframe and click PayPal
  const paypalIframe = stripeBillingPage
    .frameLocator('iframe[name^="__privateStripeFrame"]')
    .first();
  await addPaypalMethodInBillingPortal(paypalIframe, stripeBillingPage); // selects PayPal & clicks Add

  // Handle Stripe popup
  await authorizePaypalSetup(stripeBillingPage); // wait for redirect and authorize

  // Wait for confirmation and finish
  await stripeBillingPage.waitForTimeout(2000);

  // Step 10: Close the Billing Portal page
  await stripeBillingPage.close();

  // Step 11: Assert the new payment method is visible on the Subscription page
  await expect(
    page.getByRole("heading", { name: "Payment Methods" })
  ).toBeVisible();
  await page.reload(); // Reload the page to ensure the new payment method is displayed

  // Assert "Visa" is visible
  await expect(page.getByText("Visa", { exact: false })).toBeVisible();

  // Assert Amex (last 4 digits) and "Default" tag
  await expect(page.getByText("•••• 0005", { exact: false })).toBeVisible(); // Amex
  await expect(page.getByText("•••• 4444", { exact: false })).toBeVisible(); // Mastercard
  await expect(page.getByText('paypal', { exact: true })).toBeVisible(); // PayPal
  await expect(page.getByText("Visa", { exact: false })).toBeVisible(); // Visa/Default
});
