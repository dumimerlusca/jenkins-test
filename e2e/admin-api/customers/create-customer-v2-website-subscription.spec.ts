import { UFT_PACKAGE_NAME } from '@consts';
import { expect, test } from '@playwright/test';
import { Intps } from '@setup';
import { AxiosError, AxiosResponse } from 'axios';
import { CreateIntpcV2Response } from 'src/aaas-admin-api/aaas-admin-api.types';
import { randomMonthlyPackage } from 'src/test-utils';
import { utils } from 'src/utils';

const intp = Intps.withWebsiteCompanyManagedSubscriptions;
const { apiClient, sdkV2 } = intp;

test.describe('customer create v2 with website subscription', () => {
  test('customer and website should be created successfully', async () => {
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
        packageId: packageId,
      },
    });
    const customerResPayload = customerRes.data.payload;
    expect(customerResPayload.intpCustomerId).toEqual(customerId);
    expect(customerResPayload.email).toEqual(email);
    expect(customerResPayload.visaId).not.toBeFalsy();
    expect(customerResPayload.createdAt).not.toBeFalsy();
    expect(customerResPayload.id).not.toBeFalsy();

    const websiteRes = await apiClient.getWebsiteV2({ intpWebsiteId: websiteId });
    const websiteResPayload = websiteRes.data.payload;
    expect(websiteResPayload.intpWebsiteId).toEqual(websiteId);
    expect(websiteResPayload.packageId).toEqual(packageId);
    expect(websiteResPayload.status).toEqual('active');
  });

  test('sending the same request multiple time should only be fulfilled once', async () => {
    const pak = await randomMonthlyPackage(intp);
    const packageId = pak.id;

    const customerId = utils.randomUUID();
    const websiteId = utils.randomUUID();
    const email = utils.randomEmail();
    const domain = 'test.com';

    const requests: Promise<AxiosResponse<CreateIntpcV2Response, any>>[] = [];
    const reqCount = 5;

    for (let i = 0; i < reqCount; i++) {
      const req = apiClient.createIntpcV2({
        email: email,
        intpCustomerId: customerId,
        website: {
          intpWebsiteId: websiteId,
          domain: domain,
          packageId: packageId,
        },
      });
      requests.push(req);
    }

    const responses = await Promise.allSettled(requests);
    const countRejected = responses.filter((response) => response.status === 'rejected').length;
    const countFulfilled = responses.filter((response) => response.status === 'fulfilled').length;

    expect(countFulfilled).toBe(1);
    expect(countRejected).toBe(reqCount - countFulfilled);
  });

  test('not specifying the package id should start the website subscription in free trial', async () => {
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
    });
    const customerResPayload = customerRes.data.payload;
    expect(customerResPayload.intpCustomerId).toEqual(customerId);

    const websiteRes = await apiClient.getWebsiteV2({ intpWebsiteId: websiteId });
    const websiteResPayload = websiteRes.data.payload;
    expect(websiteResPayload.inTrial).toEqual(true);
    expect(websiteResPayload.packageName).toEqual(UFT_PACKAGE_NAME);
    expect(websiteResPayload.status).toEqual('active');
  });

  test('should throw error if customer package is specified instead of website package', async () => {
    const packages = await sdkV2.packages.list();
    const pak = packages[5];
    const packageId = pak.id;

    const customerId = utils.randomUUID();
    const websiteId = utils.randomUUID();
    const email = utils.randomEmail();
    const domain = 'test.com';

    let error: AxiosError;
    try {
      await apiClient.createIntpcV2({
        email: email,
        intpCustomerId: customerId,
        website: {
          intpWebsiteId: websiteId,
          domain: domain,
        },
        packageId: packageId,
      });
    } catch (err) {
      error = err;
    }

    expect(error).not.toBeFalsy();
    expect(error.response.status).toBe(400);
  });
});
