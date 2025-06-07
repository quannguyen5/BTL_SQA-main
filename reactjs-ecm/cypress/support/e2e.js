// cypress/support/e2e.js

// Import commands.js using ES2015 syntax:
import "./commands";

// Alternatively you can use CommonJS syntax:
// require('./commands')

// Add any global before hooks
beforeEach(() => {
  // Clear localStorage before each test
  cy.clearLocalStorage();
});

// Add any global after hooks
afterEach(() => {
  // Clean up after each test if needed
});

// Hide fetch/XHR requests from command log
const app = window.top;
if (!app.document.head.querySelector("[data-hide-command-log-request]")) {
  const style = app.document.createElement("style");
  style.innerHTML =
    ".command-name-request, .command-name-xhr { display: none }";
  style.setAttribute("data-hide-command-log-request", "");
  app.document.head.appendChild(style);
}
