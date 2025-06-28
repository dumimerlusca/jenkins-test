import test from '@playwright/test';
import { Intps } from '@setup';
import { assertIntpcToBeDeleted, listMontlyPackages, randomClientSubscriptionIntpc } from 'src/test-utils';
import { utils } from 'src/utils';
import dayjs = require('dayjs');

const intp = Intps.withCustomerSubscriptions;
const { apiClient } = intp;

test.describe('deactivate subscription v3 - intpc subscription', () => {
  test('website & intpc should be deleted and subscription deactivated', async () => {
    const packages = await listMontlyPackages(intp);
    const initialPackage = packages[4];
    const websiteId = utils.randomUUID();

    const intpc = await randomClientSubscriptionIntpc(intp, { packageId: initialPackage.id, intpWebsiteId: websiteId });

    // TODO 3as api: Update endpoint to send subscription info in the response
    const {
      data: { payload: subscription },
    } = await apiClient.deactivateIntpcSubscriptionV3({
      intpcId: intpc.intpCustomerId,
    });

    await assertIntpcToBeDeleted(intp, intpc.intpCustomerId);

    // TODO Check that the website was deleted as well
    // TODO Check that the subscription was deactivated

    // TODO Check that the billing event was emitted corectly
  });
});
