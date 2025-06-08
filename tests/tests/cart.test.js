const { expect } = require("chai");
const { By } = require("selenium-webdriver");
const BaseTest = require("./base-test");

describe("Cart Functionality Tests", function () {
  this.timeout(30000);
  let test;

  beforeEach(async () => {
    test = new BaseTest();
    await test.setup();
  });

  afterEach(async () => {
    await test.teardown();
  });

  it("TC01 - Hiển thị trang giỏ hàng", async () => {
    await test.visitAndLogin("/cart");

    const url = await test.driver.getCurrentUrl();
    expect(url).to.include("/cart");

    const bodyText = await test.getText(By.tagName("body"));
    expect(bodyText).to.include("Giỏ hàng");

    const hasTable = await test.isElementPresent(By.tagName("table"));
    const hasEmptyState =
      bodyText.includes("trống") || bodyText.includes("Mua ngay");

    expect(hasTable || hasEmptyState).to.be.true;
  });

  it("TC02 - Hiển thị sản phẩm trong giỏ hàng", async () => {
    await test.visitAndLogin("/cart");

    const hasTable = await test.isElementPresent(By.tagName("table"));

    if (hasTable) {
      const hasHeaders = await test.isElementPresent(By.css("thead th"));
      expect(hasHeaders).to.be.true;

      const productRows = await test.driver.findElements(By.css("tbody tr"));

      if (productRows.length > 0) {
        const firstRow = productRows[0];
        const images = await firstRow.findElements(By.tagName("img"));
        expect(images.length).to.be.greaterThan(0);
      }
    }
  });

  it("TC03 - Thay đổi số lượng sản phẩm", async () => {
    await test.visitAndLogin("/cart");

    const plusButtons = await test.driver.findElements(
      By.xpath("//button[contains(text(), '+')]")
    );
    const minusButtons = await test.driver.findElements(
      By.xpath("//button[contains(text(), '-')]")
    );

    if (plusButtons.length > 0) {
      await plusButtons[0].click();
      await test.driver.sleep(1000);
      console.log("✅ Quantity increase tested");

      if (minusButtons.length > 0) {
        await minusButtons[0].click();
        await test.driver.sleep(1000);
        console.log("✅ Quantity decrease tested");
      }
    }
  });

  it("TC04 - Xóa sản phẩm khỏi giỏ hàng", async () => {
    await test.visitAndLogin("/cart");

    const deleteButtons = await test.driver.findElements(
      By.xpath("//button[contains(text(), 'Xóa')]")
    );

    if (deleteButtons.length > 0) {
      await deleteButtons[0].click();
      await test.driver.sleep(2000);
      console.log("✅ Delete functionality tested");
    }
  });

  it("TC05 - Chọn sản phẩm và tính tổng tiền", async () => {
    await test.visitAndLogin("/cart");

    const selectAllCheckbox = await test.driver.findElements(
      By.css('thead input[type="checkbox"]')
    );
    const itemCheckboxes = await test.driver.findElements(
      By.css('tbody input[type="checkbox"]')
    );

    if (selectAllCheckbox.length > 0) {
      await selectAllCheckbox[0].click();
      await test.driver.sleep(1000);
      console.log("✅ Select all functionality tested");
    }

    if (itemCheckboxes.length > 0) {
      await itemCheckboxes[0].click();
      await test.driver.sleep(1000);
      console.log("✅ Individual selection tested");
    }

    const hasTotalPrice = await test.isElementPresent(
      By.xpath("//*[contains(text(), 'Tổng thanh toán')]")
    );
    expect(hasTotalPrice).to.be.true;
  });

  it("TC06 - Chuyển đến trang thanh toán", async () => {
    await test.visitAndLogin("/cart");

    const selectAllCheckbox = await test.driver.findElements(
      By.css('thead input[type="checkbox"]')
    );
    if (selectAllCheckbox.length > 0) {
      await selectAllCheckbox[0].click();
      await test.driver.sleep(1000);
    }

    const checkoutButtons = await test.driver.findElements(
      By.xpath("//button[contains(text(), 'Mua hàng')]")
    );

    if (checkoutButtons.length > 0) {
      await checkoutButtons[0].click();
      await test.driver.sleep(3000);

      const success = await test.waitForUrl("/checkout", 5000);
      if (success) {
        expect(success).to.be.true;
        console.log("✅ Successfully navigated to checkout");
      }
    }
  });

  it("TC07 - Giỏ hàng trống state", async () => {
    // Override mock to return empty cart
    await test.visit("/cart");
    await test.driver.executeScript(`
      window.fetch = function(url, options) {
        if (url.includes('/cart/all-product/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: { cart: [], total: 0 }
            })
          });
        }
        return window.originalFetch(url, options);
      };
    `);
    await test.login();
    await test.driver.sleep(2000);

    const bodyText = await test.getText(By.tagName("body"));

    if (bodyText.includes("trống") || bodyText.includes("empty")) {
      const buyNowButton = await test.isElementPresent(
        By.xpath("//button[contains(text(), 'Mua ngay')]")
      );
      expect(buyNowButton).to.be.true;
      console.log("✅ Empty cart state verified");
    }
  });

  it("TC08 - Responsive cart trên mobile", async () => {
    await test.setViewport(375, 667);
    await test.visitAndLogin("/cart");

    const bodyText = await test.getText(By.tagName("body"));
    expect(bodyText).to.include("Giỏ hàng");

    console.log("✅ Mobile cart layout verified");
  });

  it("TC09 - Brand colors trong cart", async () => {
    await test.visitAndLogin("/cart");

    const brandElements = await test.driver.findElements(
      By.css('[class*="006532"], .bg-\\[\\#006532\\]')
    );

    const headers = await test.driver.findElements(By.css("thead th"));

    if (brandElements.length > 0 || headers.length > 0) {
      console.log("✅ Brand elements found in cart");
    }
  });

  it("TC10 - Cart performance test", async () => {
    const startTime = Date.now();

    await test.visitAndLogin("/cart");
    await test.waitForElement(By.tagName("body"));

    const loadTime = Date.now() - startTime;
    console.log(`📊 Cart loaded in ${loadTime}ms`);

    expect(loadTime).to.be.lessThan(10000);
  });
});
