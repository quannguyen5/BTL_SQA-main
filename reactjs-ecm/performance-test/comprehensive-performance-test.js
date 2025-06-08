// comprehensive-performance-test.js
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fs = require("fs");

// 🎯 DANH SÁCH TRANG TEST TOÀN DIỆN
const TEST_SCENARIOS = {
  // 📱 Trang chính
  core_pages: [
    {
      name: "Home Page",
      url: "http://localhost:5173/home-page",
      priority: "high",
      description: "Trang chủ - Landing page chính",
    },
    {
      name: "Products Listing",
      url: "http://localhost:5173/product/search/1/8",
      priority: "high",
      description: "Danh sách sản phẩm với pagination",
    },
    {
      name: "Products with Search",
      url: "http://localhost:5173/product/search/1/8?name=gà&category=cat-1",
      priority: "medium",
      description: "Trang sản phẩm có filter và search",
    },
  ],

  // 🛒 Trang thương mại điện tử
  ecommerce_flow: [
    {
      name: "Product Detail",
      url: "http://localhost:5173/product-detail/product-1",
      priority: "high",
      description: "Chi tiết sản phẩm với hình ảnh lớn",
    },
    {
      name: "Cart Empty",
      url: "http://localhost:5173/cart",
      priority: "high",
      description: "Giỏ hàng trống",
    },
    {
      name: "Checkout Page",
      url: "http://localhost:5173/checkout",
      priority: "high",
      description: "Trang thanh toán",
    },
    {
      name: "Order Success",
      url: "http://localhost:5173/order-success",
      priority: "medium",
      description: "Trang thành công sau thanh toán",
    },
  ],

  // 👤 Trang người dùng
  user_pages: [
    {
      name: "Login Page",
      url: "http://localhost:5173/login",
      priority: "medium",
      description: "Trang đăng nhập",
    },
    {
      name: "Register Page",
      url: "http://localhost:5173/register",
      priority: "medium",
      description: "Trang đăng ký",
    },
    {
      name: "User Profile",
      url: "http://localhost:5173/user/test-user-123",
      priority: "medium",
      description: "Trang thông tin cá nhân",
    },
    {
      name: "Order History",
      url: "http://localhost:5173/order-history/test-user-123",
      priority: "medium",
      description: "Lịch sử đơn hàng",
    },
    {
      name: "Change Password",
      url: "http://localhost:5173/change-password/test-user-123",
      priority: "low",
      description: "Trang đổi mật khẩu",
    },
  ],

  // 📄 Trang thông tin
  content_pages: [
    {
      name: "About Page",
      url: "http://localhost:5173/about",
      priority: "low",
      description: "Trang giới thiệu",
    },
    {
      name: "Contact Page",
      url: "http://localhost:5173/contact",
      priority: "low",
      description: "Trang liên hệ",
    },
  ],

  // 🔧 Trang admin (nếu có)
  admin_pages: [
    {
      name: "Admin Dashboard",
      url: "http://localhost:5173/admin/dashboard",
      priority: "low",
      description: "Dashboard quản trị",
    },
  ],
};

// Cấu hình Lighthouse cho từng loại test
const LIGHTHOUSE_CONFIGS = {
  // Config cơ bản - nhanh
  basic: {
    onlyCategories: ["performance"],
    chromeFlags: ["--headless", "--no-sandbox"],
    logLevel: "error",
    output: "html",
  },

  // Config đầy đủ - chậm hơn nhưng chi tiết
  full: {
    onlyCategories: ["performance", "accessibility", "best-practices", "seo"],
    chromeFlags: ["--headless", "--no-sandbox"],
    logLevel: "error",
    output: "html",
  },

  // Config mobile
  mobile: {
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
  },
};

async function runLighthouse(url, config) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  config.port = chrome.port;

  const runnerResult = await lighthouse(url, config);
  await chrome.kill();

  return runnerResult;
}

function formatDuration(ms) {
  const minutes = Math.floor(ms / 60000);
  const seconds = Math.floor((ms % 60000) / 1000);
  return `${minutes}m ${seconds}s`;
}

async function testAllPages() {
  console.log("🚀 BẮT ĐẦU TEST HIỆU NĂNG TOÀN DIỆN\n");

  const startTime = Date.now();
  const results = [];
  let totalPages = 0;
  let successCount = 0;
  let failCount = 0;

  // Đếm tổng số trang
  Object.values(TEST_SCENARIOS).forEach((category) => {
    totalPages += category.length;
  });

  console.log(`📊 Sẽ test ${totalPages} trang\n`);

  // Test từng category
  for (const [categoryName, pages] of Object.entries(TEST_SCENARIOS)) {
    console.log(
      `\n📁 CATEGORY: ${categoryName.toUpperCase().replace("_", " ")}`,
    );
    console.log("=".repeat(60));

    for (const page of pages) {
      const pageStartTime = Date.now();
      console.log(`🔍 Testing: ${page.name}`);
      console.log(`   URL: ${page.url}`);
      console.log(`   Priority: ${page.priority}`);

      try {
        // Chọn config dựa trên priority
        let config = LIGHTHOUSE_CONFIGS.basic;
        if (page.priority === "high") {
          config = LIGHTHOUSE_CONFIGS.full;
        }

        const result = await runLighthouse(page.url, config);
        const lhr = result.lhr;

        // Lấy metrics
        const metrics = {
          category: categoryName,
          name: page.name,
          url: page.url,
          priority: page.priority,
          description: page.description,
          performanceScore: Math.round(lhr.categories.performance.score * 100),
          firstContentfulPaint:
            lhr.audits["first-contentful-paint"].displayValue,
          largestContentfulPaint:
            lhr.audits["largest-contentful-paint"].displayValue,
          cumulativeLayoutShift:
            lhr.audits["cumulative-layout-shift"].displayValue,
          totalBlockingTime: lhr.audits["total-blocking-time"].displayValue,
          speedIndex: lhr.audits["speed-index"].displayValue,
          testTime: Date.now() - pageStartTime,
        };

        // Thêm metrics khác nếu có full test
        if (lhr.categories.accessibility) {
          metrics.accessibilityScore = Math.round(
            lhr.categories.accessibility.score * 100,
          );
        }
        if (lhr.categories["best-practices"]) {
          metrics.bestPracticesScore = Math.round(
            lhr.categories["best-practices"].score * 100,
          );
        }
        if (lhr.categories.seo) {
          metrics.seoScore = Math.round(lhr.categories.seo.score * 100);
        }

        results.push(metrics);

        // Lưu report HTML
        const fileName = page.name
          .replace(/\s+/g, "-")
          .toLowerCase()
          .replace(/[^a-z0-9-]/g, "");
        const reportPath = `./reports/${fileName}-report.html`;
        fs.writeFileSync(reportPath, result.report);

        // Hiển thị kết quả
        const scoreEmoji =
          metrics.performanceScore >= 90
            ? "🟢"
            : metrics.performanceScore >= 70
              ? "�"
              : "🔴";

        console.log(
          `   ${scoreEmoji} Performance: ${metrics.performanceScore}/100`,
        );
        console.log(`   ⏱️  Test time: ${formatDuration(metrics.testTime)}`);
        console.log(`   📄 Report: ${reportPath}`);

        successCount++;
      } catch (error) {
        console.log(`   ❌ FAILED: ${error.message}`);
        results.push({
          category: categoryName,
          name: page.name,
          url: page.url,
          error: error.message,
          testTime: Date.now() - pageStartTime,
        });
        failCount++;
      }

      // Pause nhỏ giữa các test
      await new Promise((resolve) => setTimeout(resolve, 1000));
    }
  }

  // Tạo báo cáo tổng hợp
  console.log("\n" + "=".repeat(80));
  console.log("📈 KẾT QUẢ TỔNG HỢP");
  console.log("=".repeat(80));

  // Thống kê tổng quan
  const totalTime = Date.now() - startTime;
  console.log(`\n📊 THỐNG KÊ:`);
  console.log(`   Tổng thời gian: ${formatDuration(totalTime)}`);
  console.log(`   Trang thành công: ${successCount}/${totalPages}`);
  console.log(`   Trang thất bại: ${failCount}/${totalPages}`);

  // Phân tích theo category
  const successResults = results.filter((r) => !r.error);
  if (successResults.length > 0) {
    console.log(`\n📈 PHÂN TÍCH THEO CATEGORY:`);

    Object.keys(TEST_SCENARIOS).forEach((categoryName) => {
      const categoryResults = successResults.filter(
        (r) => r.category === categoryName,
      );
      if (categoryResults.length > 0) {
        const avgScore =
          categoryResults.reduce((sum, r) => sum + r.performanceScore, 0) /
          categoryResults.length;
        const scoreEmoji = avgScore >= 90 ? "🟢" : avgScore >= 70 ? "🟡" : "🔴";
        console.log(
          `   ${scoreEmoji} ${categoryName.replace("_", " ")}: ${Math.round(avgScore)}/100 (${categoryResults.length} pages)`,
        );
      }
    });

    // Top 5 trang tốt nhất và tệ nhất
    console.log(`\n🏆 TOP 5 TRANG TỐT NHẤT:`);
    successResults
      .sort((a, b) => b.performanceScore - a.performanceScore)
      .slice(0, 5)
      .forEach((result, index) => {
        console.log(
          `   ${index + 1}. ${result.name}: ${result.performanceScore}/100`,
        );
      });

    console.log(`\n🔴 TOP 5 TRANG CẦN CẢI THIỆN:`);
    successResults
      .sort((a, b) => a.performanceScore - b.performanceScore)
      .slice(0, 5)
      .forEach((result, index) => {
        console.log(
          `   ${index + 1}. ${result.name}: ${result.performanceScore}/100`,
        );
      });

    // Điểm trung bình tổng thể
    const avgScore =
      successResults.reduce((sum, r) => sum + r.performanceScore, 0) /
      successResults.length;
    console.log(`\n🎯 ĐIỂM TRUNG BÌNH TỔNG THỂ: ${Math.round(avgScore)}/100`);

    if (avgScore >= 90) {
      console.log("🟢 Hệ thống có hiệu năng XUẤT SẮC!");
    } else if (avgScore >= 70) {
      console.log("🟡 Hệ thống có hiệu năng TỐT - Vẫn có thể cải thiện");
    } else {
      console.log("🔴 Hệ thống có hiệu năng YẾU - Cần tối ưu gấp!");
    }
  }

  // Lưu kết quả JSON chi tiết
  const summaryData = {
    testDate: new Date().toISOString(),
    totalTime: totalTime,
    summary: {
      totalPages,
      successCount,
      failCount,
      avgScore:
        successResults.length > 0
          ? Math.round(
              successResults.reduce((sum, r) => sum + r.performanceScore, 0) /
                successResults.length,
            )
          : 0,
    },
    results: results,
  };

  fs.writeFileSync(
    "./reports/comprehensive-summary.json",
    JSON.stringify(summaryData, null, 2),
  );
  console.log(`\n💾 Chi tiết đã lưu: ./reports/comprehensive-summary.json`);

  // Tạo báo cáo HTML tổng hợp
  generateSummaryHTML(summaryData);
  console.log(`📄 Báo cáo HTML tổng hợp: ./reports/summary-report.html`);
}

function generateSummaryHTML(data) {
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Test Summary</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .score-good { color: #0f5132; background: #d1e7dd; }
        .score-medium { color: #664d03; background: #fff3cd; }
        .score-bad { color: #842029; background: #f8d7da; }
        .category { margin: 20px 0; padding: 15px; border: 1px solid #ddd; }
        table { width: 100%; border-collapse: collapse; margin: 10px 0; }
        th, td { padding: 8px; text-align: left; border: 1px solid #ddd; }
        th { background: #f8f9fa; }
    </style>
</head>
<body>
    <h1>🚀 Performance Test Summary</h1>
    <p><strong>Test Date:</strong> ${new Date(data.testDate).toLocaleString()}</p>
    <p><strong>Total Time:</strong> ${formatDuration(data.totalTime)}</p>
    <p><strong>Pages Tested:</strong> ${data.summary.successCount}/${data.summary.totalPages}</p>
    <p><strong>Average Score:</strong> <span class="${data.summary.avgScore >= 90 ? "score-good" : data.summary.avgScore >= 70 ? "score-medium" : "score-bad"}">${data.summary.avgScore}/100</span></p>
    
    <h2>📊 Detailed Results</h2>
    <table>
        <thead>
            <tr>
                <th>Page</th>
                <th>Category</th>
                <th>Performance</th>
                <th>FCP</th>
                <th>LCP</th>
                <th>CLS</th>
                <th>Priority</th>
            </tr>
        </thead>
        <tbody>
            ${data.results
              .filter((r) => !r.error)
              .map(
                (result) => `
                <tr>
                    <td>${result.name}</td>
                    <td>${result.category.replace("_", " ")}</td>
                    <td class="${result.performanceScore >= 90 ? "score-good" : result.performanceScore >= 70 ? "score-medium" : "score-bad"}">${result.performanceScore}/100</td>
                    <td>${result.firstContentfulPaint}</td>
                    <td>${result.largestContentfulPaint}</td>
                    <td>${result.cumulativeLayoutShift}</td>
                    <td>${result.priority}</td>
                </tr>
            `,
              )
              .join("")}
        </tbody>
    </table>
    
    ${
      data.results.filter((r) => r.error).length > 0
        ? `
        <h2>❌ Failed Tests</h2>
        <ul>
            ${data.results
              .filter((r) => r.error)
              .map(
                (result) => `
                <li><strong>${result.name}:</strong> ${result.error}</li>
            `,
              )
              .join("")}
        </ul>
    `
        : ""
    }
</body>
</html>`;

  fs.writeFileSync("./reports/summary-report.html", html);
}

// Chạy test
if (!fs.existsSync("./reports")) {
  fs.mkdirSync("./reports");
}

testAllPages().catch(console.error);
