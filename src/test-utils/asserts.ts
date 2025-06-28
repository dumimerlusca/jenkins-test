import { expect } from '@playwright/test';
import { AxiosError } from 'axios';
import { IntpInstance } from 'src/setup/intps';

export async function assertIntpcToBeDeleted(intp: IntpInstance, intpCustomerId: string) {
  try {
    const res = await intp.apiClient.getIntpcV2({ intpcId: intpCustomerId });
    const msg = `getIntpcV2 should have failed, because the intpc should have been deleted, but got: \n ${JSON.stringify(
      res.data.payload,
      null,
      2,
    )}`;
    expect.soft(true, msg).toBe(false);
  } catch (error) {
    const err = error as AxiosError;
    expect(err.status).toBe(404);
  }
}
