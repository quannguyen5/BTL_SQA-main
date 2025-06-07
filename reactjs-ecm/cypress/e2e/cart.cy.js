// cypress/e2e/cart-improved.cy.js

describe("Cart Tests - Improved Version", () => {
  beforeEach(() => {
    // Setup mock APIs first
    cy.mockAPIs();
    // Login user
    cy.login();
  });

  it("TC01 - Should display cart page layout correctly", () => {
    // Navigate to cart safely
    cy.navigateToCart();

    // Verify cart page loaded
    cy.get("table", { timeout: 10000 }).should("be.visible");
    cy.get("thead th").should("have.length", 4); // checkbox, product, quantity, price

    // Check header styling
    cy.get("thead th").should("have.class", "bg-[#006532]");
    cy.get("thead th").should("have.css", "color", "rgb(255, 255, 255)");

    // Check page header
    cy.get("#page-header").should("be.visible");
    cy.contains("Giỏ hàng của bạn").should("be.visible");
  });

  it("TC02 - Should add product to cart successfully", () => {
    // Use improved add to cart command
    cy.addProductToCart();

    // Navigate to cart and verify
    cy.navigateToCart();
    cy.get("tbody tr").should("have.length.at.least", 1);

    // Verify product information displayed
    cy.get("tbody tr")
      .first()
      .within(() => {
        cy.get("img").should("be.visible");
        cy.get("p").contains("Thức ăn cho gà").should("be.visible");
        cy.get("p").contains("Bao:").should("be.visible");
        cy.get("p").contains("Đơn giá:").should("be.visible");
      });
  });

  it("TC03 - Should handle cart quantity operations", () => {
    // Navigate to cart
    cy.navigateToCart();

    // Wait for cart data
    cy.wait("@getCart");

    // Test increase quantity
    cy.get("button").contains("+").first().click();
    cy.wait("@updateCart");

    // Test decrease quantity
    cy.get("button").contains("-").first().click();
    cy.wait("@updateCart");

    // Verify quantity input is present
    cy.get('input[type="text"]').should("be.visible");
  });

  it("TC04 - Should remove items from cart", () => {
    cy.navigateToCart();
    cy.wait("@getCart");

    // Click remove button
    cy.get("button").contains("Xóa").first().click();
    cy.wait("@deleteCart");

    // Verify removal (this would normally show empty cart or update list)
    cy.log("Item removal completed");
  });

  it("TC05 - Should handle item selection and total calculation", () => {
    cy.navigateToCart();
    cy.wait("@getCart");

    // Test individual item selection
    cy.get('tbody input[type="checkbox"]').first().check();
    cy.get('tbody input[type="checkbox"]').first().should("be.checked");

    // Test select all functionality
    cy.get('thead input[type="checkbox"]').check();
    cy.get('tbody input[type="checkbox"]').should("be.checked");

    // Verify total calculation section
    cy.get(".total-price").should("be.visible");
    cy.contains("Tổng thanh toán").should("be.visible");
  });

  it("TC06 - Should proceed to checkout successfully", () => {
    cy.navigateToCart();
    cy.wait("@getCart");

    // Select items
    cy.get('thead input[type="checkbox"]').check();

    // Proceed to checkout
    cy.get("button").contains("Mua hàng").click();
    cy.url().should("include", "/checkout");

    // Verify checkout page elements
    cy.get(".grid").should("exist");
    cy.get(".order-1").should("be.visible"); // Order summary
    cy.get(".order-2").should("be.visible"); // Shipping info
  });

  it("TC07 - Should display empty cart state", () => {
    // Mock empty cart
    cy.intercept("GET", "**/cart/all-product/**", {
      statusCode: 200,
      body: {
        success: true,
        data: { cart: [], total: 0 },
      },
    }).as("getEmptyCart");

    cy.navigateToCart();
    cy.wait("@getEmptyCart");

    // Verify empty cart message
    cy.contains("Giỏ hàng của bạn đang trống").should("be.visible");
    cy.get("button").contains("Mua ngay").should("be.visible");
  });

  it("TC08 - Should handle checkout address modal", () => {
    cy.navigateToCart();
    cy.get('thead input[type="checkbox"]').check();
    cy.get("button").contains("Mua hàng").click();

    // Wait for checkout page
    cy.url().should("include", "/checkout");
    cy.wait("@getAddresses");

    // Open address modal
    cy.get("button").contains("Thay đổi").click();
    cy.get(".fixed.inset-0").should("be.visible");

    // Verify modal content
    cy.get("h3").contains("Chọn địa chỉ giao hàng").should("be.visible");

    // Fill new address form
    cy.get('input[placeholder="Thêm tên mới"]').type("Nguyễn Văn B");
    cy.get('input[placeholder="Thêm địa chỉ mới"]').type(
      "456 New Street, District 2",
    );
    cy.get('input[placeholder="Thêm số điện thoại"]').type("0901234567");

    // Submit form
    cy.get('input[value="Thêm địa chỉ"]').click();

    // Close modal
    cy.get("button").contains("Đóng").click();
    cy.get(".fixed.inset-0").should("not.exist");
  });

  it("TC09 - Should handle payment method selection", () => {
    cy.navigateToCart();
    cy.get('thead input[type="checkbox"]').check();
    cy.get("button").contains("Mua hàng").click();

    // Wait for checkout page
    cy.url().should("include", "/checkout");

    // Test Cash on Delivery selection
    cy.get("button").contains("Thanh toán khi nhận hàng").click();
    cy.get("button")
      .contains("Thanh toán khi nhận hàng")
      .should("have.class", "bg-[#006532]");

    // Test MOMO payment selection
    cy.get("button").contains("Thanh toán qua MOMO").click();
    cy.get("button")
      .contains("Thanh toán qua MOMO")
      .should("have.class", "bg-[#006532]");
  });

  it("TC10 - Should complete order successfully", () => {
    cy.navigateToCart();
    cy.get('thead input[type="checkbox"]').check();
    cy.get("button").contains("Mua hàng").click();

    // Complete order using helper command
    cy.completeOrder();

    // Verify success page
    cy.url().should("include", "/order-success");
    cy.get("h2").contains("Thanh toán thành công!").should("be.visible");
    cy.get("p").contains("Cảm ơn bạn đã mua hàng").should("be.visible");

    // Verify action buttons
    cy.get("button").contains("Tiếp tục mua").should("be.visible");
    cy.get("button").contains("Xem chi tiết đặt hàng").should("be.visible");
  });

  it("TC11 - Should test responsive design", () => {
    cy.navigateToCart();

    // Test mobile viewport
    cy.setMobileViewport();
    cy.get("table").should("be.visible");
    cy.get(".total-price").should("be.visible");

    // Test tablet viewport
    cy.setTabletViewport();
    cy.get("table").should("be.visible");
    cy.get(".total-price").should("be.visible");

    // Test desktop viewport
    cy.setDesktopViewport();
    cy.get("table").should("be.visible");
    cy.get(".total-price").should("be.visible");
  });

  it("TC12 - Should navigate through product detail to cart", () => {
    // Navigate to products using safe routing
    cy.navigateToProducts();

    // Wait for products to load
    cy.get(".pro-container", { timeout: 15000 }).should("be.visible");

    // Click on a product
    cy.get(".pro").first().click();

    // Verify product detail page
    cy.url().should("include", "/product-detail/");
    cy.get(".single-pro-details").should("be.visible");

    // Verify product information
    cy.get(".single-pro-details h4").should("be.visible");
    cy.get(".single-pro-details h2").should("be.visible"); // Price
    cy.get(".single-pro-details p").should("contain", "Chi tiết sản phẩm");

    // Add to cart from product detail
    cy.get("button").contains("Thêm vào giỏ hàng").click();

    // Navigate to cart and verify item was added
    cy.navigateToCart();
    cy.get("tbody tr").should("have.length.at.least", 1);
  });

  it("TC13 - Should handle cart operations without errors", () => {
    cy.navigateToCart();
    cy.wait("@getCart");

    // Test all cart operations in sequence
    cy.get("button").contains("+").first().click();
    cy.wait(1000);

    cy.get("button").contains("-").first().click();
    cy.wait(1000);

    cy.get('tbody input[type="checkbox"]').first().check();
    cy.wait(500);

    cy.get('thead input[type="checkbox"]').check();
    cy.wait(500);

    cy.get('thead input[type="checkbox"]').uncheck();
    cy.wait(500);

    // Verify no JavaScript errors occurred
    cy.window().then((win) => {
      expect(win.console.error).to.not.have.been.called;
    });
  });

  it("TC14 - Should handle network errors gracefully", () => {
    // Mock network error
    cy.intercept("GET", "**/cart/all-product/**", {
      statusCode: 500,
      body: { error: "Internal Server Error" },
    }).as("getCartError");

    cy.navigateToCart();
    cy.wait("@getCartError");

    // App should still be functional
    cy.get("header").should("be.visible");
    cy.get("body").should("not.contain", "Error 500");
  });

  it("TC15 - Should validate cart UI elements styling", () => {
    cy.navigateToCart();
    cy.wait("@getCart");

    // Check table styling
    cy.get("table").should("have.class", "w-full");
    cy.get("table").should("have.class", "border-collapse");

    // Check header styling
    cy.get("thead th").should("have.class", "bg-[#006532]");
    cy.get("thead th").should("have.class", "text-white");

    // Check button styling
    cy.get("button")
      .contains("Mua hàng")
      .should("have.class", "bg-[#006532]")
      .should("have.class", "text-white");

    // Check total calculation styling
    cy.get(".total-price").should("be.visible");
    cy.get(".total-price").within(() => {
      cy.get("table").should("have.class", "border-t-4");
      cy.get("table").should("have.class", "border-[#006532]");
    });
  });
});
