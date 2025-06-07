describe("Đặt hàng Tests", () => {
  beforeEach(() => {
    cy.mockAPIs();
    cy.login();
    cy.addProductToCart();
    cy.visit("/cart");
    cy.get('thead input[type="checkbox"]').check();
    cy.get("button").contains("Mua hàng").click();
    cy.url().should("include", "/checkout");
  });

  it("TC08 - Hiển thị layout checkout 2 cột", () => {
    // Kiểm tra grid container
    cy.get(".grid.grid-cols-1").should("exist");
    cy.get(".md\\:grid-cols-2").should("exist");

    // Cột trái - Đơn hàng
    cy.get(".order-1").within(() => {
      cy.get("h3").contains("Đơn hàng của bạn").should("be.visible");
      cy.get(".shadow-lg").should("have.length.greaterThan", 0);
    });

    // Cột phải - Thông tin
    cy.get(".order-2").within(() => {
      cy.get("h3").contains("Địa chỉ giao hàng").should("be.visible");
    });
  });

  it("TC09 - Hiển thị thông tin sản phẩm trong đơn hàng", () => {
    // Kiểm tra có hiển thị sản phẩm
    cy.get(".shadow-lg").within(() => {
      cy.get("img").should("be.visible");
      cy.get("h4").should("be.visible"); // Tên sản phẩm
      cy.get("p").contains("Số lượng").should("be.visible");
      cy.get("p").contains("Đơn giá").should("be.visible");
    });

    // Kiểm tra tổng tiền
    cy.contains("Tổng thanh toán").should("be.visible");
  });

  it("TC10 - Mở modal thay đổi địa chỉ", () => {
    cy.get("button").contains("Thay đổi").click();

    // Kiểm tra modal hiển thị
    cy.get(".fixed.inset-0").should("be.visible");
    cy.get(".bg-gray-500.bg-opacity-50").should("exist"); // Overlay
    cy.get(".shadow-lg").within(() => {
      cy.get("h3").contains("Chọn địa chỉ giao hàng").should("be.visible");
    });
  });

  it("TC11 - Thêm địa chỉ giao hàng mới", () => {
    cy.get("button").contains("Thay đổi").click();

    // Điền form địa chỉ mới
    cy.get('input[placeholder="Thêm tên mới"]').type("Nguyễn Văn A");
    cy.get('input[placeholder="Thêm địa chỉ mới"]').type(
      "123 Đường Test, Quận 1, TP.HCM",
    );
    cy.get('input[placeholder="Thêm số điện thoại"]').type("0987654321");

    // Submit form
    cy.get('input[value="Thêm địa chỉ"]').click();

    // Đóng modal
    cy.get("button").contains("Đóng").click();
    cy.get(".fixed.inset-0").should("not.exist");
  });

  it("TC12 - Chọn phương thức thanh toán", () => {
    // Kiểm tra có 2 phương thức
    cy.get("button").contains("Thanh toán khi nhận hàng").should("be.visible");
    cy.get("button").contains("Thanh toán qua MOMO").should("be.visible");

    // Chọn Cash on Delivery
    cy.get("button").contains("Thanh toán khi nhận hàng").click();
    cy.get("button")
      .contains("Thanh toán khi nhận hàng")
      .should("have.class", "bg-[#006532]");

    // Chọn MOMO
    cy.get("button").contains("Thanh toán qua MOMO").click();
    cy.get("button")
      .contains("Thanh toán qua MOMO")
      .should("have.class", "bg-[#006532]");
  });

  it("TC13 - Hoàn tất đặt hàng", () => {
    // Chọn phương thức thanh toán
    cy.get("button").contains("Thanh toán khi nhận hàng").click();

    // Đặt hàng
    cy.get("button").contains("Đặt hàng").click();

    // Kiểm tra chuyển đến success page
    cy.url().should("include", "/order-success");
    cy.get("h2").contains("Thanh toán thành công!").should("be.visible");
    cy.get("p").contains("Cảm ơn bạn đã mua hàng").should("be.visible");
  });

  it("TC14 - Kiểm tra responsive checkout trên tablet", () => {
    cy.viewport(768, 1024); // iPad

    // Layout vẫn hiển thị đúng
    cy.get(".grid").should("exist");
    cy.get(".order-1").should("be.visible");
    cy.get(".order-2").should("be.visible");
  });
});
