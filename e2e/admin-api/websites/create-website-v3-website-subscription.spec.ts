import { CreateWebsiteV3Response, Intpc } from '@aaasAdminApi';
import { expect, test } from '@playwright/test';
import { Intps } from '@setup';
import { AxiosError, AxiosResponse } from 'axios';
import { randomMonthlyPackage, randomWebsiteSubscriptionIntpc } from 'src/test-utils';
import { utils } from 'src/utils';

const intp = Intps.withWebsiteCompanyManagedSubscriptions;
const { apiClient } = intp;

let sharedIntpc: Intpc;

test.beforeAll(async () => {
  sharedIntpc = await randomWebsiteSubscriptionIntpc(intp);
});

test.describe('create website v3 - website subscription', () => {
  test('website and subscription should be created successfully - when package is specified', async () => {
    const pak = await randomMonthlyPackage(intp);

    const websiteId = utils.randomUUID();
    const res = await apiClient.createWebsiteV3({
      website: {
        domain: 'test.com',
        id: websiteId,
        package: {
          id: pak.id,
        },
      },
      intpc: {
        id: sharedIntpc.intpCustomerId,
      },
      opts: { uft: false },
    });

    // TODO 3as api: Change api status to be 201 after endpoint gets updated
    expect(res.status).toBe(204);

    // TODO 3as api: Include response data in 3as api request and uncomment this
    // const resPayload = res.data.payload;
    // expect(resPayload.intpWebsiteId).toBe(websiteId);
    // expect(resPayload.packageId).toBe(pak.id);
    // expect(resPayload.inTrial).toBe(false);
    // expect(resPayload.status).toBe('active');

    const websiteRes = await apiClient.getWebsiteV2({ intpWebsiteId: websiteId });
    const websiteResPayload = websiteRes.data.payload;
    expect(websiteResPayload.intpWebsiteId).toBe(websiteId);
    expect(websiteResPayload.packageId).toBe(pak.id);
    expect(websiteResPayload.inTrial).toBe(false);
    expect(websiteResPayload.status).toBe('active');
  });

  test('website and subscription should be created successfully - with free trial if no package is specified', async () => {
    const websiteId = utils.randomUUID();
    const res = await apiClient.createWebsiteV3({
      website: {
        domain: 'test.com',
        id: websiteId,
      },
      intpc: {
        id: sharedIntpc.intpCustomerId,
      },
      opts: { uft: true },
    });

    // TODO 3as api: Change api status to be 201 after endpoint gets updated
    expect(res.status).toBe(204);

    // TODO 3as-api: Include response data in 3as api request and uncomment this
    // const resPayload = res.data.payload;
    // expect(resPayload.intpWebsiteId).toBe(websiteId);
    // expect(resPayload.packageId).toBe(pak.id);
    // expect(resPayload.inTrial).toBe(false);
    // expect(resPayload.status).toBe('active');

    const websiteRes = await apiClient.getWebsiteV2({ intpWebsiteId: websiteId });
    const websiteResPayload = websiteRes.data.payload;
    expect(websiteResPayload.intpWebsiteId).toBe(websiteId);
    expect(websiteResPayload.inTrial).toBe(true);
    expect(websiteResPayload.status).toBe('active');
  });

  test('duplicate website id should not be allowed in company', async () => {
    const pak = await randomMonthlyPackage(intp);

    const websiteId = utils.randomUUID();
    const input = {
      website: {
        domain: 'test.com',
        id: websiteId,
        package: {
          id: pak.id,
        },
      },
      intpc: {
        id: sharedIntpc.intpCustomerId,
      },
    };

    await apiClient.createWebsiteV3(input);
    try {
      await apiClient.createWebsiteV3(input);
      expect.soft(false, 'createWebsiteV3 should have failed due to duplicate website id').toBe(true);
    } catch (error) {
      const err = error as AxiosError;
      expect(err.status).toBe(400);
    }
  });

  test('should throw error if both opts.uft and package are specified', async () => {
    const pak = await randomMonthlyPackage(intp);

    const websiteId = utils.randomUUID();
    try {
      await apiClient.createWebsiteV3({
        website: {
          domain: 'test.com',
          id: websiteId,
          package: {
            id: pak.id,
          },
        },
        intpc: {
          id: sharedIntpc.intpCustomerId,
        },
        opts: { uft: true },
      });
    } catch (error) {
      const err = error as AxiosError;
      expect(err.status).toBe(400);
    }
  });

  test('sending the same request multiple time should only be fulfilled once', async () => {
    const pak = await randomMonthlyPackage(intp);
    const websiteId = utils.randomUUID();

    const requests: Promise<AxiosResponse<CreateWebsiteV3Response, any>>[] = [];
    const reqCount = 5;

    for (let i = 0; i < reqCount; i++) {
      const req = apiClient.createWebsiteV3({
        website: {
          domain: 'test.com',
          id: websiteId,
          package: {
            id: pak.id,
          },
        },
        intpc: {
          id: sharedIntpc.intpCustomerId,
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
});
