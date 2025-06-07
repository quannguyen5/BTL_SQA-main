describe("Giỏ hàng Tests", () => {
  beforeEach(() => {
    // Mock APIs để test nhanh hơn
    cy.mockAPIs();
    cy.login();
  });

  it("TC01 - Hiển thị giỏ hàng", () => {
    cy.visit("/cart");
    cy.wait("@getCart");

    // Kiểm tra layout table
    cy.get("table").should("be.visible");
    cy.get("thead th").should("have.length", 4); // 4 cột: checkbox, sản phẩm, số lượng, giá

    // Kiểm tra header màu brand
    cy.get("thead th").should(
      "have.css",
      "background-color",
      "rgb(0, 101, 50)",
    );
  });

  it("TC02 - Thêm sản phẩm vào giỏ hàng", () => {
    cy.addProductToCart();

    // Kiểm tra giỏ hàng cập nhật
    cy.get('a[href="/cart"]').click();
    cy.get("table tbody tr").should("have.length.greaterThan", 0);
  });

  it("TC03 - Tăng số lượng sản phẩm", () => {
    cy.visit("/cart");
    cy.wait("@getCart");

    // Click nút tăng
    cy.get("button").contains("+").first().click();
    cy.get(".toast-notification", { timeout: 5000 })
      .should("be.visible")
      .and("contain", "Tăng số lượng thành công!");
  });

  it("TC04 - Giảm số lượng sản phẩm", () => {
    cy.visit("/cart");
    cy.wait("@getCart");

    // Click nút giảm
    cy.get("button").contains("-").first().click();
    cy.get(".toast-notification", { timeout: 5000 })
      .should("be.visible")
      .and("contain", "Giảm số lượng thành công!");
  });

  it("TC05 - Xóa sản phẩm khỏi giỏ hàng", () => {
    cy.visit("/cart");
    cy.wait("@getCart");

    // Click xóa
    cy.get("button").contains("Xóa").first().click();
    cy.get(".toast-notification", { timeout: 5000 })
      .should("be.visible")
      .and("contain", "Sản phẩm đã được xóa khỏi giỏ hàng!");
  });

  it("TC06 - Chọn sản phẩm và tính tổng tiền", () => {
    cy.visit("/cart");
    cy.wait("@getCart");

    // Chọn tất cả sản phẩm
    cy.get('thead input[type="checkbox"]').check();

    // Kiểm tra tổng tiền hiển thị
    cy.get(".total-price").should("be.visible");
    cy.contains("Tổng thanh toán").should("be.visible");

    // Chuyển đến checkout
    cy.get("button").contains("Mua hàng").click();
    cy.url().should("include", "/checkout");
  });

  it("TC07 - Kiểm tra responsive mobile", () => {
    cy.viewport(375, 667); // iPhone SE
    cy.visit("/cart");

    // Table vẫn hiển thị trên mobile
    cy.get("table").should("be.visible");
    cy.get(".total-price").should("be.visible");
  });
});
