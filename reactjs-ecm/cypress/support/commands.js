// cypress/support/commands.js

// ==== AUTHENTICATION ====
Cypress.Commands.add("login", () => {
  const { userId, token } = Cypress.env("testUser");

  cy.window().then((win) => {
    win.localStorage.setItem("token", `"${token}"`);
    win.localStorage.setItem("userId", `"${userId}"`);
    win.localStorage.setItem("role", '"user"');
  });
});

// ==== API MOCKING ====
Cypress.Commands.add("mockAPIs", () => {
  // Mock cart API
  cy.intercept("GET", "**/cart/all-product/**", {
    fixture: "cart.json",
  }).as("getCart");

  // Mock products API
  cy.intercept("GET", "**/product/search/**", {
    fixture: "products.json",
  }).as("getProducts");

  // Mock product detail
  cy.intercept("GET", "**/product/*", {
    fixture: "product-detail.json",
  }).as("getProductDetail");

  // Mock categories
  cy.intercept("GET", "**/category/**", {
    fixture: "categories.json",
  }).as("getCategories");

  // Mock user info
  cy.intercept("GET", "**/users/**", {
    fixture: "user.json",
  }).as("getUser");

  // Mock addresses
  cy.intercept("GET", "**/location-user/**", {
    fixture: "addresses.json",
  }).as("getAddresses");

  // Mock cart operations
  cy.intercept("POST", "**/cart/add-to-cart/**", {
    statusCode: 200,
    body: { success: true, message: "Added to cart" },
  }).as("addToCart");

  cy.intercept("PATCH", "**/cart/**", {
    statusCode: 200,
    body: { success: true, message: "Cart updated" },
  }).as("updateCart");

  cy.intercept("DELETE", "**/cart/**", {
    statusCode: 200,
    body: { success: true, message: "Item removed" },
  }).as("deleteCart");

  // Mock order creation
  cy.intercept("POST", "**/order/**", {
    statusCode: 200,
    body: {
      success: true,
      data: { data: { id: "order-123", total_price: 100000 } },
    },
  }).as("createOrder");
});

// ==== NAVIGATION ====
Cypress.Commands.add("visitApp", (path = "/home-page") => {
  cy.visit(path);
  cy.get("header", { timeout: 10000 }).should("be.visible");
});

Cypress.Commands.add("goToCart", () => {
  cy.visitApp("/cart");
  cy.get("table", { timeout: 8000 }).should("be.visible");
});

Cypress.Commands.add("goToProducts", () => {
  cy.visitApp("/product/search/1/8");
  cy.get(".pro-container", { timeout: 8000 }).should("be.visible");
});

// ==== CART OPERATIONS ====
Cypress.Commands.add("addItemToCart", () => {
  // Simulate having items in cart by mocking API
  cy.mockAPIs();
  cy.login();
  cy.goToCart();
});

Cypress.Commands.add("selectAllCartItems", () => {
  cy.get('thead input[type="checkbox"]').check();
  cy.get('tbody input[type="checkbox"]').should("be.checked");
});

Cypress.Commands.add("proceedToCheckout", () => {
  cy.selectAllCartItems();
  cy.get("button").contains("Mua hàng").click();
  cy.url().should("include", "/checkout");
});

// ==== CHECKOUT ====
Cypress.Commands.add(
  "selectPaymentMethod",
  (method = "Thanh toán khi nhận hàng") => {
    cy.get("button").contains(method).click();
    cy.get("button").contains(method).should("have.class", "bg-[#006532]");
  },
);

Cypress.Commands.add("completeOrder", () => {
  cy.selectPaymentMethod();
  cy.get("button").contains("Đặt hàng").click();
  cy.url().should("include", "/order-success");
});

// ==== ASSERTIONS ====
Cypress.Commands.add("shouldBeOnPage", (pageName) => {
  switch (pageName) {
    case "home":
      cy.url().should("include", "/home-page");
      cy.get("header").should("be.visible");
      break;
    case "cart":
      cy.url().should("include", "/cart");
      cy.get("table").should("be.visible");
      break;
    case "checkout":
      cy.url().should("include", "/checkout");
      cy.get(".grid").should("exist");
      break;
    case "order-success":
      cy.url().should("include", "/order-success");
      cy.contains("Thanh toán thành công!").should("be.visible");
      break;
  }
});

// ==== UTILITIES ====
Cypress.Commands.add("waitForPageLoad", () => {
  cy.get("body").should("be.visible");
  cy.get("header", { timeout: 8000 }).should("be.visible");
});

Cypress.Commands.add("checkNotification", (message) => {
  cy.get(".toast-notification", { timeout: 5000 })
    .should("be.visible")
    .and("contain", message);
});
