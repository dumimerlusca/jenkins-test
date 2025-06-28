import test, { expect } from '@playwright/test';
import { Intps } from '@setup';
import { AxiosError } from 'axios';
import { listMontlyPackages, randomClientSubscriptionIntpc } from 'src/test-utils';
import { utils } from 'src/utils';
import dayjs = require('dayjs');

const intp = Intps.withCustomerSubscriptions;
const { apiClient } = intp;

test.describe('downgrade subscription v3 - intpc subscription', () => {
  test('should be able to perform a scheduled downgrade', async () => {
    const packages = await listMontlyPackages(intp);
    const initialPackage = packages[4];
    const websiteId = utils.randomUUID();

    const intpc = await randomClientSubscriptionIntpc(intp, { packageId: initialPackage.id, intpWebsiteId: websiteId });

    const newPackage = packages[2];

    const {
      data: { payload: subscription },
    } = await apiClient.downgradeIntpcSubscriptionV3({
      intpcId: intpc.intpCustomerId,
      packageId: newPackage.id,
    });

    expect(subscription.packageId).toBe(initialPackage.id);
    expect(subscription.status).toBe('active');
    expect(subscription.plannedDowngradePackageId).toBe(newPackage.id);

    // TODO Check that the billing event was emitted corectly
  });

  test('should not be able to downgrade to a higher package', async () => {
    const packages = await listMontlyPackages(intp);
    const initialPackage = packages[2];
    const websiteId = utils.randomUUID();

    const intpc = await randomClientSubscriptionIntpc(intp, { packageId: initialPackage.id, intpWebsiteId: websiteId });

    const newPackage = packages[4];

    try {
      const res = await apiClient.downgradeIntpcSubscriptionV3({
        intpcId: intpc.intpCustomerId,
        packageId: newPackage.id,
      });

      const msg = `downgradeIntpcSubscriptionV3 should have failed, but got: \n ${JSON.stringify(
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

  // TODO 3as api: This should not be allowed in the api
  test.skip('should not be able to downgrade to the same package', async () => {
    const packages = await listMontlyPackages(intp);
    const initialPackage = packages[3];
    const websiteId = utils.randomUUID();

    const intpc = await randomClientSubscriptionIntpc(intp, { packageId: initialPackage.id, intpWebsiteId: websiteId });

    try {
      const res = await apiClient.downgradeIntpcSubscriptionV3({
        intpcId: intpc.intpCustomerId,
        packageId: initialPackage.id,
      });

      const msg = `downgradeIntpcSubscriptionV3 should have failed, but got: \n ${JSON.stringify(
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
});
