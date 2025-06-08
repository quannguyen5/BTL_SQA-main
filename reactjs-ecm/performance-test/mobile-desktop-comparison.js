// mobile-desktop-comparison.js
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fs = require("fs");

// Trang quan trọng cần test cả mobile và desktop
const CRITICAL_PAGES = [
  {
    name: "Home Page",
    url: "http://localhost:5173/home-page",
  },
  {
    name: "Products Page",
    url: "http://localhost:5173/product/search/1/8",
  },
  {
    name: "Product Detail",
    url: "http://localhost:5173/product-detail/product-1",
  },
  {
    name: "Cart Page",
    url: "http://localhost:5173/cart",
  },
  {
    name: "Checkout Page",
    url: "http://localhost:5173/checkout",
  },
];

// Config cho Desktop
const DESKTOP_CONFIG = {
  onlyCategories: ["performance"],
  chromeFlags: ["--headless", "--no-sandbox"],
  logLevel: "error",
  output: "html",
  formFactor: "desktop",
  screenEmulation: {
    mobile: false,
    width: 1350,
    height: 940,
    deviceScaleFactor: 1,
  },
  throttling: {
    rttMs: 40,
    throughputKbps: 10240,
    cpuSlowdownMultiplier: 1,
  },
};

// Config cho Mobile
const MOBILE_CONFIG = {
  onlyCategories: ["performance"],
  chromeFlags: ["--headless", "--no-sandbox"],
  logLevel: "error",
  output: "html",
  formFactor: "mobile",
  screenEmulation: {
    mobile: true,
    width: 375,
    height: 667,
    deviceScaleFactor: 2,
  },
  throttling: {
    rttMs: 150,
    throughputKbps: 1638.4,
    cpuSlowdownMultiplier: 4,
  },
};

async function runLighthouse(url, config) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  config.port = chrome.port;

  const runnerResult = await lighthouse(url, config);
  await chrome.kill();

  return runnerResult;
}

async function testMobileVsDesktop() {
  console.log("📱💻 BẮT ĐẦU SO SÁNH MOBILE VS DESKTOP\n");

  const results = [];

  for (const page of CRITICAL_PAGES) {
    console.log(`🔍 Testing: ${page.name}`);
    console.log(`   URL: ${page.url}`);

    try {
      // Test Desktop
      console.log("   💻 Testing Desktop...");
      const desktopResult = await runLighthouse(page.url, DESKTOP_CONFIG);
      const desktopLhr = desktopResult.lhr;

      // Test Mobile
      console.log("   📱 Testing Mobile...");
      const mobileResult = await runLighthouse(page.url, MOBILE_CONFIG);
      const mobileLhr = mobileResult.lhr;

      const comparison = {
        name: page.name,
        url: page.url,
        desktop: {
          score: Math.round(desktopLhr.categories.performance.score * 100),
          fcp: desktopLhr.audits["first-contentful-paint"].displayValue,
          lcp: desktopLhr.audits["largest-contentful-paint"].displayValue,
          cls: desktopLhr.audits["cumulative-layout-shift"].displayValue,
          tbt: desktopLhr.audits["total-blocking-time"].displayValue,
          si: desktopLhr.audits["speed-index"].displayValue,
        },
        mobile: {
          score: Math.round(mobileLhr.categories.performance.score * 100),
          fcp: mobileLhr.audits["first-contentful-paint"].displayValue,
          lcp: mobileLhr.audits["largest-contentful-paint"].displayValue,
          cls: mobileLhr.audits["cumulative-layout-shift"].displayValue,
          tbt: mobileLhr.audits["total-blocking-time"].displayValue,
          si: mobileLhr.audits["speed-index"].displayValue,
        },
      };

      // Tính độ chênh lệch
      comparison.scoreDiff = comparison.desktop.score - comparison.mobile.score;
      comparison.betterOn = comparison.scoreDiff > 0 ? "Desktop" : "Mobile";

      results.push(comparison);

      // Lưu reports riêng
      const pageName = page.name.replace(/\s+/g, "-").toLowerCase();
      fs.writeFileSync(
        `./reports/${pageName}-desktop.html`,
        desktopResult.report,
      );
      fs.writeFileSync(
        `./reports/${pageName}-mobile.html`,
        mobileResult.report,
      );

      // Hiển thị kết quả ngay
      console.log(`   💻 Desktop: ${comparison.desktop.score}/100`);
      console.log(`   📱 Mobile: ${comparison.mobile.score}/100`);
      console.log(
        `   🏆 Better on: ${comparison.betterOn} (${Math.abs(comparison.scoreDiff)} points)`,
      );
      console.log("");
    } catch (error) {
      console.log(`   ❌ Error: ${error.message}\n`);
    }
  }

  // Tạo báo cáo so sánh
  console.log("📊 SO SÁNH TỔNG HỢP:");
  console.log("=".repeat(80));

  results.forEach((result) => {
    const scoreDiffEmoji =
      Math.abs(result.scoreDiff) < 5
        ? "⚖️"
        : result.scoreDiff > 0
          ? "💻"
          : "📱";

    console.log(`${scoreDiffEmoji} ${result.name}:`);
    console.log(
      `   💻 Desktop: ${result.desktop.score}/100 | FCP: ${result.desktop.fcp} | LCP: ${result.desktop.lcp}`,
    );
    console.log(
      `   📱 Mobile:  ${result.mobile.score}/100 | FCP: ${result.mobile.fcp} | LCP: ${result.mobile.lcp}`,
    );
    console.log(
      `   📈 Chênh lệch: ${result.scoreDiff > 0 ? "+" : ""}${result.scoreDiff} points\n`,
    );
  });

  // Thống kê tổng quan
  const avgDesktop =
    results.reduce((sum, r) => sum + r.desktop.score, 0) / results.length;
  const avgMobile =
    results.reduce((sum, r) => sum + r.mobile.score, 0) / results.length;
  const betterOnDesktop = results.filter((r) => r.scoreDiff > 0).length;
  const betterOnMobile = results.filter((r) => r.scoreDiff < 0).length;

  console.log("🎯 THỐNG KÊ TỔNG QUAN:");
  console.log(`   💻 Điểm trung bình Desktop: ${Math.round(avgDesktop)}/100`);
  console.log(`   📱 Điểm trung bình Mobile: ${Math.round(avgMobile)}/100`);
  console.log(
    `   🏆 Tốt hơn trên Desktop: ${betterOnDesktop}/${results.length} trang`,
  );
  console.log(
    `   🏆 Tốt hơn trên Mobile: ${betterOnMobile}/${results.length} trang`,
  );

  if (avgDesktop > avgMobile + 5) {
    console.log("📝 KẾT LUẬN: Website tối ưu tốt cho Desktop hơn Mobile");
  } else if (avgMobile > avgDesktop + 5) {
    console.log("📝 KẾT LUẬN: Website tối ưu tốt cho Mobile hơn Desktop");
  } else {
    console.log(
      "📝 KẾT LUẬN: Website có hiệu năng tương đương trên cả hai platform",
    );
  }

  // Lưu kết quả
  fs.writeFileSync(
    "./reports/mobile-vs-desktop.json",
    JSON.stringify(
      {
        testDate: new Date().toISOString(),
        summary: {
          avgDesktop: Math.round(avgDesktop),
          avgMobile: Math.round(avgMobile),
          betterOnDesktop,
          betterOnMobile,
        },
        results,
      },
      null,
      2,
    ),
  );

  // Tạo HTML report
  generateComparisonHTML(results, avgDesktop, avgMobile);

  console.log("\n💾 Báo cáo đã lưu:");
  console.log("   📄 ./reports/mobile-vs-desktop.json");
  console.log("   📄 ./reports/mobile-vs-desktop-report.html");
}

function generateComparisonHTML(results, avgDesktop, avgMobile) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Mobile vs Desktop Performance</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .comparison-table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        .comparison-table th, .comparison-table td { padding: 12px; text-align: center; border: 1px solid #ddd; }
        .comparison-table th { background: #f8f9fa; }
        .desktop-better { background: #e3f2fd; }
        .mobile-better { background: #f3e5f5; }
        .similar { background: #f5f5f5; }
        .score-excellent { color: #2e7d32; font-weight: bold; }
        .score-good { color: #f57c00; font-weight: bold; }
        .score-poor { color: #d32f2f; font-weight: bold; }
        .summary-box { padding: 20px; margin: 20px 0; border-radius: 8px; }
        .desktop-summary { background: #e3f2fd; }
        .mobile-summary { background: #f3e5f5; }
    </style>
</head>
<body>
    <h1>📱💻 Mobile vs Desktop Performance Report</h1>
    <p><strong>Test Date:</strong> ${new Date().toLocaleString()}</p>
    
    <div class="summary-box desktop-summary">
        <h3>💻 Desktop Average: ${Math.round(avgDesktop)}/100</h3>
    </div>
    
    <div class="summary-box mobile-summary">
        <h3>📱 Mobile Average: ${Math.round(avgMobile)}/100</h3>
    </div>
    
    <h2>📊 Detailed Comparison</h2>
    <table class="comparison-table">
        <thead>
            <tr>
                <th>Page</th>
                <th>💻 Desktop Score</th>
                <th>📱 Mobile Score</th>
                <th>📈 Difference</th>
                <th>🏆 Better On</th>
                <th>Desktop FCP</th>
                <th>Mobile FCP</th>
                <th>Desktop LCP</th>
                <th>Mobile LCP</th>
            </tr>
        </thead>
        <tbody>
            ${results
              .map((result) => {
                const rowClass =
                  Math.abs(result.scoreDiff) < 5
                    ? "similar"
                    : result.scoreDiff > 0
                      ? "desktop-better"
                      : "mobile-better";
                const desktopClass =
                  result.desktop.score >= 90
                    ? "score-excellent"
                    : result.desktop.score >= 70
                      ? "score-good"
                      : "score-poor";
                const mobileClass =
                  result.mobile.score >= 90
                    ? "score-excellent"
                    : result.mobile.score >= 70
                      ? "score-good"
                      : "score-poor";

                return `
                <tr class="${rowClass}">
                    <td><strong>${result.name}</strong></td>
                    <td class="${desktopClass}">${result.desktop.score}/100</td>
                    <td class="${mobileClass}">${result.mobile.score}/100</td>
                    <td><strong>${result.scoreDiff > 0 ? "+" : ""}${result.scoreDiff}</strong></td>
                    <td><strong>${result.betterOn}</strong></td>
                    <td>${result.desktop.fcp}</td>
                    <td>${result.mobile.fcp}</td>
                    <td>${result.desktop.lcp}</td>
                    <td>${result.mobile.lcp}</td>
                </tr>
              `;
              })
              .join("")}
        </tbody>
    </table>
    
    <h2>📝 Recommendations</h2>
    <ul>
        ${avgMobile < avgDesktop - 10 ? "<li><strong>Mobile Optimization Needed:</strong> Consider implementing mobile-first design, image optimization for mobile, and reducing JavaScript execution time.</li>" : ""}
        ${avgDesktop < avgMobile - 10 ? "<li><strong>Desktop Optimization Needed:</strong> Desktop performance is lagging. Check for desktop-specific issues like large images or unnecessary animations.</li>" : ""}
        ${Math.abs(avgDesktop - avgMobile) < 5 ? "<li><strong>Well Balanced:</strong> Your site performs similarly on both platforms. Focus on overall optimizations.</li>" : ""}
        <li><strong>Critical Pages:</strong> Focus optimization efforts on pages with scores below 70 on either platform.</li>
        <li><strong>Mobile-First:</strong> Since mobile traffic often dominates, prioritize mobile performance improvements.</li>
    </ul>
</body>
</html>`;

  fs.writeFileSync("./reports/mobile-vs-desktop-report.html", html);
}

// Chạy test
if (!fs.existsSync("./reports")) {
  fs.mkdirSync("./reports");
}

testMobileVsDesktop().catch(console.error);
