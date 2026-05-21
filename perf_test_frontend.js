const { chromium } = require('@playwright/test');

(async () => {
  const browser = await chromium.launch();
  const context = await browser.newContext();
  const page = await context.newPage();
  
  console.log('Starting performance measurement...');
  const start = Date.now();
  
  await page.goto('http://localhost:3000', { waitUntil: 'load' });
  
  const end = Date.now();
  const loadTime = end - start;
  
  const metrics = await page.evaluate(() => {
    const [entry] = performance.getEntriesByType('navigation');
    return {
      dns: entry.domainLookupEnd - entry.domainLookupStart,
      tcp: entry.connectEnd - entry.connectStart,
      ttfb: entry.responseStart - entry.requestStart,
      domInteractive: entry.domInteractive,
      domComplete: entry.domComplete,
      loadEvent: entry.loadEventEnd
    };
  });
  
  console.log(`\n--- Performance Results for http://localhost:3000 ---`);
  console.log(`Total Load Time (JS): ${loadTime}ms`);
  console.log(`Time to First Byte (TTFB): ${metrics.ttfb.toFixed(2)}ms`);
  console.log(`DOM Interactive: ${metrics.domInteractive.toFixed(2)}ms`);
  console.log(`DOM Complete: ${metrics.domComplete.toFixed(2)}ms`);
  console.log(`Load Event End: ${metrics.loadEvent.toFixed(2)}ms`);
  console.log(`----------------------------------------------------\n`);
  
  await browser.close();
})();
