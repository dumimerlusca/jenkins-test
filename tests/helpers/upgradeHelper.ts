import { Page, expect } from "@playwright/test";

export async function upgradePlan(
  page: Page,
  planName: string,
  detailLabel: string,
  expectedPriceLabel: string
) {
  // 1) Wait for and click the “Click for details” text
  const details = page.getByText("Click for details", { exact: true });
  await expect(details).toBeVisible({ timeout: 10_000 });
  await details.click();

  // 2) Wait for and click the “Increase your limits” button
  const increaseBtn = page.getByRole("button", {
    name: "Increase your limits",
  });
  await expect(increaseBtn).toBeVisible({ timeout: 10_000 });
  await increaseBtn.click();

  // 3) Wait for the Upgrade plan page URL
  await page.waitForURL("**/upgrade*");

  // 4) Select your target plan
  const toBtn = page.getByText(planName, { exact: true });
  await expect(toBtn).toBeVisible({ timeout: 10_000 });
  await toBtn.click();

  // 5) Assert that both the plan name and the new price show up
  await expect(page.getByText(planName, { exact: true }).first()).toBeVisible();
  await expect(page.getByRole("button", { name: detailLabel })).toBeVisible();
  await expect(
    page.getByText(expectedPriceLabel, { exact: true })
  ).toBeVisible();
}
