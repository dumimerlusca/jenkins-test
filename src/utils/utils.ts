import { randomUUID } from 'crypto';

const randomEmail = () => `${randomUUID()}@qa.com`;

export function sleep(ms) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export const utils = { randomEmail, randomUUID };
