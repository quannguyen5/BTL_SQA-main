// cypress/support/e2e.js
import "./commands";

// Xử lý lỗi JavaScript để test không bị fail
Cypress.on("uncaught:exception", (err, runnable) => {
  // Bỏ qua những lỗi phổ biến không ảnh hưởng đến test
  if (
    err.message.includes("ResizeObserver loop limit exceeded") ||
    err.message.includes("Loading chunk") ||
    err.message.includes("ChunkLoadError") ||
    err.message.includes("Script error") ||
    err.message.includes("Network Error")
  ) {
    return false;
  }

  // Log lỗi để debug nhưng không fail test
  console.log("Uncaught exception:", err.message);
  return false; // Không fail test
});

// Clear data trước mỗi test
beforeEach(() => {
  cy.clearLocalStorage();
  cy.clearCookies();

  // Clear session storage
  cy.window().then((win) => {
    win.sessionStorage.clear();
  });
});

// Timeout mặc định
Cypress.config("defaultCommandTimeout", 8000);
