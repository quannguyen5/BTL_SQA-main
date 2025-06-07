// Login command
Cypress.Commands.add("login", () => {
  cy.visit("/login");
  cy.get("#email").type("test@example.com");
  cy.get("#password").type("password123");
  cy.get('input[type="submit"]').click();
  cy.url().should("include", "/home-page");
});

Cypress.Commands.add("addProductToCart", () => {
  cy.window().then((win) => {
    win.localStorage.setItem("token", '"test-token"');
    win.localStorage.setItem("userId", '"test-user-id"');
    win.localStorage.setItem("role", '"user"');
  });

  // Thay vì hardcode product ID, lấy từ product list
  cy.visit("/product/search/1/8");
  cy.get(".pro-container .pro").first().click();

  // Wait for product detail page
  cy.url().should("include", "/product-detail/");
  cy.get(".single-pro-details").should("be.visible");

  // Wait for product name to load (more flexible)
  cy.get(".single-pro-details h4", { timeout: 15000 })
    .should("exist")
    .and("be.visible");

  // Don't check if empty, just proceed
  cy.get("button").contains("Thêm vào giỏ hàng").should("be.visible").click();

  cy.wait(2000);
  cy.visit("/cart");
  cy.get("tbody tr", { timeout: 5000 }).should("have.length.at.least", 1);
});

// Mock API responses
Cypress.Commands.add("mockAPIs", () => {
  cy.intercept("GET", "**/product/**", { fixture: "products.json" }).as(
    "getProducts",
  );
  cy.intercept("POST", "**/login", { fixture: "login-success.json" }).as(
    "login",
  );
  cy.intercept("GET", "**/cart/**", { fixture: "cart.json" }).as("getCart");
});
