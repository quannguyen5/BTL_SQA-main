import { defineConfig } from "cypress";

export default defineConfig({
  e2e: {
    baseUrl: "http://localhost:5173",
    viewportWidth: 1280,
    viewportHeight: 720,

    setupNodeEvents(on, config) {
      // Có thể để trống hoặc thêm plugins sau
      return config;
    },

    specPattern: "cypress/e2e/**/*.cy.js",
    supportFile: "cypress/support/e2e.js",

    // Cấu hình cơ bản
    video: false, // Tắt video để tăng tốc
    screenshotOnRunFailure: true,
    chromeWebSecurity: false,

    // Timeouts
    defaultCommandTimeout: 8000,
    requestTimeout: 8000,
    responseTimeout: 8000,
  },

  env: {
    apiUrl: "http://localhost:6006",
  },
});
