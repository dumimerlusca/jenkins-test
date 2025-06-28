
# 3AS Upgrade Plan – E2E Tests (Playwright + 3AS SDK)

This project contains automated end-to-end tests for the 3AS Upgrade Plan flow using Playwright and the @visitor-analytics/3as-sdk.

---

## Project Setup

### 1. Clone or Create the Project Folder
If not already created:
```bash
mkdir 3AS-upgrade-plan-e2e && cd 3AS-upgrade-plan-e2e
```

### 2. Initialize the Project
```bash
npm init -y
```

### 3. Install Required Dependencies
```bash
npm install dotenv
npm install @visitor-analytics/3as-sdk
```

### 4. Install Playwright Browsers
```bash
npx playwright install
```

---

## Project Structure

```
3AS-upgrade-plan-e2e/
│
├── tests/
│   ├── upgrade-plan.spec.js         # Main test file
│   └── helpers/
│       └── customerSetup.js         # Utility to create customer
│
├── .env                             # Environment config (excluded via .gitignore)
├── jwtRS256.key                     # Private key for token auth
├── package.json
├── playwright.config.js             # Playwright config
└── README.md
```

---

## Environment Setup

Create a `.env` file in the root of the project with the following values:

```
INTP_PLATFORM_MANAGED_ID=<your-intp-id>
INTP_PLATFORM_MANAGED_PRIVATE_KEY_PATH=./jwtRS256.key
INTPC_ID=<your-intp-customer-id>
INTP_WEBSITE_ID=<your-intp-website-id>
PACKAGE_ID=<valid-package-id>
CREATE_CUSTOMER=true
```

> Set `CREATE_CUSTOMER=false` to skip re-creating customer every run.

---

## Run the Tests

Use the Playwright CLI to execute the tests:

```bash
npx playwright test
```

The test does the following:
- Initializes the SDK using credentials from `.env`
- Creates a test customer (optional)
- Generates `intpc_token` and constructs Upgrade Plan dashboard URL
- Navigates to the Upgrade Plan dashboard
- Asserts the page loads successfully

---

## Additional Notes

- Ensure the private key file is **not** committed to version control.
- You can add more utility methods in the `helpers/` folder.
- Dashboard link is dynamically built using environment values.

---