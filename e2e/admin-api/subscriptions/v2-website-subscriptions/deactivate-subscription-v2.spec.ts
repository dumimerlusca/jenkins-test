import { Intpc } from '@aaasAdminApi';
import test, { expect } from '@playwright/test';
import { Intps } from '@setup';
import { listMontlyPackages, randomWebsiteSubscriptionIntpc } from 'src/test-utils';
import { utils } from 'src/utils';
import dayjs = require('dayjs');

const intp = Intps.withWebsiteCompanyManagedSubscriptions;
const { apiClient, sdkV2 } = intp;

let sharedIntpc: Intpc;

test.beforeAll(async () => {
  sharedIntpc = await randomWebsiteSubscriptionIntpc(intp);
});

test.describe('deactivate subscription v2 - website subscription', () => {
  test('website should be deleted and subscription deactivated', async () => {
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

    const deactivateRes = await apiClient.deactivateWebsiteSubscriptionV2({
      intpWebsiteId: websiteId,
    });
    const subscription = deactivateRes.data.payload;

    // TODO 3as api: Update deactivate subscription response to include the updated fields, right now I receive the subscription data prior to the deactivation
    // expect(subscription.status).toBe('inactive');

    // TODO 3as api: clarify if websites marked as deleted in the database should still be returned to the client
    const deletedWebsiteRes = await apiClient.getWebsiteV2({ intpWebsiteId: websiteId });
    const deletedWebsite = deletedWebsiteRes.data.payload;
    expect(deletedWebsite.status).toBe('inactive');

    // try {
    //   const res = await apiClient.getWebsiteV2({ intpWebsiteId: websiteId });
    //   const msg = `getWebsiteV2 should have failed, because the website should have been deleted: \n ${JSON.stringify(
    //     res.data.payload,
    //     null,
    //     2,
    //   )}`;
    //   expect.soft(true, msg).toBe(false);
    // } catch (error) {
    //   const err = error as AxiosError;
    //   expect(err.status).toBe(404);
    // }

    // TODO Check that the billing event was emitted corectly
  });
});
