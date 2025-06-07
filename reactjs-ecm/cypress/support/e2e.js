// cypress/support/e2e.js

// Import commands.js using ES2015 syntax:
import "./commands";

// Handle uncaught exceptions globally (moved from config file)
Cypress.on("uncaught:exception", (err, runnable) => {
  // Returning false here prevents Cypress from failing the test
  // on uncaught exceptions from the application
  if (
    err.message.includes("ResizeObserver loop limit exceeded") ||
    err.message.includes("Non-Error promise rejection captured") ||
    err.message.includes("Loading chunk") ||
    err.message.includes("ChunkLoadError") ||
    err.message.includes("Loading CSS chunk") ||
    err.message.includes("Script error") ||
    err.message.includes("Network Error")
  ) {
    return false;
  }

  // Log the error for debugging
  console.log("Uncaught exception:", err.message);

  // Return true to fail the test for other errors
  return true;
});

// Add any global before hooks
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();

  // Clear cookies
  cy.clearCookies();

  // Clear session storage if needed
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

// Add any global after hooks
afterEach(() => {
  // Clean up after each test if needed
  // You can add cleanup logic here
});

// Hide fetch/XHR requests from command log (optional)
const app = window.top;
if (!app.document.head.querySelector("[data-hide-command-log-request]")) {
  const style = app.document.createElement("style");
  style.innerHTML =
    ".command-name-request, .command-name-xhr { display: none }";
  style.setAttribute("data-hide-command-log-request", "");
  app.document.head.appendChild(style);
}

// Global configuration
Cypress.config("defaultCommandTimeout", 10000);
Cypress.config("requestTimeout", 10000);
Cypress.config("responseTimeout", 10000);

// Add global commands that can be used across all tests
Cypress.Commands.add("waitForPageLoad", () => {
  cy.get("body").should("be.visible");
  cy.document().should("have.property", "readyState", "complete");
});

// Add viewport presets
Cypress.Commands.add("setViewport", (size) => {
  const viewports = {
    mobile: [375, 667],
    tablet: [768, 1024],
    desktop: [1280, 720],
    wide: [1920, 1080],
  };

  if (viewports[size]) {
    cy.viewport(viewports[size][0], viewports[size][1]);
  }
});

// Debug helper with different name
Cypress.Commands.add("debugInfo", () => {
  cy.window().then((win) => {
    console.log("Current URL:", win.location.href);
    console.log("Local Storage:", win.localStorage);
    console.log("Session Storage:", win.sessionStorage);
  });
});
