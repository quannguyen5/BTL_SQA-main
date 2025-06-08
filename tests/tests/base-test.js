const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const edge = require("selenium-webdriver/edge");

class BaseTest {
  constructor() {
    this.driver = null;
    this.baseUrl = "http://localhost:5173";
  }

  async setup() {
    const browserName = process.env.BROWSER || "chrome";
    const isHeadless = process.env.HEADLESS === "true";
    const isMobile = process.env.MOBILE === "true";

    let builder = new Builder();

    if (browserName === "edge") {
      const edgeOptions = new edge.Options();
      if (isHeadless) edgeOptions.addArguments("--headless");
      if (isMobile) edgeOptions.addArguments("--force-device-scale-factor=1");

      edgeOptions.addArguments(
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--disable-field-trial-config",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-sync",
        "--disable-background-networking",
        "--disable-default-apps",
        "--disable-extensions",
        "--disable-plugins"
      );

      this.driver = await builder
        .forBrowser("MicrosoftEdge")
        .setEdgeOptions(edgeOptions)
        .build();
    } else {
      const chromeOptions = new chrome.Options();
      if (isHeadless) chromeOptions.addArguments("--headless");
      if (isMobile) {
        chromeOptions.setMobileEmulation({ deviceName: "iPhone 12" });
      }

      chromeOptions.addArguments(
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor"
      );

      this.driver = await builder
        .forBrowser("chrome")
        .setChromeOptions(chromeOptions)
        .build();
    }

    if (!isMobile) {
      await this.driver.manage().window().maximize();
    }
    await this.driver.manage().setTimeouts({ implicit: 10000 });
  }

  async teardown() {
    if (this.driver) {
      await this.driver.quit();
    }
  }

  // Enhanced API mocking
  async mockAPIs() {
    await this.driver.executeScript(`
      // Mock fetch for API calls
      window.originalFetch = window.fetch;
      window.fetch = function(url, options) {
        console.log('Mocked API call:', url);
        
        // Mock cart API
        if (url.includes('/cart/all-product/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: {
                cart: [
                  {
                    id: "cart-1",
                    quantity: 2,
                    product_id: "product-1",
                    product: {
                      id: "product-1",
                      name: "Thức ăn cho gà",
                      priceout: 50000,
                      weight: 30,
                      url_images: '{"url_images1":"https://via.placeholder.com/300","url_images2":"https://via.placeholder.com/300"}'
                    }
                  }
                ],
                total: 2
              }
            })
          });
        }
        
        // Mock user API
        if (url.includes('/users/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: {
                id: "test-user-123",
                firstName: "Test",
                lastName: "User",
                email: "test@example.com"
              }
            })
          });
        }
        
        // Mock products API
        if (url.includes('/product/search/') || url.includes('/product/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: {
                products: [
                  {
                    id: "product-1",
                    name: "Thức ăn cho gà",
                    priceout: 50000,
                    weight: 30,
                    stockQuantity: 100,
                    category: { name: "Gà" },
                    url_images: '{"url_images1":"https://via.placeholder.com/300"}'
                  }
                ],
                total: 1
              }
            })
          });
        }
        
        // Mock categories API
        if (url.includes('/category/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: {
                data: [
                  { id: "cat-1", name: "Gà" },
                  { id: "cat-2", name: "Heo" }
                ]
              }
            })
          });
        }
        
        // Mock location API
        if (url.includes('/location-user/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: {
                data: [{
                  id: "addr-1",
                  name: "Test User",
                  address: "123 Test Street",
                  phone: "0987654321",
                  default_location: true
                }]
              }
            })
          });
        }
        
        // Mock order API
        if (url.includes('/order/')) {
          return Promise.resolve({
            ok: true,
            json: () => Promise.resolve({
              success: true,
              data: {
                data: { id: "order-123", total_price: 100000 }
              }
            })
          });
        }
        
        // Default: call original fetch
        return window.originalFetch(url, options);
      };
    `);
  }

  async login() {
    await this.driver.executeScript(`
      window.localStorage.setItem('token', '"test-jwt-token"');
      window.localStorage.setItem('userId', '"test-user-123"');
      window.localStorage.setItem('role', '"user"');
    `);
  }

  async visit(path = "") {
    await this.driver.get(`${this.baseUrl}${path}`);
  }

  async visitAndLogin(path = "/home-page") {
    await this.visit(path);
    await this.driver.sleep(1000);
    await this.mockAPIs();
    await this.login();
    await this.driver.sleep(1000);

    // If redirected to login, go back to intended path
    const currentUrl = await this.driver.getCurrentUrl();
    if (currentUrl.includes("/login")) {
      await this.visit(path);
      await this.driver.sleep(1000);
    }
  }

  async waitForElement(locator, timeout = 10000) {
    return await this.driver.wait(until.elementLocated(locator), timeout);
  }

  async isElementPresent(locator) {
    try {
      await this.driver.findElement(locator);
      return true;
    } catch {
      return false;
    }
  }

  async clickElement(locator) {
    const element = await this.waitForElement(locator);
    await element.click();
  }

  async typeText(locator, text) {
    const element = await this.waitForElement(locator);
    await element.clear();
    await element.sendKeys(text);
  }

  async getText(locator) {
    const element = await this.waitForElement(locator);
    return await element.getText();
  }

  async waitForUrl(expectedUrl, timeout = 10000) {
    const startTime = Date.now();
    while (Date.now() - startTime < timeout) {
      const currentUrl = await this.driver.getCurrentUrl();
      if (currentUrl.includes(expectedUrl)) {
        return true;
      }
      await this.driver.sleep(500);
    }
    return false;
  }

  async takeScreenshot(filename) {
    const screenshot = await this.driver.takeScreenshot();
    const fs = require("fs");
    if (!fs.existsSync("screenshots")) {
      fs.mkdirSync("screenshots");
    }
    fs.writeFileSync(`screenshots/${filename}.png`, screenshot, "base64");
  }

  async setViewport(width, height) {
    await this.driver.manage().window().setRect({ width, height });
  }

  async scrollToElement(locator) {
    const element = await this.waitForElement(locator);
    await this.driver.executeScript("arguments[0].scrollIntoView();", element);
  }

  async scrollToBottom() {
    await this.driver.executeScript(
      "window.scrollTo(0, document.body.scrollHeight)"
    );
  }
}

module.exports = BaseTest;
