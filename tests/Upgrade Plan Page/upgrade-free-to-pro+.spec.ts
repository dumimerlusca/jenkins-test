import { expect, test } from "@playwright/test";
import { openDashboard } from "../helpers/dashboardAccessHelper";
import { createRandomCustomer } from "../helpers/customerSetup";
import { upgradeFreeToPaidPlan } from "../helpers/upgradeFreeToPaidPlan";

test("User can upgrade from Free to Pro+ plan", async ({ page }) => {
  const { intpcId, intpWebsiteId } = await createRandomCustomer();
  await openDashboard(page, intpcId, intpWebsiteId);

  await upgradeFreeToPaidPlan(
    page,
    "Pro +",
    "Pro + 110,000 Monthly Credits",
    "€77.99Monthly"
  );

  // Assert that the upgraded credits are visible in the dashboard
  await expect(page.getByText("110,000")).toBeVisible();
});
