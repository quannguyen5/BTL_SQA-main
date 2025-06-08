// cypress/e2e/cart.cy.js

describe("Giỏ hàng - Cart Tests", () => {
  beforeEach(() => {
    cy.mockAPIs();
    cy.login();
  });

  it("TC01 - Hiển thị trang giỏ hàng", () => {
    cy.goToCart();

    // Kiểm tra layout cơ bản
    cy.get("table").should("be.visible");
    cy.get("thead th").should("have.length", 4);
    cy.contains("Giỏ hàng của bạn").should("be.visible");

    // Kiểm tra styling
    cy.get("thead th").should("have.class", "bg-[#006532]");
  });

  it("TC02 - Hiển thị sản phẩm trong giỏ hàng", () => {
    cy.goToCart();

    // Kiểm tra có sản phẩm
    cy.get("tbody tr").should("have.length.at.least", 1);

    // Kiểm tra thông tin sản phẩm
    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get("img").should("be.visible");
        cy.contains("Thức ăn cho gà").should("be.visible");
        cy.contains("Bao:").should("be.visible");
        cy.contains("Đơn giá:").should("be.visible");
      });
  });

  it("TC03 - Thay đổi số lượng sản phẩm", () => {
    cy.goToCart();

    // Tăng số lượng
    cy.get("button").contains("+").first().click();
    cy.wait("@updateCart");

    // Giảm số lượng
    cy.get("button").contains("-").first().click();
    cy.wait("@updateCart");

    // Kiểm tra input số lượng
    cy.get('input[type="text"]').should("be.visible");
  });

  it("TC04 - Xóa sản phẩm khỏi giỏ hàng", () => {
    cy.goToCart();

    // Click nút xóa
    cy.get("button").contains("Xóa").first().click();
    cy.wait("@deleteCart");

    // Có thể check notification xuất hiện
    cy.checkNotification("đã được xóa");
  });

  it("TC05 - Chọn sản phẩm và tính tổng tiền", () => {
    cy.goToCart();

    // Chọn sản phẩm riêng lẻ
    cy.get('tbody input[type="checkbox"]').first().check();
    cy.get('tbody input[type="checkbox"]').first().should("be.checked");

    // Chọn tất cả
    cy.selectAllCartItems();

    // Kiểm tra hiển thị tổng tiền
    cy.get(".total-price").should("be.visible");
    cy.contains("Tổng thanh toán").should("be.visible");
  });

  it("TC06 - Chuyển đến trang thanh toán", () => {
    cy.goToCart();
    cy.proceedToCheckout();

    // Kiểm tra đã chuyển đến checkout
    cy.shouldBeOnPage("checkout");
  });

  it("TC07 - Hiển thị giỏ hàng trống", () => {
    // Mock giỏ hàng trống
    cy.intercept("GET", "**/cart/all-product/**", {
      statusCode: 200,
      body: { success: true, data: { cart: [], total: 0 } },
    });

    cy.goToCart();

    // Kiểm tra thông báo giỏ hàng trống
    cy.contains("Giỏ hàng của bạn đang trống").should("be.visible");
    cy.get("button").contains("Mua ngay").should("be.visible");
  });

  it("TC08 - Responsive trên mobile", () => {
    // Test mobile viewport
    cy.viewport(375, 667);
    cy.goToCart();

    // Layout vẫn hiển thị OK
    cy.get("table").should("be.visible");
    cy.get(".total-price").should("be.visible");
  });

  it("TC09 - Test flow hoàn chỉnh từ cart đến order success", () => {
    cy.goToCart();
    cy.proceedToCheckout();
    cy.completeOrder();

    // Kiểm tra đặt hàng thành công
    cy.shouldBeOnPage("order-success");
    cy.contains("Cảm ơn bạn đã mua hàng").should("be.visible");
  });
});
