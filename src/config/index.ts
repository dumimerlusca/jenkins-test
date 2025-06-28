import { logger } from '@logger';

import { AxiosInstance } from 'axios';
import { readFileSync } from 'fs';
import path = require('path');
import { AaasAdminHttpClient } from 'src/aaas-admin-http-client';

export enum ENV {
  dev = 'dev',
  stage = 'stage',
  production = 'production',
}

type Config = {
  env: ENV;
  apiGatewayUrl: string;
  intps: {
    withWebsiteCompanyManagedSubscriptions: string;
    withWebsitePlatformManagedSubscriptions: string;
    withCustomerSubscriptions: string;
  };
};

function validateConfig(cfg: Config) {
  if (!cfg.apiGatewayUrl) {
    logger.fatalExit('api gateway url must be provided');
  }
}

export let Config: Config;

export function initConfig() {
  const env = process.env.ENV as ENV;

  if (!env) {
    logger.fatalExit('ENV var must be provided');
  }

  const jsonConfig = readFileSync(path.join(process.cwd(), 'src', 'config', `${env}.config.json`), 'utf-8');
  const config = JSON.parse(jsonConfig) as Config;
  config.env = env;
  validateConfig(config);

  Config = config;
}

initConfig();
