import { Intpc } from '@aaasAdminApi';
import test, { expect } from '@playwright/test';
import { Intps } from '@setup';
import { getFreePackage, listMontlyPackages, randomWebsiteSubscriptionIntpc } from 'src/test-utils';
import { utils } from 'src/utils';
import dayjs = require('dayjs');

const intp = Intps.withWebsiteCompanyManagedSubscriptions;
const { apiClient, sdkV2 } = intp;

let sharedIntpc: Intpc;

test.beforeAll(async () => {
  sharedIntpc = await randomWebsiteSubscriptionIntpc(intp);
});

test.describe('cancel subscription v2 - website subscription (cancel = deactivating auto renewal and not immediate cancel)', () => {
  test('cancelation should be successfull and should schedule downgrade to free plan when subscription is canceled', async () => {
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

    const freePackage = await getFreePackage(intp);

    const cancelRes = await apiClient.cancelWebsiteSubscriptionV2({
      intpWebsiteId: websiteId,
    });

    const subscription = cancelRes.data.payload;

    expect(subscription.packageId).toBe(initialPackage.id);
    expect(subscription.status).toBe('canceled');

    expect(subscription.plannedDowngradePackageId).toBe(freePackage.id);

    // should remain unchanged
    expect(website.stpResetAt).toBe(subscription.stpResetAt);
    expect(website.expiresAt).toBe(subscription.expiresAt);

    // TODO Check that the billing event was emitted corectly
  });
});
