import { Intpc, SubscriptionV2 } from '@aaasAdminApi';
import test, { expect } from '@playwright/test';
import { Intps } from '@setup';
import { utils } from '@utils';
import { Package } from '@visitor-analytics/3as-sdk-v2';
import { AxiosError } from 'axios';
import { listMontlyPackages, randomClientSubscriptionIntpc } from 'src/test-utils';
import dayjs = require('dayjs');

const intp = Intps.withCustomerSubscriptions;
const { apiClient } = intp;

let sharedIntpc: Intpc;

test.describe('upgrade subscription v3 - intpc subscription', () => {
  test('should be able to immediate upgrade to a higher package', async () => {
    const packages = await listMontlyPackages(intp);
    const initialPackage = packages[1];
    const websiteId = utils.randomUUID();

    const intpc = await randomClientSubscriptionIntpc(intp, { packageId: initialPackage.id, intpWebsiteId: websiteId });

    const {
      data: { payload: website },
    } = await apiClient.getWebsiteV2({ intpWebsiteId: websiteId });
    expect(website.packageId).toBe(initialPackage.id);
    expect(website.status).toBe('active');

    const newPackage = packages[3];
    const {
      data: { payload: subscription },
    } = await apiClient.upgradeIntpcSubscriptionV3({
      intpcId: intpc.intpCustomerId,
      packageId: newPackage.id,
    });

    assertSuccessfullIntpcSubscriptionUpgrade(subscription, newPackage);
  });

  test('should not be able to upgrade to a lower package', async () => {
    const packages = await listMontlyPackages(intp);
    const initialPackage = packages[3];
    const websiteId = utils.randomUUID();

    const intpc = await randomClientSubscriptionIntpc(intp, { packageId: initialPackage.id, intpWebsiteId: websiteId });

    const newPackage = packages[1];

    try {
      const res = await apiClient.upgradeIntpcSubscriptionV3({
        intpcId: intpc.intpCustomerId,
        packageId: newPackage.id,
      });

      const msg = `upgradeIntpcSubscriptionV3 should have failed, but got: \n ${JSON.stringify(
        res.data.payload,
        null,
        2,
      )}`;
      expect.soft(true, msg).toBe(false);
    } catch (error) {
      const err = error as AxiosError;
      // TODO 3as api: Update 3as api to return 400 status and not 500 error
      expect(err.status).toBe(500);
    }
  });

  test('should not be able to upgrade to the same package', async () => {
    const packages = await listMontlyPackages(intp);
    const initialPackage = packages[3];
    const websiteId = utils.randomUUID();

    const intpc = await randomClientSubscriptionIntpc(intp, { packageId: initialPackage.id, intpWebsiteId: websiteId });

    try {
      const res = await apiClient.upgradeIntpcSubscriptionV3({
        intpcId: intpc.intpCustomerId,
        packageId: initialPackage.id,
      });

      const msg = `upgradeIntpcSubscriptionV3 should have failed, but got: \n ${JSON.stringify(
        res.data.payload,
        null,
        2,
      )}`;
      expect.soft(true, msg).toBe(false);
    } catch (error) {
      const err = error as AxiosError;
      // TODO Update 3as api to return 400 status and not 500 error
      expect(err.status).toBe(500);
    }
  });
});

// TODO 3as api: Allow INTPC cancelled subscriptions to be upgraded
test.skip('should be possible to upgrade a canceled subscription', async () => {
  const packages = await listMontlyPackages(intp);
  const initialPackage = packages[2];
  const websiteId = utils.randomUUID();

  const intpc = await randomClientSubscriptionIntpc(intp, { packageId: initialPackage.id, intpWebsiteId: websiteId });

  await apiClient.cancelIntpcSubscriptionV3({ intpcId: intpc.intpCustomerId });

  const newPackage = packages[4];

  const upgradeRes = await apiClient.cancelIntpcSubscriptionV3({
    intpcId: intpc.intpCustomerId,
  });

  assertSuccessfullIntpcSubscriptionUpgrade(upgradeRes.data.payload, newPackage);
});

function assertSuccessfullIntpcSubscriptionUpgrade(res: SubscriptionV2, newPackage: Package) {
  expect(res.packageId).toBe(newPackage.id);
  expect(res.status).toBe('active');
  expect(res.billingInterval).toBe(newPackage.period);
  expect(res.type).toBe('intpc');

  // expiresAt and stpResetAt should be updated to 1month from now
  const expectedDate = dayjs().add(1, 'month').format('YYYY-MM-DD');
  const actualExpiresAt = dayjs(res.expiresAt).format('YYYY-MM-DD');
  const actualStpResetAt = dayjs(res.stpResetAt).format('YYYY-MM-DD');

  expect(actualExpiresAt).toBe(expectedDate);
  expect(actualStpResetAt).toBe(expectedDate);

  // TODO Check that the billing event was emitted corectly
}
