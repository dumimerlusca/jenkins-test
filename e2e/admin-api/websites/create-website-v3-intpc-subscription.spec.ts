import { Intpc } from '@aaasAdminApi';
import { expect, test } from '@playwright/test';
import { Intps } from '@setup';
import { AxiosError } from 'axios';
import { randomClientSubscriptionIntpc, randomMonthlyPackage } from 'src/test-utils';
import { utils } from 'src/utils';

const intp = Intps.withCustomerSubscriptions;
const { apiClient } = intp;

let sharedIntpc: Intpc;

test.beforeAll(async () => {
  sharedIntpc = await randomClientSubscriptionIntpc(intp);
});

test.describe('create website v3 - intpc subscription', () => {
  test('website should be created successfully', async () => {
    const websiteId = utils.randomUUID();
    const res = await apiClient.createWebsiteV3({
      website: {
        domain: 'test.com',
        id: websiteId,
      },
      intpc: {
        id: sharedIntpc.intpCustomerId,
      },
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
    expect(websiteResPayload.inTrial).toBe(false);
    expect(websiteResPayload.status).toBe('active');
  });

  test('should throw error if packageId is specified', async () => {
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
      });
      expect.soft(false, 'Expected createWebsiteV3 to fail with 400 but it succeeded').toBe(true);
    } catch (error) {
      const err = error as AxiosError;
      expect(err.status).toBe(400);
    }
  });
  test('should throw error if uft is specified', async () => {
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
      throw new Error('create website v3 req should have failed');
    } catch (error) {
      const err = error as AxiosError;
      expect(err.status).toBe(400);
    }
  });
});
