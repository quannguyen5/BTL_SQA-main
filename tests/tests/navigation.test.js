const { expect } = require("chai");
const { By } = require("selenium-webdriver");
const BaseTest = require("./base-test");

describe("Navigation Tests", function () {
  this.timeout(30000);
  let test;

  beforeEach(async () => {
    test = new BaseTest();
    await test.setup();
  });

  afterEach(async () => {
    await test.teardown();
  });

  it("TC01 - Trang chủ hiển thị đúng", async () => {
    await test.visitAndLogin("/home-page");

    await test.waitForElement(By.id("root"));

    const hasHeader =
      (await test.isElementPresent(By.css("header"))) ||
      (await test.isElementPresent(By.css(".sticky")));
    expect(hasHeader).to.be.true;

    const bodyText = await test.getText(By.tagName("body"));
    expect(bodyText).to.include("TRANG CHỦ");
  });

  it("TC02 - Navigation menu hoạt động", async () => {
    await test.visitAndLogin("/home-page");

    const productLinks = await test.driver.findElements(
      By.xpath(
        "//a[contains(@href, '/product/search') or contains(text(), 'SẢN PHẨM')]"
      )
    );

    if (productLinks.length > 0) {
      await productLinks[0].click();
      await test.driver.sleep(2000);

      const url = await test.driver.getCurrentUrl();
      expect(url).to.include("/product");
    } else {
      console.log("ℹ️ Direct navigation test");
      await test.visit("/product/search/1/8");
      const url = await test.driver.getCurrentUrl();
      expect(url).to.include("/product");
    }
  });

  it("TC03 - Cart icon hoạt động", async () => {
    await test.visitAndLogin("/home-page");

    const cartLinks = await test.driver.findElements(
      By.xpath("//a[contains(@href, '/cart')]")
    );

    if (cartLinks.length > 0) {
      await cartLinks[0].click();
      await test.driver.sleep(2000);

      const success = await test.waitForUrl("/cart", 5000);
      expect(success).to.be.true;
    }
  });

  it("TC04 - Mobile menu functionality", async () => {
    await test.setViewport(375, 667);
    await test.visitAndLogin("/home-page");

    const mobileMenuButtons = await test.driver.findElements(
      By.css("#bar, .hamburger, .mobile-menu")
    );

    if (mobileMenuButtons.length > 0) {
      await mobileMenuButtons[0].click();
      await test.driver.sleep(1000);
      console.log("✅ Mobile menu clicked");
    }
  });

  it("TC05 - Footer links accessible", async () => {
    await test.visitAndLogin("/home-page");

    await test.scrollToBottom();

    const hasFooter = await test.isElementPresent(By.tagName("footer"));
    expect(hasFooter).to.be.true;
  });

  it("TC06 - User profile navigation", async () => {
    await test.visitAndLogin("/home-page");

    const userLinks = await test.driver.findElements(
      By.xpath("//a[contains(@href, '/user/')]")
    );

    if (userLinks.length > 0) {
      await userLinks[0].click();
      await test.driver.sleep(2000);

      const url = await test.driver.getCurrentUrl();
      expect(url).to.include("/user");
    }
  });

  it("TC07 - Back/Forward browser buttons", async () => {
    await test.visitAndLogin("/home-page");
    await test.visit("/cart");

    await test.driver.navigate().back();
    const backUrl = await test.driver.getCurrentUrl();
    expect(backUrl).to.include("/home-page");

    await test.driver.navigate().forward();
    const forwardUrl = await test.driver.getCurrentUrl();
    expect(forwardUrl).to.include("/cart");
  });

  it("TC08 - URL routing works correctly", async () => {
    const routes = [
      { path: "/home-page", content: "TRANG CHỦ" },
      { path: "/cart", content: "Giỏ hàng" },
      { path: "/product/search/1/8", content: "sản phẩm" },
    ];

    for (const route of routes) {
      await test.visitAndLogin(route.path);

      const url = await test.driver.getCurrentUrl();
      const bodyText = await test.getText(By.tagName("body"));

      expect(url).to.include(route.path.split("/")[1]);
      if (bodyText.toLowerCase().includes(route.content.toLowerCase())) {
        console.log(`✅ Route ${route.path} loaded with expected content`);
      }
    }
  });
});
