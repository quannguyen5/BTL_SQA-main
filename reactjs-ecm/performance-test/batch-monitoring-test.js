// batch-monitoring-test.js
const lighthouse = require("lighthouse");
const chromeLauncher = require("chrome-launcher");
const fs = require("fs");
const path = require("path");

// Cấu hình batch testing
const BATCH_CONFIG = {
  // Số lần test mỗi trang để lấy kết quả trung bình
  iterations: 3,

  // Delay giữa các test (ms)
  delayBetweenTests: 2000,

  // Pages cần monitor thường xuyên
  monitoringPages: [
    {
      name: "Home Page",
      url: "http://localhost:5173/home-page",
      critical: true,
    },
    {
      name: "Products Page",
      url: "http://localhost:5173/product/search/1/8",
      critical: true,
    },
    {
      name: "Cart Page",
      url: "http://localhost:5173/cart",
      critical: true,
    },
    {
      name: "Checkout Page",
      url: "http://localhost:5173/checkout",
      critical: true,
    },
    {
      name: "Product Detail",
      url: "http://localhost:5173/product-detail/product-1",
      critical: false,
    },
    {
      name: "Login Page",
      url: "http://localhost:5173/login",
      critical: false,
    },
  ],
};

// Lighthouse config tối ưu cho monitoring
const MONITORING_CONFIG = {
  onlyCategories: ["performance"],
  chromeFlags: ["--headless", "--no-sandbox", "--disable-dev-shm-usage"],
  logLevel: "error",
  output: "json", // JSON để dễ xử lý data
};

async function runLighthouse(url, config) {
  const chrome = await chromeLauncher.launch({ chromeFlags: ["--headless"] });
  config.port = chrome.port;

  const runnerResult = await lighthouse(url, config);
  await chrome.kill();

  return runnerResult;
}

function calculateMetricAverage(results, metricPath) {
  const values = results
    .map((r) => {
      const parts = metricPath.split(".");
      let value = r;
      for (const part of parts) {
        value = value[part];
      }
      return typeof value === "string"
        ? parseFloat(value.replace(/[^\d.]/g, ""))
        : value;
    })
    .filter((v) => !isNaN(v));

  return values.length > 0
    ? values.reduce((sum, v) => sum + v, 0) / values.length
    : 0;
}

async function batchTestPage(page) {
  console.log(
    `🔄 Batch testing: ${page.name} (${BATCH_CONFIG.iterations} iterations)`,
  );

  const results = [];
  const startTime = Date.now();

  for (let i = 1; i <= BATCH_CONFIG.iterations; i++) {
    console.log(`   Run ${i}/${BATCH_CONFIG.iterations}...`);

    try {
      const result = await runLighthouse(page.url, MONITORING_CONFIG);
      const lhr = result.lhr;

      const metrics = {
        runNumber: i,
        timestamp: Date.now(),
        performanceScore: Math.round(lhr.categories.performance.score * 100),
        fcp: parseFloat(lhr.audits["first-contentful-paint"].numericValue),
        lcp: parseFloat(lhr.audits["largest-contentful-paint"].numericValue),
        cls: parseFloat(lhr.audits["cumulative-layout-shift"].numericValue),
        tbt: parseFloat(lhr.audits["total-blocking-time"].numericValue),
        si: parseFloat(lhr.audits["speed-index"].numericValue),
        tti: parseFloat(lhr.audits["interactive"].numericValue),
      };

      results.push(metrics);

      // Delay giữa các test
      if (i < BATCH_CONFIG.iterations) {
        await new Promise((resolve) =>
          setTimeout(resolve, BATCH_CONFIG.delayBetweenTests),
        );
      }
    } catch (error) {
      console.log(`   ❌ Run ${i} failed: ${error.message}`);
    }
  }

  if (results.length === 0) {
    return null;
  }

  // Tính toán kết quả trung bình và độ lệch chuẩn
  const avgMetrics = {
    name: page.name,
    url: page.url,
    critical: page.critical,
    testDate: new Date().toISOString(),
    totalTestTime: Date.now() - startTime,
    successfulRuns: results.length,
    totalRuns: BATCH_CONFIG.iterations,

    // Kết quả trung bình
    avg: {
      performanceScore: Math.round(
        calculateMetricAverage(results, "performanceScore"),
      ),
      fcp: Math.round(calculateMetricAverage(results, "fcp")),
      lcp: Math.round(calculateMetricAverage(results, "lcp")),
      cls: calculateMetricAverage(results, "cls").toFixed(3),
      tbt: Math.round(calculateMetricAverage(results, "tbt")),
      si: Math.round(calculateMetricAverage(results, "si")),
      tti: Math.round(calculateMetricAverage(results, "tti")),
    },

    // Min/Max values
    min: {
      performanceScore: Math.min(...results.map((r) => r.performanceScore)),
      fcp: Math.min(...results.map((r) => r.fcp)),
      lcp: Math.min(...results.map((r) => r.lcp)),
    },

    max: {
      performanceScore: Math.max(...results.map((r) => r.performanceScore)),
      fcp: Math.max(...results.map((r) => r.fcp)),
      lcp: Math.max(...results.map((r) => r.lcp)),
    },

    // Raw results
    rawResults: results,
  };

  // Tính độ ổn định (consistency)
  const scoreVariance =
    results.reduce(
      (sum, r) =>
        sum + Math.pow(r.performanceScore - avgMetrics.avg.performanceScore, 2),
      0,
    ) / results.length;
  avgMetrics.consistency = {
    scoreVariance: Math.round(scoreVariance),
    isStable: scoreVariance < 25, // Nếu variance < 25 thì được coi là ổn định
  };

  return avgMetrics;
}

async function runBatchMonitoring() {
  console.log("🚀 BẮT ĐẦU BATCH MONITORING TEST");
  console.log(
    `📊 Sẽ test ${BATCH_CONFIG.monitoringPages.length} trang, mỗi trang ${BATCH_CONFIG.iterations} lần\n`,
  );

  const allResults = [];
  const startTime = Date.now();

  for (const page of BATCH_CONFIG.monitoringPages) {
    const result = await batchTestPage(page);

    if (result) {
      allResults.push(result);

      // Hiển thị kết quả ngay
      const stabilityEmoji = result.consistency.isStable ? "✅" : "⚠️";
      const scoreEmoji =
        result.avg.performanceScore >= 90
          ? "🟢"
          : result.avg.performanceScore >= 70
            ? "�"
            : "🔴";

      console.log(
        `   ${scoreEmoji} Avg Score: ${result.avg.performanceScore}/100 (${result.min.performanceScore}-${result.max.performanceScore})`,
      );
      console.log(
        `   ${stabilityEmoji} Stability: ${result.consistency.isStable ? "Stable" : "Unstable"} (variance: ${result.consistency.scoreVariance})`,
      );
      console.log(
        `   ⏱️  Avg FCP: ${result.avg.fcp}ms, Avg LCP: ${result.avg.lcp}ms`,
      );
      console.log(
        `   🔄 Success Rate: ${result.successfulRuns}/${result.totalRuns}\n`,
      );
    }
  }

  // Phân tích tổng hợp
  console.log("📈 PHÂN TÍCH TỔNG HỢP:");
  console.log("=".repeat(70));

  const criticalPages = allResults.filter((r) => r.critical);
  const nonCriticalPages = allResults.filter((r) => !r.critical);

  // Critical pages analysis
  if (criticalPages.length > 0) {
    const criticalAvg =
      criticalPages.reduce((sum, r) => sum + r.avg.performanceScore, 0) /
      criticalPages.length;
    const unstableCritical = criticalPages.filter(
      (r) => !r.consistency.isStable,
    );

    console.log(`\n🔴 CRITICAL PAGES (${criticalPages.length}):`);
    console.log(`   Average Score: ${Math.round(criticalAvg)}/100`);
    console.log(
      `   Unstable Pages: ${unstableCritical.length}/${criticalPages.length}`,
    );

    if (unstableCritical.length > 0) {
      console.log(`   ⚠️  Unstable Critical Pages:`);
      unstableCritical.forEach((page) => {
        console.log(
          `      - ${page.name}: ${page.avg.performanceScore}/100 (variance: ${page.consistency.scoreVariance})`,
        );
      });
    }
  }

  // Non-critical pages analysis
  if (nonCriticalPages.length > 0) {
    const nonCriticalAvg =
      nonCriticalPages.reduce((sum, r) => sum + r.avg.performanceScore, 0) /
      nonCriticalPages.length;
    console.log(`\n🟡 NON-CRITICAL PAGES (${nonCriticalPages.length}):`);
    console.log(`   Average Score: ${Math.round(nonCriticalAvg)}/100`);
  }

  // Overall stability
  const stablePages = allResults.filter((r) => r.consistency.isStable);
  console.log(`\n📊 OVERALL STABILITY:`);
  console.log(
    `   Stable Pages: ${stablePages.length}/${allResults.length} (${Math.round((stablePages.length / allResults.length) * 100)}%)`,
  );

  // Performance trends (if historical data exists)
  await analyzePerformanceTrends(allResults);

  // Lưu kết quả chi tiết
  const monitoringData = {
    testDate: new Date().toISOString(),
    config: BATCH_CONFIG,
    totalTestTime: Date.now() - startTime,
    summary: {
      totalPages: allResults.length,
      criticalPages: criticalPages.length,
      stablePages: stablePages.length,
      avgScore: Math.round(
        allResults.reduce((sum, r) => sum + r.avg.performanceScore, 0) /
          allResults.length,
      ),
    },
    results: allResults,
  };

  // Lưu vào file theo ngày
  const dateStr = new Date().toISOString().split("T")[0];
  const fileName = `monitoring-${dateStr}-${Date.now()}.json`;
  fs.writeFileSync(
    `./reports/${fileName}`,
    JSON.stringify(monitoringData, null, 2),
  );

  // Lưu vào file tracking dài hạn
  appendToHistoricalData(monitoringData);

  // Tạo báo cáo HTML
  generateMonitoringHTML(monitoringData);

  console.log(`\n💾 Kết quả đã lưu:`);
  console.log(`   📄 ./reports/${fileName}`);
  console.log(`   📄 ./reports/historical-data.json`);
  console.log(`   📄 ./reports/monitoring-report.html`);

  // Đưa ra cảnh báo nếu cần
  generateAlerts(allResults);
}

async function analyzePerformanceTrends(currentResults) {
  const historicalFile = "./reports/historical-data.json";

  if (!fs.existsSync(historicalFile)) {
    console.log(`\n📈 PERFORMANCE TRENDS: No historical data available`);
    return;
  }

  try {
    const historicalData = JSON.parse(fs.readFileSync(historicalFile, "utf8"));

    if (historicalData.length < 2) {
      console.log(`\n📈 PERFORMANCE TRENDS: Need more historical data`);
      return;
    }

    console.log(`\n📈 PERFORMANCE TRENDS (vs last test):`);

    const lastTest = historicalData[historicalData.length - 1];

    currentResults.forEach((current) => {
      const lastResult = lastTest.results.find((r) => r.name === current.name);

      if (lastResult) {
        const scoreDiff =
          current.avg.performanceScore - lastResult.avg.performanceScore;
        const trendEmoji = scoreDiff > 5 ? "📈" : scoreDiff < -5 ? "📉" : "➡️";

        console.log(
          `   ${trendEmoji} ${current.name}: ${current.avg.performanceScore}/100 (${scoreDiff > 0 ? "+" : ""}${scoreDiff})`,
        );
      }
    });
  } catch (error) {
    console.log(`\n📈 PERFORMANCE TRENDS: Error reading historical data`);
  }
}

function appendToHistoricalData(monitoringData) {
  const historicalFile = "./reports/historical-data.json";
  let historicalData = [];

  if (fs.existsSync(historicalFile)) {
    try {
      historicalData = JSON.parse(fs.readFileSync(historicalFile, "utf8"));
    } catch (error) {
      console.log("Warning: Could not read historical data");
    }
  }

  historicalData.push(monitoringData);

  // Giữ chỉ 30 lần test gần nhất
  if (historicalData.length > 30) {
    historicalData = historicalData.slice(-30);
  }

  fs.writeFileSync(historicalFile, JSON.stringify(historicalData, null, 2));
}

function generateAlerts(results) {
  console.log(`\n🚨 ALERTS & RECOMMENDATIONS:`);

  let hasAlerts = false;

  // Alert cho critical pages với điểm thấp
  const lowScoreCritical = results.filter(
    (r) => r.critical && r.avg.performanceScore < 70,
  );
  if (lowScoreCritical.length > 0) {
    hasAlerts = true;
    console.log(
      `   🔴 CRITICAL: ${lowScoreCritical.length} critical pages with score < 70`,
    );
    lowScoreCritical.forEach((page) => {
      console.log(`      - ${page.name}: ${page.avg.performanceScore}/100`);
    });
  }

  // Alert cho pages không ổn định
  const unstablePages = results.filter((r) => !r.consistency.isStable);
  if (unstablePages.length > 0) {
    hasAlerts = true;
    console.log(
      `   ⚠️  WARNING: ${unstablePages.length} pages with unstable performance`,
    );
    unstablePages.forEach((page) => {
      console.log(
        `      - ${page.name}: variance ${page.consistency.scoreVariance}`,
      );
    });
  }

  // Alert cho slow pages
  const slowPages = results.filter((r) => r.avg.lcp > 2500);
  if (slowPages.length > 0) {
    hasAlerts = true;
    console.log(`   🐌 SLOW: ${slowPages.length} pages with LCP > 2.5s`);
    slowPages.forEach((page) => {
      console.log(`      - ${page.name}: LCP ${page.avg.lcp}ms`);
    });
  }

  if (!hasAlerts) {
    console.log(`   ✅ No critical issues detected`);
  }
}

function generateMonitoringHTML(data) {
  // HTML generation code (simplified for brevity)
  const html = `
<!DOCTYPE html>
<html>
<head>
    <title>Performance Monitoring Report</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 20px; }
        .metric-good { color: #2e7d32; }
        .metric-medium { color: #f57c00; }
        .metric-poor { color: #d32f2f; }
        .stable { background: #e8f5e8; }
        .unstable { background: #fff3e0; }
        table { width: 100%; border-collapse: collapse; margin: 20px 0; }
        th, td { padding: 10px; text-align: left; border: 1px solid #ddd; }
        th { background: #f5f5f5; }
    </style>
</head>
<body>
    <h1>📊 Performance Monitoring Report</h1>
    <p><strong>Test Date:</strong> ${new Date(data.testDate).toLocaleString()}</p>
    <p><strong>Iterations per page:</strong> ${data.config.iterations}</p>
    <p><strong>Average Score:</strong> ${data.summary.avgScore}/100</p>
    
    <h2>📈 Results Summary</h2>
    <table>
        <thead>
            <tr>
                <th>Page</th>
                <th>Type</th>
                <th>Avg Score</th>
                <th>Score Range</th>
                <th>Avg FCP</th>
                <th>Avg LCP</th>
                <th>Stability</th>
                <th>Success Rate</th>
            </tr>
        </thead>
        <tbody>
            ${data.results
              .map(
                (result) => `
                <tr class="${result.consistency.isStable ? "stable" : "unstable"}">
                    <td><strong>${result.name}</strong></td>
                    <td>${result.critical ? "🔴 Critical" : "🟡 Normal"}</td>
                    <td class="${result.avg.performanceScore >= 90 ? "metric-good" : result.avg.performanceScore >= 70 ? "metric-medium" : "metric-poor"}">
                        ${result.avg.performanceScore}/100
                    </td>
                    <td>${result.min.performanceScore}-${result.max.performanceScore}</td>
                    <td>${result.avg.fcp}ms</td>
                    <td>${result.avg.lcp}ms</td>
                    <td>${result.consistency.isStable ? "✅ Stable" : "⚠️ Unstable"}</td>
                    <td>${result.successfulRuns}/${result.totalRuns}</td>
                </tr>
            `,
              )
              .join("")}
        </tbody>
    </table>
</body>
</html>`;

  fs.writeFileSync("./reports/monitoring-report.html", html);
}

// Chạy batch monitoring
if (!fs.existsSync("./reports")) {
  fs.mkdirSync("./reports");
}

runBatchMonitoring().catch(console.error);
