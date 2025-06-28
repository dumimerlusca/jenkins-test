import { FrameLocator, Locator, Page } from "@playwright/test";

export async function fillStripeCard(pageOrFrame: Locator | FrameLocator) {
  await pageOrFrame
    .getByRole("textbox", { name: "Card number" })
    .type("4242 4242 4242 4242", {
      delay: 100,
    });
  await pageOrFrame.getByRole("textbox", { name: "Expiration" }).type("12/34", {
    delay: 100,
  });
  await pageOrFrame.getByRole("textbox", { name: "CVC" }).type("123", {
    delay: 100,
  });
  await pageOrFrame
    .getByRole("textbox", { name: "Cardholder name" })
    .type("Camelia Test", { delay: 100 });
  await pageOrFrame.getByTestId("hosted-payment-submit-button").click();
}
