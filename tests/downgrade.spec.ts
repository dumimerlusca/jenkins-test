import { expect, test } from "@playwright/test";
import { openDashboard } from "./helpers/dashboardAccessHelper";
import { createRandomCustomer } from "./helpers/customerSetup";
import { upgradeFreeToPaidPlan } from "./helpers/upgradeFreeToPaidPlan";
import { goToSubscriptionPage } from "./helpers/subscriptionPageHelper";

test("User can upgrade from Free to Executive++ than downgrade to Basic plan", async ({
  page,
}) => {
  const { intpcId, intpWebsiteId } = await createRandomCustomer();
  await openDashboard(page, intpcId, intpWebsiteId);

  await upgradeFreeToPaidPlan(
    page,
    "Executive",
    "Executive ++ 1,100,000",
    "€699.00Monthly"
  );

  // Assert that the upgraded credits are visible in the dashboard
  await expect(page.getByText("1,100,000")).toBeVisible();

  // Step 2: Start downgrade from dashboard to Basic plan
  await page.getByText("Click for details").click();
  await page.getByRole("button", { name: "Increase your limits" }).click();

  // Step 3: Select the new plan to downgrade
  await page.getByRole("button", { name: "Unicorn 5,500,000 Monthly" }).click();
  await page.getByText("Basic 11,000 Monthly Credits").click();
  await expect(page.getByText("€12.99Monthly")).toBeVisible();
  await page.getByRole("button", { name: "Upgrade now!" }).click();

  // Step 4: Prorate for downgrade
  await page
    .getByRole("button", { name: "Change subscription" })
    .click({ force: true });

  // Step 5: Assert the success message
  await expect(page.getByText("Success!The subscription was")).toBeVisible();
  await page.getByRole("button", { name: "To Main Dashboard" }).click(); // Go back to the dashboard
  await page.waitForURL("**/dashboard/overview*", { timeout: 15000 });

  // Step 6: Navigate to the subscription page
  await goToSubscriptionPage(page);

  // Step 7: Assert that the subscription page displays the correct details after downgrade
  await expect(page.getByText("Update product")).toBeVisible();
  await expect(page.getByText("Executive ++ Monthly to Basic")).toBeVisible();
  await expect(
    page.getByRole("heading", { name: "Upcoming invoice" })
  ).toBeVisible();
  await expect(page.getByText("1 × Basic (at €12.99 / month)")).toBeVisible();
});
