// performance-test.js
const lighthouse = require('lighthouse');
const chromeLauncher = require('chrome-launcher');
const fs = require('fs');

// Các trang cần test hiệu năng
const PAGES_TO_TEST = [
  {
    name: 'Home Page',
    url: 'http://localhost:5173/home-page'
  },
  {
    name: 'Products Page', 
    url: 'http://localhost:5173/product/search/1/8'
  },
  {
    name: 'Cart Page',
    url: 'http://localhost:5173/cart'
  },
  {
    name: 'Checkout Page',
    url: 'http://localhost:5173/checkout'
  }
];

// Cấu hình Lighthouse
const options = {
  onlyCategories: ['performance'],
  chromeFlags: ['--headless', '--no-sandbox'],
  logLevel: 'info',
  output: 'html'
};

async function runLighthouse(url) {
  const chrome = await chromeLauncher.launch({chromeFlags: ['--headless']});
  options.port = chrome.port;
  
  const runnerResult = await lighthouse(url, options);
  await chrome.kill();
  
  return runnerResult;
}

async function testPerformance() {
  console.log('🚀 Bắt đầu test hiệu năng...\n');
  
  const results = [];
  
  for (const page of PAGES_TO_TEST) {
    console.log(`📊 Đang test: ${page.name}`);
    
    try {
      const result = await runLighthouse(page.url);
      const lhr = result.lhr;
      
      // Lấy các metrics quan trọng
      const metrics = {
        name: page.name,
        url: page.url,
        performanceScore: Math.round(lhr.categories.performance.score * 100),
        firstContentfulPaint: lhr.audits['first-contentful-paint'].displayValue,
        largestContentfulPaint: lhr.audits['largest-contentful-paint'].displayValue,
        cumulativeLayoutShift: lhr.audits['cumulative-layout-shift'].displayValue,
        totalBlockingTime: lhr.audits['total-blocking-time'].displayValue,
        speedIndex: lhr.audits['speed-index'].displayValue
      };
      
      results.push(metrics);
      
      // Lưu report HTML
      const reportPath = `./reports/${page.name.replace(/\s+/g, '-').toLowerCase()}-report.html`;
      fs.writeFileSync(reportPath, result.report);
      
      console.log(`✅ ${page.name}: ${metrics.performanceScore}/100`);
      
    } catch (error) {
      console.log(`❌ Lỗi khi test ${page.name}: ${error.message}`);
    }
  }
  
  // Hiển thị kết quả tổng hợp
  console.log('\n📈 KẾT QUẢ HIỆU NĂNG:');
  console.log('='.repeat(80));
  
  results.forEach(result => {
    console.log(`
📄 ${result.name}
   Performance Score: ${result.performanceScore}/100
   First Contentful Paint: ${result.firstContentfulPaint}
   Largest Contentful Paint: ${result.largestContentfulPaint}
   Cumulative Layout Shift: ${result.cumulativeLayoutShift}
   Total Blocking Time: ${result.totalBlockingTime}
   Speed Index: ${result.speedIndex}
   Report: ./reports/${result.name.replace(/\s+/g, '-').toLowerCase()}-report.html
    `);
  });
  
  // Lưu kết quả JSON
  fs.writeFileSync('./reports/performance-summary.json', JSON.stringify(results, null, 2));
  
  // Đánh giá tổng thể
  const avgScore = results.reduce((sum, r) => sum + r.performanceScore, 0) / results.length;
  console.log(`\n🎯 ĐIỂM TRUNG BÌNH: ${Math.round(avgScore)}/100`);
  
  if (avgScore >= 90) {
    console.log('🟢 Hiệu năng XUẤT SẮC!');
  } else if (avgScore >= 70) {
    console.log('🟡 Hiệu năng TỐT - Có thể cải thiện');
  } else {
    console.log('🔴 Hiệu năng YẾU - Cần tối ưu gấp!');
  }
}

// Chạy test
if (!fs.existsSync('./reports')) {
  fs.mkdirSync('./reports');
}

testPerformance().catch(console.error);