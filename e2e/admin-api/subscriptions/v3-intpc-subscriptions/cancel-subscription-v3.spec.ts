import test, { expect } from '@playwright/test';
import { Intps } from '@setup';
import { getFreePackage, listMontlyPackages, randomClientSubscriptionIntpc } from 'src/test-utils';
import { utils } from 'src/utils';
import dayjs = require('dayjs');

const intp = Intps.withCustomerSubscriptions;
const { apiClient } = intp;

test.describe('cancel subscription v3 - intpc subscription (cancel = deactivating auto renewal and not immediate cancel)', () => {
  test('cancelation should be successfull and should schedule downgrade to free plan when subscription is canceled', async () => {
    const packages = await listMontlyPackages(intp);
    const initialPackage = packages[4];
    const websiteId = utils.randomUUID();

    const intpc = await randomClientSubscriptionIntpc(intp, { packageId: initialPackage.id, intpWebsiteId: websiteId });

    const freePackage = await getFreePackage(intp);

    const {
      data: { payload: subscription },
    } = await apiClient.cancelIntpcSubscriptionV3({
      intpcId: intpc.intpCustomerId,
    });

    expect(subscription.packageId).toBe(initialPackage.id);
    expect(subscription.status).toBe('canceled');

    expect(subscription.plannedDowngradePackageId).toBe(freePackage.id);

    // TODO Check that the billing event was emitted corectly
  });
});
