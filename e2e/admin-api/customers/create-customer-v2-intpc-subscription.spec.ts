import { SubscriptionType } from '@aaasAdminApi';
import { expect, test } from '@playwright/test';
import { Intps } from '@setup';
import { AxiosError } from 'axios';
import { randomMonthlyPackage } from 'src/test-utils';
import { sleep, utils } from 'src/utils';

const intp = Intps.withCustomerSubscriptions;
const { apiClient } = intp;

test.describe('customer create v2 with intpc subscription', () => {
  test('customer & website & subscription should be created successfully', async () => {
    const pak = await randomMonthlyPackage(intp);
    const packageId = pak.id;

    const customerId = utils.randomUUID();
    const websiteId = utils.randomUUID();
    const email = utils.randomEmail();
    const domain = 'test.com';

    const customerRes = await apiClient.createIntpcV2({
      email: email,
      intpCustomerId: customerId,
      website: {
        intpWebsiteId: websiteId,
        domain: domain,
      },
      packageId: packageId,
    });
    const customerResPayload = customerRes.data.payload;
    expect(customerResPayload.intpCustomerId).toEqual(customerId);
    expect(customerResPayload.email).toEqual(email);
    expect(customerResPayload.visaId).not.toBeFalsy();
    expect(customerResPayload.createdAt).not.toBeFalsy();
    expect(customerResPayload.id).not.toBeFalsy();

    // TODO 3as api: find out why the getWebsiteV2 endpoint does not return the updated subscription right away
    await sleep(500);

    const websiteRes = await apiClient.getWebsiteV2({ intpWebsiteId: websiteId });
    const websiteResPayload = websiteRes.data.payload;
    expect(websiteResPayload.intpWebsiteId).toEqual(websiteId);
    expect(websiteResPayload.consumption.stpLimit).toEqual(-1);

    expect(websiteResPayload.subscriptionType).toEqual(SubscriptionType.intpc);
    expect(websiteResPayload.status).toEqual('active');
  });
  test('should throw error if website package is specified instead of customer package', async () => {
    const pak = await randomMonthlyPackage(intp);
    const packageId = pak.id;

    const customerId = utils.randomUUID();
    const websiteId = utils.randomUUID();
    const email = utils.randomEmail();
    const domain = 'test.com';

    let err: AxiosError;
    try {
      await apiClient.createIntpcV2({
        email: email,
        intpCustomerId: customerId,
        website: {
          intpWebsiteId: websiteId,
          domain: domain,
          packageId: packageId,
        },
      });
    } catch (error) {
      err = error;
    }

    expect(err).not.toBeFalsy();
    expect(err.status).toBe(400);
  });
});
