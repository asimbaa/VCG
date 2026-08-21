const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  await page.goto('http://localhost:3000');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  // Try to find the script url
  const scripts = await page.evaluate(() => {
    return Array.from(document.scripts).map(s => s.src);
  });
  console.log(scripts);
  
  await browser.close();
})();
