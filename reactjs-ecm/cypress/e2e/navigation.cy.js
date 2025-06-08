// cypress/e2e/navigation.cy.js

describe("Điều hướng - Navigation Tests", () => {
  beforeEach(() => {
    cy.mockAPIs();
    cy.login();
  });

  it("TC01 - Trang chủ hiển thị đúng", () => {
    cy.visitApp("/home-page");

    // Kiểm tra các elements chính
    cy.get("header").should("be.visible");
    cy.get("footer").should("be.visible");
    cy.get(".hero").should("be.visible");

    // Kiểm tra navigation menu
    cy.contains("TRANG CHỦ").should("be.visible");
    cy.contains("SẢN PHẨM").should("be.visible");
    cy.contains("VỀ CHÚNG TÔI").should("be.visible");
  });

  it("TC02 - Navigation menu hoạt động", () => {
    cy.visitApp("/home-page");

    // Click vào Products
    cy.get('a[href="/product/search/1/8"]').click();
    cy.url().should("include", "/product/search");

    // Kiểm tra trang products load
    cy.get(".pro-container", { timeout: 8000 }).should("be.visible");
  });

  it("TC03 - Cart icon trong header", () => {
    cy.visitApp("/home-page");

    // Kiểm tra cart icon
    cy.get('a[href="/cart"]').should("be.visible");

    // Click vào cart
    cy.get('a[href="/cart"]').click();
    cy.shouldBeOnPage("cart");
  });

  it("TC04 - Search products", () => {
    cy.goToProducts();

    // Test search box
    cy.get('input[placeholder="Tìm kiếm..."]').should("be.visible");
    cy.get('input[placeholder="Tìm kiếm..."]').type("gà");

    // Test category filter
    cy.get("select").first().should("be.visible");
    cy.get("select").first().select("Tất cả");
  });

  it("TC05 - Product detail page", () => {
    cy.goToProducts();

    // Click vào sản phẩm đầu tiên
    cy.get(".pro").first().click();

    // Kiểm tra product detail page
    cy.url().should("include", "/product-detail/");
    cy.get(".single-pro-details").should("be.visible");
    cy.get(".single-pro-details h4").should("be.visible"); // Tên sản phẩm
    cy.get(".single-pro-details h2").should("be.visible"); // Giá
  });

  it("TC06 - User profile navigation", () => {
    cy.visitApp("/home-page");

    // Check user icon
    cy.get("a").contains("USER").should("be.visible");

    // Click user profile (if exists)
    cy.get('a[href*="/user/"]').should("exist");
  });

  it("TC07 - Mobile menu", () => {
    cy.viewport(375, 667); // Mobile
    cy.visitApp("/home-page");

    // Kiểm tra mobile menu button
    cy.get("#bar").should("be.visible");

    // Click menu button
    cy.get("#bar").click();

    // Kiểm tra menu hiển thị
    cy.get("ul").should("be.visible");
  });

  it("TC08 - Footer links", () => {
    cy.visitApp("/home-page");

    // Scroll xuống footer
    cy.get("footer").scrollIntoView().should("be.visible");

    // Kiểm tra footer content
    cy.get("footer").within(() => {
      cy.contains("FIVE FEEDS").should("be.visible");
      cy.get("input[placeholder='Họ tên']").should("be.visible");
      cy.get("input[placeholder='Email']").should("be.visible");
    });
  });

  it("TC09 - Breadcrumb navigation", () => {
    cy.goToProducts();
    cy.get(".pro").first().click();

    // Kiểm tra breadcrumb (nếu có)
    cy.get("#page-header").should("be.visible");
  });

  it("TC10 - 404 error handling", () => {
    // Visit trang không tồn tại
    cy.visit("/non-existent-page", { failOnStatusCode: false });

    // App vẫn hoạt động và redirect về home
    cy.url().should("include", "/home-page");
    cy.get("header").should("be.visible");
  });

  it("TC11 - URL routing works correctly", () => {
    // Test direct URL access
    cy.visit("/cart");
    cy.shouldBeOnPage("cart");

    cy.visit("/product/search/1/8");
    cy.get(".pro-container", { timeout: 8000 }).should("be.visible");
  });

  it("TC12 - Back/Forward browser buttons", () => {
    cy.visitApp("/home-page");
    cy.goToProducts();

    // Test browser back button
    cy.go("back");
    cy.url().should("include", "/home-page");

    // Test browser forward button
    cy.go("forward");
    cy.url().should("include", "/product/search");
  });
});
