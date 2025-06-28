import { BrowserContext, FrameLocator, Locator, Page } from "@playwright/test";

export type PaymentCard = {
  number: string;
  exp: string;
  cvc: string;
};

export async function addPaymentMethodInBillingPortal(
  frame: Locator | FrameLocator,
  card: PaymentCard
) {
  await frame.getByRole("textbox", { name: "Card number" }).fill(card.number);
  await frame
    .getByRole("textbox", { name: "Expiration date MM / YY" })
    .fill(card.exp);
  await frame.getByRole("textbox", { name: "Security code" }).fill(card.cvc);
}

// Click PayPal inside the iframe
export async function addPaypalMethodInBillingPortal(
  frame: Locator | FrameLocator,
  page: Page
) {
  await frame.getByTestId("paypal").click();
  await page.getByTestId("confirm").click();
}

// Handle redirect after clicking PayPal "Add"
export async function authorizePaypalSetup(page: Page) {
  // Wait for PayPal test setup page
  await page.waitForURL("**/payment_methods/test_setup?**", { timeout: 15000 });

  // Click "Authorize Test Setup"
  await page.getByRole("link", { name: "Authorize Test Setup" }).click();
}
