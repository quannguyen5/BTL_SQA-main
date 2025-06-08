import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",

    // Timeout configurations
    defaultCommandTimeout: 10000,
    requestTimeout: 10000,
    responseTimeout: 10000,
    pageLoadTimeout: 30000,

    // Viewport settings
    viewportWidth: 1280,
    viewportHeight: 720,

    // Retry settings
    retries: {
      runMode: 2,
      openMode: 1,
    },

    // Video settings
    video: true,
    screenshotOnRunFailure: true,

    // Test isolation
    testIsolation: false,

    // Environment variables
    env: {
      testUser: {
        userId: "test-user-123",
        token: "fake-jwt-token-for-testing",
      },
    },

    setupNodeEvents(on, config) {
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });

      return config;
    },

    specPattern: "cypress/e2e/**/*.cy.{js,jsx,ts,tsx}",
    supportFile: "cypress/support/e2e.js",
  },
});
