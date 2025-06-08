import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 720,

    setupNodeEvents(on, config) {
      // Basic task logging
      on("task", {
        log(message) {
          console.log(message);
          return null;
        },
      });

      return config;
    },

    // Test files
    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",

    // Basic settings
    video: false,
    screenshotOnRunFailure: true,
    watchForFileChanges: false,

    // Timeouts
    defaultCommandTimeout: 8000,
    requestTimeout: 8000,
    responseTimeout: 8000,
    pageLoadTimeout: 15000,

    // Retry on failure
    retries: {
      runMode: 1,
      openMode: 0,
    },

    // Environment variables
    env: {
      apiUrl: "http://localhost:6006",
      testUser: {
        email: "test@example.com",
        password: "password123",
        userId: "test-user-123",
        token: "test-jwt-token",
      },
    },
  },
});
