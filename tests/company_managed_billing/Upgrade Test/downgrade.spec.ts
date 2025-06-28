import { expect, test } from "@playwright/test";
import {
  createRandomCustomer,
  downgradeWebsite,
  upgradeWebsite,
  sdk,
} from "../helpers/CompanyManagedCustomerSetup";

test("User can downgrade to a tier plan", async ({ page }) => {
  const { intpcId, intpWebsiteId } = await createRandomCustomer();

  // UPGRADE to Advanced plan
  await upgradeWebsite(
    intpWebsiteId,
    process.env.INTP_COMPANY_MANAGED_PACKAGE_ID_ADVANCED
  );

  // DOWNGRADE to Basic plan
  await downgradeWebsite(
    intpWebsiteId,
    process.env.INTP_COMPANY_MANAGED_PACKAGE_ID_BASIC
  );

  // Fetch the website details
  let website = await sdk.websites.getByIntpWebsiteId(intpWebsiteId);

  // Assert the website details (planned downgrade package and the expiration date)
  await expect(website.plannedDowngradePackageId).toEqual(process.env.INTP_COMPANY_MANAGED_PACKAGE_ID_BASIC)
});
