// cypress/e2e/checkout.cy.js

describe("Thanh toán - Checkout Tests", () => {
  beforeEach(() => {
    cy.mockAPIs();
    cy.login();

    // Đi đến trang checkout
    cy.goToCart();
    cy.proceedToCheckout();
  });

  it("TC01 - Hiển thị layout trang checkout", () => {
    // Kiểm tra layout 2 cột
    cy.get(".grid").should("exist");
    cy.get(".order-1").should("be.visible"); // Cột đơn hàng
    cy.get(".order-2").should("be.visible"); // Cột thông tin

    // Kiểm tra tiêu đề
    cy.contains("Đơn hàng của bạn").should("be.visible");
    cy.contains("Địa chỉ giao hàng").should("be.visible");
  });

  it("TC02 - Hiển thị thông tin sản phẩm trong đơn hàng", () => {
    cy.get(".order-1").within(() => {
      // Kiểm tra có sản phẩm
      cy.get(".shadow-lg").should("exist");
      cy.get("img").should("be.visible");
      cy.get("h4").should("be.visible"); // Tên sản phẩm

      // Kiểm tra thông tin sản phẩm
      cy.contains("Số lượng").should("be.visible");
      cy.contains("Đơn giá").should("be.visible");
    });

    // Kiểm tra tổng tiền
    cy.contains("Tổng thanh toán").should("be.visible");
  });

  it("TC03 - Hiển thị thông tin địa chỉ giao hàng", () => {
    cy.get(".order-2").within(() => {
      // Kiểm tra form địa chỉ
      cy.get("input").should("have.length.at.least", 3);

      // Kiểm tra nút thay đổi
      cy.get("button").contains("Thay đổi").should("be.visible");
    });
  });

  it("TC04 - Mở modal thay đổi địa chỉ", () => {
    // Click nút thay đổi
    cy.get("button").contains("Thay đổi").click();

    // Kiểm tra modal hiển thị
    cy.get(".fixed.inset-0").should("be.visible");
    cy.get(".bg-gray-500.bg-opacity-50").should("exist"); // Overlay

    // Kiểm tra nội dung modal
    cy.contains("Chọn địa chỉ giao hàng").should("be.visible");
  });

  it("TC05 - Thêm địa chỉ mới", () => {
    cy.get("button").contains("Thay đổi").click();

    // Điền form địa chỉ mới
    cy.get('input[placeholder="Thêm tên mới"]').type("Nguyễn Văn B");
    cy.get('input[placeholder="Thêm địa chỉ mới"]').type("456 New Street");
    cy.get('input[placeholder="Thêm số điện thoại"]').type("0901234567");

    // Submit form
    cy.get('input[value="Thêm địa chỉ"]').click();

    // Đóng modal
    cy.get("button").contains("Đóng").click();
    cy.get(".fixed.inset-0").should("not.exist");
  });

  it("TC06 - Chọn phương thức thanh toán", () => {
    // Kiểm tra có 2 phương thức
    cy.get("button").contains("Thanh toán khi nhận hàng").should("be.visible");
    cy.get("button").contains("Thanh toán qua MOMO").should("be.visible");

    // Test chọn Cash on Delivery
    cy.selectPaymentMethod("Thanh toán khi nhận hàng");

    // Test chọn MOMO
    cy.selectPaymentMethod("Thanh toán qua MOMO");
  });

  it("TC07 - Hoàn tất đặt hàng thành công", () => {
    // Chọn phương thức thanh toán
    cy.selectPaymentMethod();

    // Đặt hàng
    cy.get("button").contains("Đặt hàng").click();

    // Kiểm tra chuyển đến success page
    cy.shouldBeOnPage("order-success");
    cy.contains("Cảm ơn bạn đã mua hàng").should("be.visible");
  });

  it("TC08 - Kiểm tra tổng tiền calculation", () => {
    // Kiểm tra các dòng tính tiền
    cy.contains("Tổng tiền hàng").should("be.visible");
    cy.contains("Tổng tiền phí vận chuyển").should("be.visible");
    cy.contains("Tổng thanh toán").should("be.visible");

    // Kiểm tra format tiền tệ (có ký tự đ)
    cy.get("span").contains("đ").should("exist");
  });

  it("TC09 - Test responsive trên tablet", () => {
    cy.viewport(768, 1024); // iPad

    // Layout vẫn hiển thị đúng
    cy.get(".grid").should("exist");
    cy.get(".order-1").should("be.visible");
    cy.get(".order-2").should("be.visible");
  });

  it("TC10 - Test error handling", () => {
    // Mock lỗi khi tạo order
    cy.intercept("POST", "**/order/**", {
      statusCode: 500,
      body: { error: "Server error" },
    });

    cy.selectPaymentMethod();
    cy.get("button").contains("Đặt hàng").click();

    // App vẫn hoạt động bình thường
    cy.get("header").should("be.visible");
  });
});
