const { VisitorAnalytics, LogLevel } = require('@visitor-analytics/3as-sdk');
const { randomUUID } = require('crypto');
const { readFileSync } = require('fs');
require('dotenv').config();

// Initialize the SDK with environment variables
const sdk = new VisitorAnalytics({
  intp: {
    id: process.env.INTP_COMPANY_MANAGED_ID,
    privateKey: readFileSync(process.env.INTP_COMPANY_MANAGED_PRIVATE_KEY_PATH, { encoding: 'utf8' }),
  },
  env: 'dev',
  logLevel: LogLevel.DEBUG,
});

// Function to create a test customer
async function createTestCustomer() {
  return await sdk.customers.create({
    intpCustomerId: process.env.INTPC_ID,
    email: 'cami232@twipla.com',
    website: {
      intpWebsiteId: process.env.INTP_WEBSITE_ID,
      domain: 'tnkquh7r.bg',
      packageId: process.env.PACKAGE_ID,
    },
  });
}

async function createRandomCustomer() {
  let intpcId = randomUUID();
  let intpWebsiteId = randomUUID();

  await sdk.customers.create({
    intpCustomerId: intpcId,
    email: `${Math.random().toString(36).substring(2, 15)}@example.com`,
    website: {
      intpWebsiteId: intpWebsiteId,
      packageId: process.env.INTP_COMPANY_MANAGED_PACKAGE_ID,
      // Generate a random domain name
      domain: `${Math.random().toString(36).substring(2, 15)}.com`,
    },
  });

  return {
    intpcId,
    intpWebsiteId,
  };
}

// Function to create a customer with a specific package ID
async function upgradeWebsite(intpWebsiteId, packageId) {
  return await sdk.subscriptions.upgrade({
    // intpCustomerId: intpcId,
    intpWebsiteId: intpWebsiteId,
    packageId: packageId,
  });
}

// Function to downgrade a customer
async function downgradeWebsite(intpWebsiteId, packageId) {
  return await sdk.subscriptions.downgrade({
    // intpCustomerId: intpcId,
    intpWebsiteId: intpWebsiteId,
    packageId: packageId,
  });
}

module.exports = { createTestCustomer, createRandomCustomer, upgradeWebsite, downgradeWebsite, sdk };
