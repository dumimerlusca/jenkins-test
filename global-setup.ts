import { FullConfig } from '@playwright/test';
import { config } from 'dotenv';
import { initConfig } from '@config';

config();
async function globalSetup(config: FullConfig) {}

export default globalSetup;
