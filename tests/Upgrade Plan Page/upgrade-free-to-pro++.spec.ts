import { expect, test } from "@playwright/test";
import { openDashboard } from "../helpers/dashboardAccessHelper";
import { createRandomCustomer } from "../helpers/customerSetup";
import { upgradeFreeToPaidPlan } from "../helpers/upgradeFreeToPaidPlan";

test("User can upgrade from Free to Pro++ plan", async ({ page }) => {
  const { intpcId, intpWebsiteId } = await createRandomCustomer();
  await openDashboard(page, intpcId, intpWebsiteId);

  await upgradeFreeToPaidPlan(
    page,
    "Pro ++",
    "Pro ++ 220,000 Monthly Credits",
    "€154.00Monthly"
  );

  // Assert that the upgraded credits are visible in the dashboard
  await expect(page.getByText("220,000")).toBeVisible();
});
