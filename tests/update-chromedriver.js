// update-chromedriver.js
const { execSync } = require("child_process");
const fs = require("fs");
const path = require("path");

class ChromeDriverUpdater {
  constructor() {
    this.chromeVersion = null;
    this.chromeDriverVersion = null;
  }

  // Get Chrome version
  getChromeVersion() {
    try {
      // Windows
      if (process.platform === "win32") {
        const result = execSync(
          'reg query "HKEY_CURRENT_USER\\Software\\Google\\Chrome\\BLBeacon" /v version',
          { encoding: "utf8" }
        );
        const match = result.match(/version\s+REG_SZ\s+(\d+)/);
        if (match) {
          return match[1];
        }
      }

      // Mac/Linux
      const commands = [
        "google-chrome --version",
        "google-chrome-stable --version",
        "chromium --version",
        "/Applications/Google\\ Chrome.app/Contents/MacOS/Google\\ Chrome --version",
      ];

      for (const cmd of commands) {
        try {
          const result = execSync(cmd, { encoding: "utf8" });
          const match = result.match(/(\d+)\./);
          if (match) {
            return match[1];
          }
        } catch (e) {
          continue;
        }
      }
    } catch (error) {
      console.log("Could not detect Chrome version automatically");
    }
    return null;
  }

  // Get latest ChromeDriver version for Chrome
  async getCompatibleChromeDriverVersion(chromeVersion) {
    try {
      const https = require("https");

      return new Promise((resolve, reject) => {
        https
          .get(
            `https://googlechromelabs.github.io/chrome-for-testing/latest-patch-versions-per-build-with-downloads.json`,
            (res) => {
              let data = "";
              res.on("data", (chunk) => (data += chunk));
              res.on("end", () => {
                try {
                  const json = JSON.parse(data);
                  const builds = json.builds;

                  // Find compatible version
                  const compatibleVersion =
                    builds[chromeVersion] ||
                    builds[Object.keys(builds)[Object.keys(builds).length - 1]];

                  if (
                    compatibleVersion &&
                    compatibleVersion.downloads &&
                    compatibleVersion.downloads.chromedriver
                  ) {
                    resolve(compatibleVersion.version);
                  } else {
                    reject(new Error("No compatible ChromeDriver found"));
                  }
                } catch (e) {
                  reject(e);
                }
              });
            }
          )
          .on("error", reject);
      });
    } catch (error) {
      console.error("Error fetching ChromeDriver versions:", error.message);
      return null;
    }
  }

  // Install specific ChromeDriver version
  installChromeDriver(version) {
    try {
      console.log(`Installing ChromeDriver version ${version}...`);

      // Uninstall current chromedriver
      try {
        execSync("npm uninstall chromedriver", { stdio: "inherit" });
      } catch (e) {
        // Ignore if not installed
      }

      // Install specific version
      execSync(`npm install chromedriver@${version}`, { stdio: "inherit" });

      console.log(`✅ ChromeDriver ${version} installed successfully!`);
      return true;
    } catch (error) {
      console.error("❌ Failed to install ChromeDriver:", error.message);
      return false;
    }
  }

  // Main update process
  async updateChromeDriver() {
    console.log("🔍 Checking Chrome and ChromeDriver versions...\n");

    // Get Chrome version
    this.chromeVersion = this.getChromeVersion();

    if (!this.chromeVersion) {
      console.log("❌ Could not detect Chrome version");
      console.log("💡 Try installing Chrome or use Edge browser instead");
      return false;
    }

    console.log(`🌐 Chrome version detected: ${this.chromeVersion}`);

    // Get compatible ChromeDriver version
    try {
      const compatibleVersion = await this.getCompatibleChromeDriverVersion(
        this.chromeVersion
      );

      if (!compatibleVersion) {
        console.log("❌ Could not find compatible ChromeDriver version");
        return false;
      }

      console.log(`🔧 Compatible ChromeDriver version: ${compatibleVersion}`);

      // Check current ChromeDriver version
      try {
        const currentVersion = execSync("chromedriver --version", {
          encoding: "utf8",
        });
        const currentMatch = currentVersion.match(/(\d+\.\d+\.\d+)/);

        if (currentMatch && currentMatch[1] === compatibleVersion) {
          console.log("✅ ChromeDriver is already up to date!");
          return true;
        }
      } catch (e) {
        console.log("⚠️ ChromeDriver not found or not working");
      }

      // Install compatible version
      const success = this.installChromeDriver(compatibleVersion);

      if (success) {
        console.log("\n🎉 ChromeDriver update completed successfully!");
        console.log("\nYou can now run your tests:");
        console.log("  npm test");
        console.log("  npm run test:cart");
        console.log("  npm run test:checkout");
      }

      return success;
    } catch (error) {
      console.error("❌ Error during update process:", error.message);
      return false;
    }
  }

  // Alternative: Use Edge if Chrome issues persist
  suggestEdgeAlternative() {
    console.log("\n🔄 Alternative solution: Use Microsoft Edge");
    console.log("Edge is more stable for automated testing:");
    console.log("  npm run test:edge");
    console.log("\nOr set Edge as default:");
    console.log("  BROWSER=edge npm test");
  }
}

// Run if called directly
if (require.main === module) {
  const updater = new ChromeDriverUpdater();

  updater
    .updateChromeDriver()
    .then((success) => {
      if (!success) {
        updater.suggestEdgeAlternative();
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error("❌ Update failed:", error.message);
      updater.suggestEdgeAlternative();
      process.exit(1);
    });
}

module.exports = ChromeDriverUpdater;
