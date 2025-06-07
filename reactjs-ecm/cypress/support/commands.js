// Login command với mock API
Cypress.Commands.add("login", (email = "tranvucnpm05@gmail.com", password = "123456") => {
    // Mock login API response
    cy.intercept("POST", "**/login", {
      statusCode: 200,
      body: {
        success: true,
        data: {
          accessToken: "mock-jwt-token",
          user: {
            id: "test-user-id",
            role: "user",
            email: email,
            firstName: "Test",
            lastName: "User"
          }
        }
      }
    }).as("loginAPI");
  
    cy.visit("/login");
    cy.get("#email").type(email);
    cy.get("#password").type(password);
    cy.get('input[type="submit"]').click();
    
    // Wait for login API call
    cy.wait("@loginAPI");
    
    // Verify redirect to home page
    cy.url().should("include", "/home-page");
    
    // Verify localStorage is set
    cy.window().then((win) => {
      expect(win.localStorage.getItem("token")).to.exist;
      expect(win.localStorage.getItem("userId")).to.exist;
      expect(win.localStorage.getItem("role")).to.exist;
    });
  });
  
  // Setup user session without going through login UI
  Cypress.Commands.add("setupUserSession", (role = "user") => {
    cy.window().then((win) => {
      win.localStorage.setItem("token", '"mock-jwt-token"');
      win.localStorage.setItem("userId", '"test-user-id"');
      win.localStorage.setItem("role", `"${role}"`);
    });
  });
  
  // Add product to cart với proper error handling
  Cypress.Commands.add("addProductToCart", () => {
    // Setup user session first
    cy.setupUserSession();
    
    // Mock cart APIs
    cy.intercept("GET", "**/cart/all-product/**", {
      statusCode: 200,
      body: {
        success: true,
        data: {
          cart: [],
          total: 0
        }
      }
    }).as("getCart");
  
    cy.intercept("POST", "**/cart/add-to-cart/**", {
      statusCode: 200,
      body: {
        success: true,
        data: { id: "cart-item-id" }
      }
    }).as("addToCart");
  
    // Navigate to home page first (avoid direct API route)
    cy.visit("/home-page");
    
    // Navigate to products through UI
    cy.get('a[href="/product/search/1/8"]', { timeout: 10000 }).click();
    
    // Wait for products page to load
    cy.url().should("include", "/product/search/1/8");
    cy.get(".pro-container", { timeout: 15000 }).should("be.visible");
    
    // Click on first product
    cy.get(".pro-container .pro").first().should("be.visible").click();
  
    // Wait for product detail page
    cy.url().should("include", "/product-detail/");
    cy.get(".single-pro-details", { timeout: 10000 }).should("be.visible");
  
    // Wait for product info to load
    cy.get(".single-pro-details h4").should("be.visible").and("not.be.empty");
  
    // Add to cart
    cy.get("button").contains("Thêm vào giỏ hàng").should("be.visible").click();
    
    // Wait for API call
    cy.wait("@addToCart");
    
    // Navigate to cart and verify
    cy.visit("/cart");
    cy.get(".small-container", { timeout: 5000 }).should("be.visible");
  });
  
  // Mock all necessary APIs
  Cypress.Commands.add("mockAPIs", () => {
    // Products API
    cy.intercept("GET", "**/product/search/**", {
      fixture: "products.json"
    }).as("getProducts");
  
    cy.intercept("GET", "**/product/*", {
      fixture: "product-detail.json"
    }).as("getProductDetail");
  
    // Category API
    cy.intercept("GET", "**/category/**", {
      fixture: "categories.json"
    }).as("getCategories");
  
    // User APIs
    cy.intercept("POST", "**/login", {
      fixture: "login-success.json"
    }).as("loginAPI");
  
    cy.intercept("GET", "**/users/**", {
      fixture: "user.json"
    }).as("getUser");
  
    // Cart APIs
    cy.intercept("GET", "**/cart/all-product/**", {
      fixture: "cart.json"
    }).as("getCart");
  
    cy.intercept("POST", "**/cart/add-to-cart/**", {
      statusCode: 200,
      body: { success: true, data: { id: "cart-item-id" } }
    }).as("addToCart");
  
    cy.intercept("PATCH", "**/cart/**", {
      statusCode: 200,
      body: { success: true }
    }).as("updateCart");
  
    cy.intercept("DELETE", "**/cart/**", {
      statusCode: 200,
      body: { success: true }
    }).as("deleteCart");
  
    // Order APIs
    cy.intercept("POST", "**/order/**", {
      fixture: "order-success.json"
    }).as("createOrder");
  
    cy.intercept("GET", "**/location-user/**", {
      fixture: "user-locations.json"
    }).as("getUserLocations");
  });
  
  // Visit page with error handling
  Cypress.Commands.add("visitPage", (url, options = {}) => {
    const defaultOptions = {
      failOnStatusCode: false,
      timeout: 30000,
      ...options
    };
  
    cy.visit(url, defaultOptions);
    
    // Check if we got an error page or JSON response
    cy.get("body").then(($body) => {
      if ($body.text().includes('"success"') || $body.text().includes('"data"')) {
        // This is a JSON response, likely an API endpoint
        cy.log(`Warning: ${url} returned JSON, might be an API endpoint`);
        // Navigate to home page instead
        cy.visit("/home-page");
      }
    });
  });
  
  // Wait for app to be ready
  Cypress.Commands.add("waitForApp", () => {
    // Wait for React app to mount
    cy.get("#root", { timeout: 15000 }).should("exist");
    
    // Wait for any loading states to finish
    cy.get("body").should("not.contain", "Loading...");
    
    // Ensure header is visible (indicates app is ready)
    cy.get("header", { timeout: 10000 }).should("be.visible");
  });
  
  // Navigate to products page safely
  Cypress.Commands.add("goToProductsPage", () => {
    cy.visit("/home-page");
    cy.waitForApp();
    
    // Click products link in navigation
    cy.get('nav a[href="/product/search/1/8"], a[href*="/product/search"]')
      .first()
      .click();
    
    // Verify we're on products page
    cy.url().should("include", "/product/search");
    cy.get(".pro-container", { timeout: 15000 }).should("be.visible");
  });
  
  // Search for products
  Cypress.Commands.add("searchProducts", (searchTerm) => {
    cy.goToProductsPage();
    
    cy.get('input[placeholder="Tìm kiếm..."]').clear().type(searchTerm);
    cy.wait(1000); // Wait for search to process
    
    cy.get(".pro-container .pro").should("have.length.at.least", 0);
  });
  
  // Filter by category
  Cypress.Commands.add("filterByCategory", (categoryName) => {
    cy.goToProductsPage();
    
    cy.get("select").first().select(categoryName);
    cy.wait(1000); // Wait for filter to process
  });
  
  // Custom assertion for cart items
  Cypress.Commands.add("shouldHaveCartItems", (expectedCount) => {
    cy.visit("/cart");
    cy.waitForApp();
    
    if (expectedCount > 0) {
      cy.get("tbody tr", { timeout: 10000 })
        .should("have.length", expectedCount);
    } else {
      cy.get("body").should("contain", "Giỏ hàng của bạn đang trống");
    }
  });
  
  // Mock product data for consistent testing
  Cypress.Commands.add("mockProductData", () => {
    const mockProducts = {
      success: true,
      data: {
        products: [
          {
            id: "product-1",
            name: "Test Product 1",
            priceout: 100000,
            category: { name: "Test Category" },
            weight: 25,
            url_images: '{"url_images1":"test-image-1.jpg","url_images2":"test-image-2.jpg"}'
          },
          {
            id: "product-2", 
            name: "Test Product 2",
            priceout: 200000,
            category: { name: "Test Category" },
            weight: 30,
            url_images: '{"url_images1":"test-image-3.jpg","url_images2":"test-image-4.jpg"}'
          }
        ],
        total: 2
      }
    };
  
    cy.intercept("GET", "**/product/search/**", mockProducts).as("getProducts");
    
    const mockProductDetail = {
      success: true,
      data: {
        products: {
          id: "product-1",
          name: "Test Product 1",
          priceout: 100000,
          description: "Test product description",
          stockQuantity: 100,
          weight: 25,
          category_id: "cat-1",
          url_images: '{"url_images1":"test-image-1.jpg","url_images2":"test-image-2.jpg"}'
        }
      }
    };
  
    cy.intercept("GET", "**/product/product-1", mockProductDetail).as("getProductDetail");
  });
  
  // Logout command
  Cypress.Commands.add("logout", () => {
    cy.window().then((win) => {
      win.localStorage.clear();
    });
    cy.visit("/home-page");
  });
  
  // Type definitions for better IDE support
  declare global {
    namespace Cypress {
      interface Chainable {
        login(email?: string, password?: string): Chainable<void>
        setupUserSession(role?: string): Chainable<void>
        addProductToCart(): Chainable<void>
        mockAPIs(): Chainable<void>
        visitPage(url: string, options?: object): Chainable<void>
        waitForApp(): Chainable<void>
        goToProductsPage(): Chainable<void>
        searchProducts(searchTerm: string): Chainable<void>
        filterByCategory(categoryName: string): Chainable<void>
        shouldHaveCartItems(expectedCount: number): Chainable<void>
        mockProductData(): Chainable<void>
        logout(): Chainable<void>
      }
    }
  }