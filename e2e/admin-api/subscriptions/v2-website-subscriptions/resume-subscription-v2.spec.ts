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

test.describe('resume subscription v2 - website subscription', () => {
  test('should be able to resume a cancelled subscription', async () => {
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

    await apiClient.cancelWebsiteSubscriptionV2({
      intpWebsiteId: websiteId,
    });
    const resumeRes = await apiClient.resumeWebsiteSubscriptionV2({
      intpWebsiteId: websiteId,
    });
    const subscription = resumeRes.data.payload;

    expect(subscription.packageId).toBe(initialPackage.id);
    expect(subscription.status).toBe('active');

    expect(subscription.plannedDowngradePackageId).toBeFalsy();

    // should remain unchanged
    expect(website.stpResetAt).toBe(subscription.stpResetAt);
    expect(website.expiresAt).toBe(subscription.expiresAt);

    // TODO Check that the billing event was emitted corectly
  });

  test('should throw error when trying to resume a subscription that is not canceled', async () => {
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

    try {
      const res = await apiClient.resumeWebsiteSubscriptionV2({
        intpWebsiteId: websiteId,
      });

      const msg = `resumeWebsiteSubscriptionV2 should have failed, but got: \m ${JSON.stringify(
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
