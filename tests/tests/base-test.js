const { Builder, By, until } = require("selenium-webdriver");
const chrome = require("selenium-webdriver/chrome");
const edge = require("selenium-webdriver/edge");

class BaseTest {
  constructor() {
    this.driver = null;
    this.baseUrl = "http://localhost:5173";
    this.browserName = process.env.BROWSER || "chrome";
    this.isHeadless = process.env.HEADLESS === "true";
    this.isMobile = process.env.MOBILE === "true";
  }

  async setup() {
    const maxRetries = 3;
    let lastError = null;

    // Try different browser configurations
    const configs = [
      { browser: this.browserName, version: "latest" },
      { browser: "edge", version: "latest" }, // Fallback to Edge
      { browser: "chrome", version: "stable" }, // Chrome for Testing
    ];

    for (let i = 0; i < configs.length; i++) {
      const config = configs[i];

      try {
        console.log(`🔄 Trying ${config.browser} (${config.version})...`);
        await this.setupBrowser(config.browser);
        console.log(`✅ Successfully started ${config.browser}`);
        return; // Success!
      } catch (error) {
        lastError = error;
        console.log(`❌ Failed with ${config.browser}: ${error.message}`);

        // Cleanup failed driver
        if (this.driver) {
          try {
            await this.driver.quit();
          } catch (e) {
            // Ignore cleanup errors
          }
          this.driver = null;
        }

        // Continue to next configuration
        continue;
      }
    }

    // If all configurations failed
    throw new Error(
      `All browser configurations failed. Last error: ${lastError?.message}`
    );
  }

  async setupBrowser(browserName) {
    let builder = new Builder();

    if (browserName === "edge") {
      const edgeOptions = new edge.Options();

      if (this.isHeadless) {
        edgeOptions.addArguments("--headless");
      }

      if (this.isMobile) {
        edgeOptions.addArguments("--force-device-scale-factor=1");
      }

      // Enhanced Edge options for stability
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
        "--disable-plugins",
        "--disable-blink-features=AutomationControlled",
        "--disable-web-security",
        "--allow-running-insecure-content"
      );

      this.driver = await builder
        .forBrowser("MicrosoftEdge")
        .setEdgeOptions(edgeOptions)
        .build();
    } else {
      // Chrome configuration with enhanced error handling
      const chromeOptions = new chrome.Options();

      if (this.isHeadless) {
        chromeOptions.addArguments("--headless");
      }

      if (this.isMobile) {
        chromeOptions.setMobileEmulation({ deviceName: "iPhone 12" });
      }

      // Enhanced Chrome options
      chromeOptions.addArguments(
        "--no-sandbox",
        "--disable-dev-shm-usage",
        "--disable-gpu",
        "--disable-web-security",
        "--disable-features=VizDisplayCompositor",
        "--disable-blink-features=AutomationControlled",
        "--disable-extensions",
        "--disable-plugins",
        "--disable-background-timer-throttling",
        "--disable-backgrounding-occluded-windows",
        "--disable-renderer-backgrounding",
        "--no-first-run",
        "--no-default-browser-check",
        "--disable-sync",
        "--disable-background-networking",
        "--disable-default-apps",
        "--allow-running-insecure-content"
      );

      // Try to use Chrome for Testing if available
      if (process.env.CHROME_BIN) {
        chromeOptions.setChromeBinaryPath(process.env.CHROME_BIN);
      }

      this.driver = await builder
        .forBrowser("chrome")
        .setChromeOptions(chromeOptions)
        .build();
    }

    // Set window size and timeouts
    if (!this.isMobile) {
      await this.driver.manage().window().maximize();
    }

    await this.driver.manage().setTimeouts({
      implicit: 10000,
      pageLoad: 30000,
      script: 30000,
    });
  }

  async teardown() {
    if (this.driver) {
      try {
        await this.driver.quit();
      } catch (error) {
        console.log("Warning: Error during driver cleanup:", error.message);
      }
    }
  }

  // Enhanced API mocking with better error handling
  async mockAPIs() {
    try {
      await this.driver.executeScript(`
        // Store original fetch
        window.originalFetch = window.fetch;
        
        // Enhanced mock fetch with more realistic responses
        window.fetch = function(url, options) {
          console.log('🔧 Mocked API call:', url);
          
          // Mock cart API
          if (url.includes('/cart/all-product/')) {
            return Promise.resolve({
              ok: true,
              status: 200,
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
                    },
                    {
                      id: "cart-2", 
                      quantity: 1,
                      product_id: "product-2",
                      product: {
                        id: "product-2",
                        name: "Thức ăn cho heo",
                        priceout: 75000,
                        weight: 25,
                        url_images: '{"url_images1":"https://via.placeholder.com/300","url_images2":"https://via.placeholder.com/300"}'
                      }
                    }
                  ],
                  total: 3
                }
              })
            });
          }
          
          // Mock user API
          if (url.includes('/users/')) {
            return Promise.resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                success: true,
                data: {
                  id: "test-user-123",
                  firstName: "Test",
                  lastName: "User",
                  email: "test@example.com",
                  url_image: "https://via.placeholder.com/150"
                }
              })
            });
          }
          
          // Mock products API
          if (url.includes('/product/search/') || url.includes('/product/')) {
            return Promise.resolve({
              ok: true,
              status: 200,
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
                    },
                    {
                      id: "product-2",
                      name: "Thức ăn cho heo", 
                      priceout: 75000,
                      weight: 25,
                      stockQuantity: 50,
                      category: { name: "Heo" },
                      url_images: '{"url_images1":"https://via.placeholder.com/300"}'
                    }
                  ],
                  total: 2
                }
              })
            });
          }
          
          // Mock categories API
          if (url.includes('/category/')) {
            return Promise.resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                success: true,
                data: {
                  data: [
                    { id: "cat-1", name: "Gà" },
                    { id: "cat-2", name: "Heo" },
                    { id: "cat-3", name: "Cá" }
                  ]
                }
              })
            });
          }
          
          // Mock location API
          if (url.includes('/location-user/')) {
            return Promise.resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                success: true,
                data: {
                  data: [{
                    id: "addr-1",
                    name: "Test User",
                    address: "123 Test Street",
                    phone: "0987654321",
                    default_location: true,
                    user_id: "test-user-123"
                  }]
                }
              })
            });
          }
          
          // Mock order API
          if (url.includes('/order/')) {
            const isPost = options && options.method === 'POST';
            return Promise.resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                success: true,
                data: isPost ? {
                  data: { id: "order-123", total_price: 100000 }
                } : {
                  list: [],
                  total: 0
                }
              })
            });
          }
          
          // Mock feature/latest products
          if (url.includes('/dashboard/feature-product') || url.includes('/dashboard/latest-product')) {
            return Promise.resolve({
              ok: true,
              status: 200,
              json: () => Promise.resolve({
                success: true,
                data: []
              })
            });
          }
          
          // Default: try original fetch or return empty response
          if (window.originalFetch) {
            return window.originalFetch(url, options).catch(() => {
              return Promise.resolve({
                ok: true,
                status: 200,
                json: () => Promise.resolve({ success: true, data: {} })
              });
            });
          }
          
          // Fallback empty response
          return Promise.resolve({
            ok: true,
            status: 200,
            json: () => Promise.resolve({ success: true, data: {} })
          });
        };
      `);
    } catch (error) {
      console.log("Warning: Could not setup API mocking:", error.message);
    }
  }

  async login() {
    try {
      await this.driver.executeScript(`
        localStorage.setItem('token', '"test-jwt-token"');
        localStorage.setItem('userId', '"test-user-123"');
        localStorage.setItem('role', '"user"');
      `);
    } catch (error) {
      console.log("Warning: Could not setup authentication:", error.message);
    }
  }

  async visit(path = "") {
    const maxRetries = 3;
    let lastError = null;

    for (let i = 0; i < maxRetries; i++) {
      try {
        await this.driver.get(`${this.baseUrl}${path}`);

        // Wait for basic page load
        await this.driver.wait(until.elementLocated(By.tagName("body")), 10000);
        return;
      } catch (error) {
        lastError = error;
        console.log(
          `Retry ${i + 1}/${maxRetries} for ${path}: ${error.message}`
        );

        if (i < maxRetries - 1) {
          await this.driver.sleep(2000);
        }
      }
    }

    throw new Error(
      `Failed to visit ${path} after ${maxRetries} attempts: ${lastError?.message}`
    );
  }

  async visitAndLogin(path = "/home-page") {
    await this.visit(path);
    await this.driver.sleep(1000);
    await this.mockAPIs();
    await this.login();
    await this.driver.sleep(1000);

    // Check if redirected to login page and go back
    try {
      const currentUrl = await this.driver.getCurrentUrl();
      if (currentUrl.includes("/login")) {
        await this.visit(path);
        await this.driver.sleep(1000);
      }
    } catch (error) {
      // Ignore URL check errors
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
    await this.driver.wait(until.elementIsEnabled(element), 5000);
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
      try {
        const currentUrl = await this.driver.getCurrentUrl();
        if (currentUrl.includes(expectedUrl)) {
          return true;
        }
      } catch (error) {
        // Ignore URL check errors and continue
      }
      await this.driver.sleep(500);
    }
    return false;
  }

  async takeScreenshot(filename) {
    try {
      const screenshot = await this.driver.takeScreenshot();
      const fs = require("fs");
      if (!fs.existsSync("screenshots")) {
        fs.mkdirSync("screenshots");
      }
      fs.writeFileSync(`screenshots/${filename}.png`, screenshot, "base64");
    } catch (error) {
      console.log("Warning: Could not take screenshot:", error.message);
    }
  }

  async setViewport(width, height) {
    try {
      await this.driver.manage().window().setRect({ width, height });
    } catch (error) {
      console.log("Warning: Could not set viewport:", error.message);
    }
  }

  async scrollToElement(locator) {
    try {
      const element = await this.waitForElement(locator);
      await this.driver.executeScript(
        "arguments[0].scrollIntoView();",
        element
      );
    } catch (error) {
      console.log("Warning: Could not scroll to element:", error.message);
    }
  }

  async scrollToBottom() {
    try {
      await this.driver.executeScript(
        "window.scrollTo(0, document.body.scrollHeight)"
      );
    } catch (error) {
      console.log("Warning: Could not scroll to bottom:", error.message);
    }
  }
}

module.exports = BaseTest;
