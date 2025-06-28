import { Intpc, SubscriptionV2 } from '@aaasAdminApi';
import test, { expect } from '@playwright/test';
import { Intps } from '@setup';
import { Package } from '@visitor-analytics/3as-sdk-v2';
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

test.describe('upgrade subscription v2 - website subscription', () => {
  test('should be able to immediate upgrade to a higher package', async () => {
    const packages = await listMontlyPackages(intp);
    const initialPackage = packages[0];
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

    const upgradeRes = await apiClient.upgradeWebsiteSubscriptionV2({
      intpWebsiteId: websiteId,
      packageId: newPackage.id,
    });

    const subscription = upgradeRes.data.payload;

    assertSuccessfullWebsiteSubscriptionUpgrade(subscription, newPackage);
  });

  test('should not be able to upgrade to a lower package', async () => {
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

    const newPackage = packages[1];

    try {
      await apiClient.upgradeWebsiteSubscriptionV2({
        intpWebsiteId: websiteId,
        packageId: newPackage.id,
      });

      expect.soft(true, 'upgradeWebsiteSubscriptionV2 should have failed').toBe(false);
    } catch (error) {
      const err = error as AxiosError;
      // TODO Update 3as api to return 400 status and not 500 error
      expect(err.status).toBe(500);
    }
  });

  test('should not be able to upgrade to the same package', async () => {
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
      await apiClient.upgradeWebsiteSubscriptionV2({
        intpWebsiteId: websiteId,
        packageId: initialPackage.id,
      });

      expect.soft(true, 'upgradeWebsiteSubscriptionV2 should have failed').toBe(false);
    } catch (error) {
      const err = error as AxiosError;
      // TODO Update 3as api to return 400 status and not 500 error
      expect(err.status).toBe(500);
    }
  });
});

test('should be possible to upgrade a canceled subscription', async () => {
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

  await apiClient.cancelWebsiteSubscriptionV2({ intpWebsiteId: websiteId });

  const newPackage = packages[4];

  const upgradeRes = await apiClient.upgradeWebsiteSubscriptionV2({
    intpWebsiteId: websiteId,
    packageId: newPackage.id,
  });

  assertSuccessfullWebsiteSubscriptionUpgrade(upgradeRes.data.payload, newPackage);
});

function assertSuccessfullWebsiteSubscriptionUpgrade(res: SubscriptionV2, newPackage: Package) {
  expect(res.packageId).toBe(newPackage.id);
  expect(res.status).toBe('active');
  expect(res.billingInterval).toBe(newPackage.period);
  expect(res.type).toBe('website');

  // expiresAt and stpResetAt should be updated to 1month from now
  const expectedDate = dayjs().add(1, 'month').format('YYYY-MM-DD');
  const actualExpiresAt = dayjs(res.expiresAt).format('YYYY-MM-DD');
  const actualStpResetAt = dayjs(res.stpResetAt).format('YYYY-MM-DD');

  expect(actualExpiresAt).toBe(expectedDate);
  expect(actualStpResetAt).toBe(expectedDate);

  // TODO Check that the billing event was emitted corectly
}
