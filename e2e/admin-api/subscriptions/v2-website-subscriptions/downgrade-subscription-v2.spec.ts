import { Intpc } from '@aaasAdminApi';
import test, { expect } from '@playwright/test';
import { Intps } from '@setup';
import { AxiosError } from 'axios';
import { listMontlyPackages, randomWebsiteSubscriptionIntpc } from 'src/test-utils';
import { utils } from 'src/utils';
import dayjs = require('dayjs');

const intp = Intps.withWebsiteCompanyManagedSubscriptions;
const { apiClient, sdkV2 } = intp;

let sharedIntpc: Intpc;

test.beforeAll(async () => {
  sharedIntpc = await randomWebsiteSubscriptionIntpc(intp);
});

test.describe('downgrade subscription v2 - website subscription', () => {
  test('should be able to perform a scheduled downgrade', async () => {
    const packages = await listMontlyPackages(intp);
    const initialPackage = packages[4];
    const websiteId = utils.randomUUID();

    const websiteRes = await apiClient.createWebsiteV2({
      domain: 'test.com',
      intpCustomerId: sharedIntpc.intpCustomerId,
      intpWebsiteId: websiteId,
      packageId: initialPackage.id,
    });
    const website = websiteRes.data.payload;

    expect(website.packageId).toBe(initialPackage.id);
    expect(website.status).toBe('active');

    const newPackage = packages[2];

    const upgradeRes = await apiClient.downgradeWebsiteSubscriptionV2({
      intpWebsiteId: websiteId,
      packageId: newPackage.id,
    });

    const subscription = upgradeRes.data.payload;

    expect(subscription.packageId).toBe(initialPackage.id);
    expect(subscription.status).toBe('active');

    expect(subscription.plannedDowngradePackageId).toBe(newPackage.id);

    // TODO Check that the billing event was emitted corectly
  });

  test('should not be able to downgrade to a higher package', async () => {
    const packages = await listMontlyPackages(intp);
    const initialPackage = packages[2];
    const websiteId = utils.randomUUID();

    const websiteRes = await apiClient.createWebsiteV2({
      domain: 'test.com',
      intpCustomerId: sharedIntpc.intpCustomerId,
      intpWebsiteId: websiteId,
      packageId: initialPackage.id,
    });
    const website = websiteRes.data.payload;

    expect(website.packageId).toBe(initialPackage.id);
    expect(website.status).toBe('active');

    const newPackage = packages[4];

    try {
      await apiClient.downgradeWebsiteSubscriptionV2({
        intpWebsiteId: websiteId,
        packageId: newPackage.id,
      });

      expect.soft(true, 'downgradeWebsiteSubscriptionV2 should have failed').toBe(false);
    } catch (error) {
      const err = error as AxiosError;
      // TODO 3as api: Update 3as api to return 400 status and not 500 error
      expect(err.status).toBe(500);
    }
  });

  // TODO 3as api: This should not be allowed in the api
  test.skip('should not be able to downgrade to the same package', async () => {
    const packages = await listMontlyPackages(intp);
    const initialPackage = packages[3];
    const websiteId = utils.randomUUID();

    const websiteRes = await apiClient.createWebsiteV2({
      domain: 'test.com',
      intpCustomerId: sharedIntpc.intpCustomerId,
      intpWebsiteId: websiteId,
      packageId: initialPackage.id,
    });
    const website = websiteRes.data.payload;

    expect(website.packageId).toBe(initialPackage.id);
    expect(website.status).toBe('active');

    try {
      const res = await apiClient.downgradeWebsiteSubscriptionV2({
        intpWebsiteId: websiteId,
        packageId: initialPackage.id,
      });

      expect.soft(true, 'downgradeWebsiteSubscriptionV2 should have failed').toBe(false);
    } catch (error) {
      const err = error as AxiosError;
      // TODO 3as api: Update 3as api to return 400 status and not 500 error
      expect(err.status).toBe(500);
    }
  });
});
