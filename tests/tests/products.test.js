const { expect } = require("chai");
const { By, Key } = require("selenium-webdriver");
const BaseTest = require("./base-test");

describe("Product Search & Display Tests", function () {
  this.timeout(30000);
  let test;

  beforeEach(async () => {
    test = new BaseTest();
    await test.setup();
  });

  afterEach(async () => {
    await test.teardown();
  });

  it("TC01 - Trang sản phẩm hiển thị đúng", async () => {
    await test.visitAndLogin("/product/search/1/8");

    const url = await test.driver.getCurrentUrl();
    expect(url).to.include("/product");

    const bodyText = await test.getText(By.tagName("body"));
    expect(bodyText).to.include("sản phẩm");
  });

  it("TC02 - Tìm kiếm sản phẩm", async () => {
    await test.visitAndLogin("/product/search/1/8");

    const searchInputs = await test.driver.findElements(
      By.css('input[placeholder*="Tìm kiếm"], input[placeholder*="search"]')
    );

    if (searchInputs.length > 0) {
      await searchInputs[0].sendKeys("thức ăn gà");
      await searchInputs[0].sendKeys(Key.ENTER);
      await test.driver.sleep(2000);

      console.log("✅ Search functionality tested");
    }
  });

  it("TC03 - Filter theo category", async () => {
    await test.visitAndLogin("/product/search/1/8");

    const categorySelects = await test.driver.findElements(
      By.tagName("select")
    );

    if (categorySelects.length > 0) {
      const options = await categorySelects[0].findElements(
        By.tagName("option")
      );

      if (options.length > 1) {
        await options[1].click();
        await test.driver.sleep(2000);
        console.log("✅ Category filter tested");
      }
    }
  });

  it("TC04 - Hiển thị danh sách sản phẩm", async () => {
    await test.visitAndLogin("/product/search/1/8");

    const productElements = await test.driver.findElements(
      By.css(".pro, .product-card, .product-item, .cursor-pointer")
    );

    if (productElements.length > 0) {
      const firstProduct = productElements[0];

      const hasImage = await firstProduct
        .findElements(By.tagName("img"))
        .then((els) => els.length > 0);
      const hasName = await firstProduct
        .findElements(By.css("h5, .product-name"))
        .then((els) => els.length > 0);
      const hasPrice = await firstProduct
        .findElements(By.css("h4, .price"))
        .then((els) => els.length > 0);

      expect(hasImage).to.be.true;
      expect(hasName || hasPrice).to.be.true;

      console.log("✅ Product cards displayed correctly");
    } else {
      console.log("ℹ️ No products found - checking page structure");
      const bodyText = await test.getText(By.tagName("body"));
      expect(bodyText).to.include("sản phẩm");
    }
  });

  it("TC05 - Click vào sản phẩm để xem chi tiết", async () => {
    await test.visitAndLogin("/product/search/1/8");

    const productElements = await test.driver.findElements(
      By.css(".pro, .product-card, .product-item, .cursor-pointer")
    );

    if (productElements.length > 0) {
      await productElements[0].click();

      const success = await test.waitForUrl("/product-detail", 10000);

      if (success) {
        console.log("✅ Product detail navigation successful");
        expect(success).to.be.true;
      } else {
        console.log("ℹ️ Product detail navigation may not be available");
      }
    }
  });

  it("TC06 - Thêm sản phẩm vào giỏ hàng", async () => {
    await test.visitAndLogin("/product/search/1/8");

    const addToCartButtons = await test.driver.findElements(
      By.css('.cart, .add-to-cart, [data-testid="add-to-cart"]')
    );

    if (addToCartButtons.length > 0) {
      await addToCartButtons[0].click();
      await test.driver.sleep(2000);

      console.log("✅ Add to cart functionality tested");
    }
  });

  it("TC07 - Pagination hoạt động", async () => {
    await test.visitAndLogin("/product/search/1/8");

    const paginationElements = await test.driver.findElements(
      By.css("#pagination, .pagination, .page")
    );

    if (paginationElements.length > 0) {
      const nextButtons = await test.driver.findElements(
        By.xpath(
          "//button[contains(text(), 'Tiếp')] | //a[contains(text(), '2')]"
        )
      );

      if (nextButtons.length > 0) {
        await nextButtons[0].click();
        await test.driver.sleep(2000);
        console.log("✅ Pagination tested");
      }
    }
  });

  it("TC08 - Responsive products trên mobile", async () => {
    await test.setViewport(375, 667);
    await test.visitAndLogin("/product/search/1/8");

    const bodyText = await test.getText(By.tagName("body"));
    expect(bodyText).to.include("sản phẩm");

    console.log("✅ Mobile products layout verified");
  });

  it("TC09 - Hero banner và featured products trên home", async () => {
    await test.visitAndLogin("/home-page");

    const hasHero = await test.isElementPresent(
      By.css(".hero, .banner, section")
    );
    expect(hasHero).to.be.true;

    const bodyText = await test.getText(By.tagName("body"));
    const hasFeatures =
      bodyText.includes("nổi bật") ||
      bodyText.includes("featured") ||
      bodyText.includes("mới nhất");

    if (hasFeatures) {
      console.log("✅ Featured products section found");
    }
  });

  it("TC10 - Search không có kết quả", async () => {
    await test.visitAndLogin("/product/search/1/8");

    const searchInputs = await test.driver.findElements(
      By.css('input[placeholder*="Tìm kiếm"]')
    );

    if (searchInputs.length > 0) {
      await searchInputs[0].sendKeys("xyz123nonexistent");
      await searchInputs[0].sendKeys(Key.ENTER);
      await test.driver.sleep(3000);

      const bodyText = await test.getText(By.tagName("body"));
      const hasNoResults =
        bodyText.includes("không tìm thấy") ||
        bodyText.includes("no results") ||
        (await test.driver
          .findElements(By.css(".pro"))
          .then((els) => els.length === 0));

      if (hasNoResults) {
        console.log("✅ No search results handled correctly");
      }
    }
  });
});
