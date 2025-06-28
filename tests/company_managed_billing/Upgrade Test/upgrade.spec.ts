import { test, expect } from '@playwright/test';
import { createRandomCustomer, upgradeWebsite } from '../helpers/CompanyManagedCustomerSetup';
import { openDashboard } from '../../company_managed_billing/helpers/dashboardAccessHelper';

test('User can upgrade from Free to Basic plan', async ({ page }) => {

  let {intpcId, intpWebsiteId} = await createRandomCustomer()

  // Upgrade the website to the Basic plan
  await upgradeWebsite(intpWebsiteId, process.env.INTP_COMPANY_MANAGED_PACKAGE_ID_BASIC);

  // Step 1: Go to dashboard
  await openDashboard(page, intpcId, intpWebsiteId);

  // Assert that the upgrade was successful
  await page.waitForURL('**/dashboard/overview*', { timeout: 15000 });
  // Check that the new plan is visible
  await expect(page.getByText('11,000')).toBeVisible();

  // Assert that the Current Plan name is visible
  await page.getByText('Click for details').click();
  const planName = 'Basic'; // Define the plan name
  await expect(page.getByText(planName, { exact: true }).first()).toBeVisible();
});
