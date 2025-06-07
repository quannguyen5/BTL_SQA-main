import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 720,

    setupNodeEvents(on, config) {
      // Valid events only - no uncaught:exception here

      // Handle before:browser:launch
      on("before:browser:launch", (browser = {}, launchOptions) => {
        if (browser.name === "chrome") {
          launchOptions.args.push("--disable-web-security");
          launchOptions.args.push("--disable-site-isolation-trials");
          launchOptions.args.push("--disable-features=VizDisplayCompositor");
        }
        return launchOptions;
      });

      // Handle task events
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });

      return config;
    },

    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",

    // Basic configuration
    video: false,
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,
    watchForFileChanges: false,

    // Timeouts
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 60000,

    // Retry configuration
    retries: {
      runMode: 2,
      openMode: 0,
    },

    // Test isolation
    testIsolation: true,

    // Environment variables
    env: {
      apiUrl: "http://localhost:6006",
      testUser: {
        email: "test@example.com",
        password: "password123",
        userId: "test-user-id",
      },
      enableMockAPIs: true,
    },

    // Include/exclude patterns
    excludeSpecPattern: [
      "**/examples/*",
      "**/node_modules/**/*",
      "**/dist/**/*",
    ],
  },

  component: {
    devServer: {
      framework: "react",
      bundler: "vite",
    },
    viewportWidth: 1000,
    viewportHeight: 660,
  },
});
