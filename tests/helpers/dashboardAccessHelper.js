const { VisitorAnalytics, LogLevel } = require("@visitor-analytics/3as-sdk");
const { readFileSync } = require("fs");
require("dotenv").config();

// Initialize the SDK with environment variables
const sdk = new VisitorAnalytics({
  intp: {
    id: process.env.INTP_PLATFORM_MANAGED_ID,
    privateKey: readFileSync(process.env.INTP_PLATFORM_MANAGED_PRIVATE_KEY_PATH, { encoding: "utf8" }),
  },
  env: "dev",
  logLevel: LogLevel.DEBUG,
});


/* Use sdk to create intpc access token */

// Open Dashboard Page
async function openDashboard(page, intpcId, websiteId) {
  const token = sdk.auth.generateINTPcAccessToken(intpcId).value; // Generate the token using the SDK

  const url = `https://dev-dashboard-3as.va-endpoint.com?intpc_token=${token}&externalWebsiteId=${websiteId}`;
  console.log(`Navigating to Dashboard page: ${url}`);

  const response = await page.goto(url);

  // Wait for a known element from the Upgrade Plan screen
  await page.waitForURL('**/dashboard/overview', { timeout: 30000 });
  return response;
}

module.exports = { openDashboard: openDashboard };
