import { test, expect } from "@playwright/test";
import { openDashboard } from "../helpers/dashboardAccessHelper";
import dotenv from "dotenv";
import { createRandomCustomer } from "../helpers/customerSetup";
import { upgradeFreeToPaidPlan } from "../helpers/upgradeFreeToPaidPlan";
dotenv.config();

test("User can upgrade from Free to Advanced plan", async ({ page }) => {
  const { intpcId, intpWebsiteId } = await createRandomCustomer();

  await openDashboard(page, intpcId, intpWebsiteId);

  await upgradeFreeToPaidPlan(
    page,
    'Advanced',
    'Advanced 27,500 Monthly',
    '€24.99Monthly'
  );

  // Assert that the upgraded credits are visible in the dashboard
  await expect(page.getByText('27,500')).toBeVisible();
});
