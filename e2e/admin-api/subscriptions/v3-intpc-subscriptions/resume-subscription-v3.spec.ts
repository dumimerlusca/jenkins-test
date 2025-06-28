import test, { expect } from '@playwright/test';
import { Intps } from '@setup';
import { AxiosError } from 'axios';
import { listMontlyPackages, randomClientSubscriptionIntpc } from 'src/test-utils';
import { utils } from 'src/utils';
import dayjs = require('dayjs');

const intp = Intps.withCustomerSubscriptions;
const { apiClient } = intp;

test.describe('resume subscription v3 - intpc subscription', () => {
  test('should be able to resume a cancelled subscription', async () => {
    const packages = await listMontlyPackages(intp);
    const initialPackage = packages[2];
    const websiteId = utils.randomUUID();

    const intpc = await randomClientSubscriptionIntpc(intp, { packageId: initialPackage.id, intpWebsiteId: websiteId });

    await apiClient.cancelIntpcSubscriptionV3({
      intpcId: intpc.intpCustomerId,
    });

    const {
      data: { payload: subscription },
    } = await apiClient.resumeIntpcSubscriptionV3({
      intpcId: intpc.intpCustomerId,
    });

    expect(subscription.packageId).toBe(initialPackage.id);
    expect(subscription.status).toBe('active');

    expect(subscription.plannedDowngradePackageId).toBeFalsy();

    // TODO Check that the billing event was emitted corectly
  });

  // TODO 3as admin: check panic inside subscription service
  test.skip('should throw error when trying to resume a subscription that is not cancelled', async () => {
    const packages = await listMontlyPackages(intp);
    const initialPackage = packages[2];
    const websiteId = utils.randomUUID();

    const intpc = await randomClientSubscriptionIntpc(intp, { packageId: initialPackage.id, intpWebsiteId: websiteId });

    try {
      const res = await apiClient.resumeIntpcSubscriptionV3({
        intpcId: intpc.intpCustomerId,
      });
      const msg = `resumeIntpcSubscriptionV3 should have failed, but got: \m ${JSON.stringify(
        res.data.payload,
        null,
        2,
      )}`;
      expect.soft(true, msg).toBe(false);
    } catch (error) {
      const err = error as AxiosError;
      // TODO 3as api: Update endpoint to send 400 bad request
      expect(err.status).toBe(500);
    }
  });
});
