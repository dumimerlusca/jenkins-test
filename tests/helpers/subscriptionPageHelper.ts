import { Page, expect } from "@playwright/test";

// Go to subscription page
export async function goToSubscriptionPage(page: Page) {
  await page
    .locator("div:nth-child(13) > div > div > div:nth-child(4)")
    .click();
  await page.locator("div:nth-child(4) > div > a").click();
}

export async function validateCurrentPlanSection(
  page: Page,
  planName: string,
  touchpoints: string,
  status: string
) {
  // 1) Plan name alone
  await expect(page.getByText(planName).first()).toBeVisible();

  // 2a) Touchpoints number alone
  await expect(page.getByText(touchpoints).first()).toBeVisible();

  // 2b) Touchpoints label alone
  await expect(page.getByText("touchpoints")).toBeVisible();

  // 3) Status
  await expect(page.getByText(status).first()).toBeVisible();
}

// 4) Plan details
export async function validatePaymentMethodsSection(
  page: Page,
  cardType: string,
  cardMask: string
) {
  // Scope into the payment methods area
  const paymentSection = page.locator("#payment-method");
  await expect(paymentSection.getByText(cardType)).toBeVisible();
  await expect(paymentSection.getByText(cardMask)).toBeVisible();

  // Check for the "Manage Payment Methods" button
  await expect(
    paymentSection.getByRole("button", { name: "Manage Payment Methods" })
  ).toBeVisible();
}

// 5) Next billing date
export async function validateNextBillingDate(page: Page) {
  await expect(page.getByText(/Next billing date/i)).toBeVisible();
}

// 6) Invoices section
export async function validateInvoicesSection(
  page: Page,
  productName: string,
  price: string
) {
  await expect(page.getByRole("heading", { name: "Invoices" })).toBeVisible();
  await expect(page.getByText("Paid")).toBeVisible();

  // click row to open receipt
  await page
    .getByTestId("generic-table-cell-productName")
    .filter({ hasText: productName })
    .click();

  // assert on receipt details
  await expect(
    page.getByText(`× ${productName} (at ${price} / month)`)
  ).toBeVisible();
  await expect(page.getByText(price, { exact: true })).toBeVisible();
}

// 7) Validate all sections in one call
export async function validateSubscriptionPage(
  page: Page,
  planName: string,
  touchpoints: string,
  status: string,
  cardType: string,
  cardMask: string,
  invoiceProduct: string,
  invoicePrice: string
) {
  await validateCurrentPlanSection(page, planName, touchpoints, status);
  await validatePaymentMethodsSection(page, cardType, cardMask);
  await validateNextBillingDate(page);
  await validateInvoicesSection(page, invoiceProduct, invoicePrice);
}
