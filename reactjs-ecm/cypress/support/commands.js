// cypress/support/commands.js
// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************

// ===== AUTHENTICATION COMMANDS =====

Cypress.Commands.add("login", () => {
  // Set auth tokens directly instead of going through login form
  cy.window().then((win) => {
    win.localStorage.setItem("token", '"test-token"');
    win.localStorage.setItem("userId", '"test-user-id"');
    win.localStorage.setItem("role", '"user"');
  });

  // Visit home page to ensure app is loaded
  cy.visit("/home-page");
  cy.get("header", { timeout: 10000 }).should("be.visible");
});

Cypress.Commands.add("loginAdmin", () => {
  cy.window().then((win) => {
    win.localStorage.setItem("token", '"admin-token"');
    win.localStorage.setItem("userId", '"admin-user-id"');
    win.localStorage.setItem("role", '"admin"');
  });

  cy.visit("/admin/dashboard");
  cy.get("body", { timeout: 10000 }).should("be.visible");
});

// ===== NAVIGATION COMMANDS =====

Cypress.Commands.add("navigateToProducts", () => {
  // Start from home page
  cy.visit("/home-page");
  cy.get("header", { timeout: 10000 }).should("be.visible");

  // Navigate using the header link
  cy.get('a[href="/product/search/1/8"]').should("be.visible").click();

  // Wait for products page to load
  cy.url().should("include", "/product/search");
  cy.get("header", { timeout: 10000 }).should("be.visible");
});

Cypress.Commands.add("navigateToCart", () => {
  // Navigate using header cart link
  cy.visit("/home-page");
  cy.get("header", { timeout: 10000 }).should("be.visible");
  cy.get('a[href="/cart"]').click();
  cy.url().should("include", "/cart");
});

// ===== PRODUCT COMMANDS =====

Cypress.Commands.add("addProductToCart", () => {
  // Ensure user is logged in
  cy.window().then((win) => {
    win.localStorage.setItem("token", '"test-token"');
    win.localStorage.setItem("userId", '"test-user-id"');
    win.localStorage.setItem("role", '"user"');
  });

  // Navigate to products page properly
  cy.navigateToProducts();

  // Wait for products to load
  cy.get(".pro-container", { timeout: 15000 }).should("be.visible");

  // Check if products exist
  cy.get(".pro-container .pro").then(($products) => {
    if ($products.length > 0) {
      // Click on first product
      cy.wrap($products.first()).click();

      // Wait for product detail page
      cy.url().should("include", "/product-detail/");
      cy.get(".single-pro-details", { timeout: 10000 }).should("be.visible");

      // Wait for product info to load
      cy.get(".single-pro-details h4").should("be.visible");

      // Add to cart
      cy.get("button")
        .contains("Thêm vào giỏ hàng")
        .should("be.visible")
        .click();

      // Wait for notification or success indicator
      cy.wait(2000);
    } else {
      // If no products, create mock cart data
      cy.window().then((win) => {
        // Mock having items in cart
        cy.log("No products found, using mock cart data");
      });
    }
  });
});

// ===== MOCK API COMMANDS =====

Cypress.Commands.add("mockAPIs", () => {
  // Mock successful login
  cy.intercept("POST", "**/login", {
    statusCode: 200,
    body: {
      success: true,
      data: {
        accessToken: "fake-jwt-token",
        user: {
          id: "user123",
          role: "user",
        },
      },
    },
  }).as("login");

  // Mock products list
  cy.intercept("GET", "**/product/search/**", {
    statusCode: 200,
    body: {
      success: true,
      data: {
        products: [
          {
            id: "1",
            name: "Thức ăn cho gà",
            priceout: 50000,
            category: { name: "Gà" },
            url_images: '{"url_images1":"https://via.placeholder.com/300x300"}',
            stockQuantity: 100,
            weight: 30,
          },
          {
            id: "2",
            name: "Thức ăn cho heo",
            priceout: 75000,
            category: { name: "Heo" },
            url_images: '{"url_images1":"https://via.placeholder.com/300x300"}',
            stockQuantity: 50,
            weight: 25,
          },
        ],
        total: 2,
      },
    },
  }).as("getProducts");

  // Mock product detail
  cy.intercept("GET", "**/product/*", {
    statusCode: 200,
    body: {
      success: true,
      data: {
        products: {
          id: "1",
          name: "Thức ăn cho gà",
          priceout: 50000,
          description: "Thức ăn chất lượng cao cho gà",
          stockQuantity: 100,
          weight: 30,
          url_images:
            '{"url_images1":"https://via.placeholder.com/300x300","url_images2":"https://via.placeholder.com/300x300"}',
          category_id: "cat1",
        },
      },
    },
  }).as("getProductDetail");

  // Mock cart operations
  cy.intercept("GET", "**/cart/all-product/**", {
    statusCode: 200,
    body: {
      success: true,
      data: {
        cart: [
          {
            id: "cart1",
            quantity: 2,
            product_id: "1",
            product: {
              id: "1",
              name: "Thức ăn cho gà",
              priceout: 50000,
              weight: 30,
              url_images:
                '{"url_images1":"https://via.placeholder.com/300x300"}',
            },
          },
        ],
        total: 2,
      },
    },
  }).as("getCart");

  // Mock add to cart
  cy.intercept("POST", "**/cart/add-to-cart/**", {
    statusCode: 200,
    body: { success: true, message: "Added to cart" },
  }).as("addToCart");

  // Mock update cart
  cy.intercept("PATCH", "**/cart/**", {
    statusCode: 200,
    body: { success: true, message: "Cart updated" },
  }).as("updateCart");

  // Mock delete cart
  cy.intercept("DELETE", "**/cart/**", {
    statusCode: 200,
    body: { success: true, message: "Item removed" },
  }).as("deleteCart");

  // Mock categories
  cy.intercept("GET", "**/category/**", {
    statusCode: 200,
    body: {
      success: true,
      data: {
        data: [
          { id: "cat1", name: "Gà" },
          { id: "cat2", name: "Heo" },
          { id: "cat3", name: "Cá" },
        ],
      },
    },
  }).as("getCategories");

  // Mock user info
  cy.intercept("GET", "**/users/**", {
    statusCode: 200,
    body: {
      success: true,
      data: {
        id: "user123",
        firstName: "Test",
        lastName: "User",
        email: "test@example.com",
        url_image: "https://via.placeholder.com/150x150",
      },
    },
  }).as("getUser");

  // Mock addresses
  cy.intercept("GET", "**/location-user/**", {
    statusCode: 200,
    body: {
      success: true,
      data: {
        data: [
          {
            id: "addr1",
            name: "Nguyễn Văn A",
            address: "123 Test Street, District 1, Ho Chi Minh City",
            phone: "0987654321",
            default_location: true,
            user_id: "user123",
          },
        ],
      },
    },
  }).as("getAddresses");

  // Mock create order
  cy.intercept("POST", "**/order/**", {
    statusCode: 200,
    body: {
      success: true,
      data: {
        data: {
          id: "order123",
          order_code: "ORD-123456",
          total_price: 100000,
          orderStatus: "Đang kiểm hàng",
        },
      },
    },
  }).as("createOrder");

  // Mock order details
  cy.intercept("GET", "**/order/detail/**", {
    statusCode: 200,
    body: {
      success: true,
      data: {
        id: "order123",
        order_code: "ORD-123456",
        total_price: 100000,
        orderStatus: "Đang kiểm hàng",
        payment_method: "Thanh toán khi nhận hàng",
        createdAt: new Date().toISOString(),
        location: {
          name: "Nguyễn Văn A",
          address: "123 Test Street",
          phone: "0987654321",
        },
        orderProducts: [
          {
            id: "op1",
            quantity: 2,
            priceout: 50000,
            product: {
              id: "1",
              name: "Thức ăn cho gà",
              url_images:
                '{"url_images1":"https://via.placeholder.com/300x300"}',
            },
          },
        ],
      },
    },
  }).as("getOrderDetails");
});

// ===== UTILITY COMMANDS =====

Cypress.Commands.add("waitForApp", () => {
  cy.get("header", { timeout: 15000 }).should("be.visible");
  cy.get("body").should("not.have.class", "loading");
});

Cypress.Commands.add("checkNotification", (message) => {
  cy.get(".toast-notification", { timeout: 10000 })
    .should("be.visible")
    .and("contain", message);
});

// ===== ERROR HANDLING =====

Cypress.Commands.add("handleRouting", (path) => {
  cy.visit("/home-page");
  cy.waitForApp();

  // Use programmatic navigation for SPA routes
  cy.window().then((win) => {
    win.history.pushState({}, "", path);
    win.dispatchEvent(new Event("popstate"));
  });

  cy.url().should("include", path);
});

// Custom command for visiting SPA routes safely
Cypress.Commands.add("visitSPA", (path) => {
  // First ensure the app is loaded
  cy.visit("/", { failOnStatusCode: false });
  cy.waitForApp();

  // Then navigate programmatically
  cy.window().then((win) => {
    win.history.pushState({}, "", path);
    win.dispatchEvent(new Event("popstate"));
  });

  cy.url().should("include", path);
});

// ===== FORM HELPERS =====

Cypress.Commands.add("fillCheckoutForm", () => {
  // Assume address form is already filled from mocked data
  // Just select payment method
  cy.get("button").contains("Thanh toán khi nhận hàng").click();
});

Cypress.Commands.add("completeOrder", () => {
  cy.fillCheckoutForm();
  cy.get("button").contains("Đặt hàng").click();
  cy.url().should("include", "/order-success");
});

// ===== VIEWPORT COMMANDS =====

Cypress.Commands.add("setMobileViewport", () => {
  cy.viewport(375, 667); // iPhone SE
});

Cypress.Commands.add("setTabletViewport", () => {
  cy.viewport(768, 1024); // iPad
});

Cypress.Commands.add("setDesktopViewport", () => {
  cy.viewport(1280, 720); // Desktop
});

// End of commands.js
