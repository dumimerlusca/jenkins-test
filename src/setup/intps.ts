import { Config } from '@config';
import { logger } from '@logger';
import * as sdkV2 from '@visitor-analytics/3as-sdk-v2';
import * as sdkV3 from '@visitor-analytics/3as-sdk-v3';
import { readFileSync } from 'fs';
import { AaasAdminApi } from 'src/aaas-admin-api/aaas-admin-api';
import { AaasAdminHttpClient } from 'src/aaas-admin-http-client';
import path = require('path');

export type IntpInstance = {
  id: string;
  privateKey: string;
  httpClient: AaasAdminHttpClient;
  apiClient: AaasAdminApi;
  sdkV2: sdkV2.VisitorAnalytics;
  sdkV3: sdkV3.VisitorAnalytics;
};

type Intps = {
  withWebsiteCompanyManagedSubscriptions: IntpInstance;
  withWebsitePlatformManagedSubscriptions: IntpInstance;
  withCustomerSubscriptions: IntpInstance;
};

function initializeIntps(): Intps {
  const intps: Intps = {} as Intps;

  if (Config.intps.withWebsiteCompanyManagedSubscriptions) {
    intps.withWebsiteCompanyManagedSubscriptions = initIntpInstance(
      Config.intps.withWebsiteCompanyManagedSubscriptions,
    );
  }

  if (Config.intps.withWebsitePlatformManagedSubscriptions) {
    intps.withWebsitePlatformManagedSubscriptions = initIntpInstance(
      Config.intps.withWebsitePlatformManagedSubscriptions,
    );
  }

  if (Config.intps.withCustomerSubscriptions) {
    intps.withCustomerSubscriptions = initIntpInstance(Config.intps.withCustomerSubscriptions);
  }

  return intps;
}

function initIntpInstance(intpId: string): IntpInstance {
  if (!intpId) {
    logger.fatalExit('intp id is empty');
  }
  let privateKey: string;
  try {
    const res = readFileSync(path.join(process.cwd(), 'src/config/private-keys', `${intpId}.key`), {
      encoding: 'utf8',
    });
    privateKey = res;
  } catch (error) {
    logger.fatalExit(`private key for intp with id ${intpId} not found`);
  }

  const sdkV2Instance = new sdkV2.VisitorAnalytics({
    env: Config.env,
    intp: { id: intpId, privateKey: privateKey },
    logLevel: sdkV2.LogLevel.SILENT,
  });

  const httpClient = new AaasAdminHttpClient({ accessToken: sdkV2Instance.auth.generateINTPAccessToken() });

  return {
    id: intpId,
    privateKey,
    sdkV2: sdkV2Instance,
    sdkV3: new sdkV3.VisitorAnalytics({
      env: Config.env,
      intp: { id: intpId, privateKey: privateKey },
      logLevel: sdkV3.LogLevel.SILENT,
    }),
    httpClient: httpClient,
    apiClient: new AaasAdminApi(httpClient),
  };
}

export const Intps = initializeIntps();
