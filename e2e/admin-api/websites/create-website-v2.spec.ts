import { CreateWebsiteV2Response, Intpc } from '@aaasAdminApi';
import { UFT_PACKAGE_NAME } from '@consts';
import { expect, test } from '@playwright/test';
import { Intps } from '@setup';
import { AxiosError, AxiosResponse } from 'axios';
import { randomMonthlyPackage, randomWebsiteSubscriptionIntpc } from 'src/test-utils';
import { utils } from 'src/utils';

const intp = Intps.withWebsiteCompanyManagedSubscriptions;
const { apiClient, sdkV2 } = intp;

let sharedIntpc: Intpc;

test.beforeAll(async () => {
  sharedIntpc = await randomWebsiteSubscriptionIntpc(intp);
});

test.describe('create website v2', () => {
  test('website and subscription should be created successfully', async () => {
    const pak = await randomMonthlyPackage(intp);

    const websiteId = utils.randomUUID();
    const res = await apiClient.createWebsiteV2({
      domain: 'test.com',
      intpWebsiteId: websiteId,
      intpCustomerId: sharedIntpc.intpCustomerId,
      packageId: pak.id,
    });

    const resPayload = res.data.payload;
    expect(resPayload.intpWebsiteId).toBe(websiteId);
    expect(resPayload.packageId).toBe(pak.id);
    expect(resPayload.status).toBe('active');
  });

  test('should create unlimited free trial subscription if package id is not specified', async () => {
    const websiteId = utils.randomUUID();
    const res = await apiClient.createWebsiteV2({
      domain: 'test.com',
      intpWebsiteId: websiteId,
      intpCustomerId: sharedIntpc.intpCustomerId,
    });

    const resPayload = res.data.payload;
    expect(resPayload.intpWebsiteId).toBe(websiteId);
    expect(resPayload.packageName).toBe(UFT_PACKAGE_NAME);
    expect(resPayload.inTrial).toBe(true);
    expect(resPayload.status).toBe('active');
  });

  test('should throw error if the website id already exists in the company', async () => {
    const pak = await randomMonthlyPackage(intp);
    const websiteId = utils.randomUUID();

    const res1 = await apiClient.createWebsiteV2({
      domain: 'test.com',
      intpWebsiteId: websiteId,
      intpCustomerId: sharedIntpc.intpCustomerId,
      packageId: pak.id,
    });

    expect(res1.status).toBe(201);

    try {
      await apiClient.createWebsiteV2({
        domain: 'test.com',
        intpWebsiteId: websiteId,
        intpCustomerId: sharedIntpc.intpCustomerId,
        packageId: pak.id,
      });
      throw new Error('this code portion should not have been reached, create website should have failed');
    } catch (error) {
      const err = error as AxiosError;
      expect(err.status).toBe(400);
    }
  });

  test('sending the same request multiple time should only be fulfilled once', async () => {
    const pak = await randomMonthlyPackage(intp);
    const websiteId = utils.randomUUID();

    const requests: Promise<AxiosResponse<CreateWebsiteV2Response, any>>[] = [];
    const reqCount = 5;

    for (let i = 0; i < reqCount; i++) {
      const req = apiClient.createWebsiteV2({
        domain: 'test.com',
        intpWebsiteId: websiteId,
        intpCustomerId: sharedIntpc.intpCustomerId,
        packageId: pak.id,
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
