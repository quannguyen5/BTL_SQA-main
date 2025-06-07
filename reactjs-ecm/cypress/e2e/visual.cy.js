describe("Visual Testing - UI Layout", () => {
  beforeEach(() => {
    cy.mockAPIs();
    cy.login();
  });

  it("VT01 - Kiểm tra màu sắc brand trong cart", () => {
    cy.visit("/cart");

    // Kiểm tra màu header table (có thể dùng contains thay vì exact color)
    cy.get("thead th").should("have.class", "bg-[#006532]");

    // Kiểm tra button style
    cy.get("button").contains("Mua hàng").should("be.visible");
  });

  it("VT02 - Kiểm tra layout responsive cart", () => {
    // Desktop
    cy.viewport(1280, 720);
    cy.visit("/cart");
    cy.get("table").should("be.visible");

    // Tablet
    cy.viewport(768, 1024);
    cy.get("table").should("be.visible");

    // Mobile
    cy.viewport(375, 667);
    cy.get("table").should("be.visible");
  });

  it("VT03 - Kiểm tra layout elements tồn tại", () => {
    cy.addProductToCart();
    cy.visit("/cart");
    cy.get('thead input[type="checkbox"]').check();
    cy.get("button").contains("Mua hàng").click();

    // Kiểm tra elements tồn tại
    cy.get(".grid").should("exist");
    cy.get(".order-1").should("be.visible");
    cy.get(".order-2").should("be.visible");
  });

  it("VT04 - Kiểm tra modal hiển thị", () => {
    cy.addProductToCart();
    cy.visit("/cart");
    cy.get('thead input[type="checkbox"]').check();
    cy.get("button").contains("Mua hàng").click();

    // Mở modal
    cy.get("button").contains("Thay đổi").click();

    // Kiểm tra modal elements
    cy.get(".fixed.inset-0").should("be.visible");
    cy.get(".shadow-lg").should("be.visible");
  });

  it("VT05 - Kiểm tra notification hiển thị", () => {
    cy.visit("/cart");
    cy.get("button").contains("+").first().click();

    // Notification xuất hiện
    cy.get(".toast-notification", { timeout: 10000 }).should("be.visible");
  });
});
