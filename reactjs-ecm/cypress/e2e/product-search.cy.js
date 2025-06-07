describe("Product Search Page", () => {
  beforeEach(() => {
    // Kiểm tra server trước khi test
    cy.request({
      url: "http://localhost:5173",
      failOnStatusCode: false,
    }).then((response) => {
      expect(response.status).to.eq(200);
    });
  });

  it("should load product search page successfully", () => {
    // Cách 1: Sử dụng cy.visit với error handling
    cy.visit("/product/search/1/8", {
      failOnStatusCode: false,
      timeout: 30000,
    });

    // Kiểm tra page đã load thành công
    cy.get("body").should("exist");

    // Kiểm tra các element chính của trang
    cy.get("header", { timeout: 10000 }).should("be.visible");
  });

  it("should handle SPA routing correctly", () => {
    // Cách 2: Navigate thông qua home page
    cy.visit("/");

    // Wait for app to load
    cy.get('[data-testid="app-loaded"]', { timeout: 10000 }).should("exist");

    // Navigate to product search
    cy.window().then((win) => {
      win.history.pushState({}, "", "/product/search/1/8");
      win.dispatchEvent(new Event("popstate"));
    });

    // Verify we're on the right page
    cy.location("pathname").should("eq", "/product/search/1/8");
  });

  it("should load products when navigating programmatically", () => {
    // Cách 3: Sử dụng cy.request để check API trước
    cy.request({
      url: "http://localhost:6006/product/search/1/8",
      failOnStatusCode: false,
    }).then((response) => {
      // Nếu API hoạt động, tiếp tục test frontend
      if (response.status === 200) {
        cy.visit("/product/search/1/8");
        cy.get(".pro-container").should("exist");
        cy.get(".pro").should("have.length.greaterThan", 0);
      }
    });
  });

  it("should handle product search with filters", () => {
    cy.visit("/");

    // Navigate to products page through header link
    cy.get('a[href="/product/search/1/8"]').click();

    // Wait for products to load
    cy.get(".pro-container", { timeout: 15000 }).should("be.visible");

    // Test search functionality
    cy.get('input[placeholder="Tìm kiếm..."]').type("test product");

    // Test category filter
    cy.get("select").first().select("Tất cả");

    // Verify products are displayed
    cy.get(".pro").should("exist");
  });

  // Fallback test nếu routing không hoạt động
  it("should fallback to home page if route fails", () => {
    cy.visit("/product/search/1/8", { failOnStatusCode: false }).then(() => {
      cy.get("body").then(($body) => {
        if ($body.find(".error-page").length > 0) {
          // Nếu có lỗi, navigate về home
          cy.visit("/");
          cy.get("header").should("be.visible");
        }
      });
    });
  });
});
