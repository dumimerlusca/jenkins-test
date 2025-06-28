import { CreateIntpcV2Input, Intpc } from '@aaasAdminApi';
import { UFT_PACKAGE_NAME } from '@consts';
import { Package } from '@visitor-analytics/3as-sdk-v2';
import { AxiosError } from 'axios';
import { randomInt } from 'crypto';
import { IntpInstance } from 'src/setup/intps';
import { utils } from 'src/utils';

export const createIntpcIfNotExists = async (intp: IntpInstance, input: CreateIntpcV2Input): Promise<Intpc> => {
  try {
    const res = await intp.apiClient.getIntpcV2({ intpcId: input.intpCustomerId });
    return res.data.payload;
  } catch (error) {
    const err = error as AxiosError;
    if (err.status === 404) {
      const res = await intp.apiClient.createIntpcV2(input);
      return res.data.payload;
    }
  }
};

export function getRandomInt(min: number, max: number) {
  min = Math.ceil(min);
  max = Math.floor(max);
  return Math.floor(Math.random() * (max - min + 1)) + min;
}

export const listMontlyPackages = async (intp: IntpInstance): Promise<Package[]> => {
  const packages = await intp.sdkV2.packages.list();
  const monthlyPackages = packages.filter((pak) => pak.period === 'monthly' && pak.name != UFT_PACKAGE_NAME);
  if (monthlyPackages.length === 0) {
    throw new Error('no monthly packages available');
  }
  return monthlyPackages.sort((a, b) => a.touchpoints - b.touchpoints);
};

export const listYearlyPackages = async (intp: IntpInstance): Promise<Package[]> => {
  const packages = await intp.sdkV2.packages.list();
  const yearlyPackages = packages.filter((pak) => pak.period === 'yearly' && pak.name != UFT_PACKAGE_NAME);
  if (yearlyPackages.length === 0) {
    throw new Error('no yearly packages available');
  }
  return yearlyPackages.sort((a, b) => a.touchpoints - b.touchpoints);
};

export const getFreePackage = async (intp: IntpInstance): Promise<Package> => {
  const packages = await intp.sdkV2.packages.list();
  const freePack = packages.find((pak) => pak.name.toLowerCase() == 'free');
  if (!freePack) {
    throw new Error('free package now found');
  }
  return freePack;
};

export const randomMonthlyPackage = async (intp: IntpInstance): Promise<Package> => {
  const packages = await listMontlyPackages(intp);
  const index = getRandomInt(0, packages.length - 1);
  return packages[index];
};

export const randomYearlyPackage = async (intp: IntpInstance): Promise<Package> => {
  const packages = await listYearlyPackages(intp);
  const index = getRandomInt(0, packages.length);
  return packages[index];
};

export const randomWebsiteSubscriptionIntpc = async (
  intp: IntpInstance,
  params?: {
    packageId?: string;
    intpCustomerId?: string;
    intpWebsiteId?: string;
  },
): Promise<Intpc> => {
  const packages = await intp.sdkV2.packages.list();
  const randomPackage = packages[randomInt(0, packages.length - 1)];
  return createIntpcIfNotExists(intp, {
    email: utils.randomEmail(),
    intpCustomerId: params?.intpCustomerId ?? utils.randomUUID(),
    website: {
      intpWebsiteId: params?.intpWebsiteId ?? utils.randomUUID(),
      domain: 'test.com',
      packageId: params?.packageId ?? randomPackage.id,
    },
  });
};

export const randomClientSubscriptionIntpc = async (
  intp: IntpInstance,
  params?: {
    packageId?: string;
    intpCustomerId?: string;
    intpWebsiteId?: string;
  },
): Promise<Intpc> => {
  const packages = await intp.sdkV2.packages.list();
  const pak = packages[5];

  return createIntpcIfNotExists(intp, {
    email: utils.randomEmail(),
    intpCustomerId: params?.intpCustomerId ?? utils.randomUUID(),
    website: {
      intpWebsiteId: params?.intpWebsiteId ?? utils.randomUUID(),
      domain: 'test.com',
    },
    packageId: params?.packageId ?? pak.id,
  });
};
