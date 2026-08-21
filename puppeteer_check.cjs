const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  page.on('console', msg => {
    if (msg.text().includes('two children with the same key')) {
      console.log("MATCH:", msg.text());
    }
  });
  await page.goto('http://localhost:3000', { waitUntil: 'networkidle2' });
  // click buttons if possible
  const buttons = await page.$$('button');
  for(let b of buttons) {
      try { await b.click(); } catch(e){}
      await new Promise(r => setTimeout(r, 100));
  }
  await browser.close();
})();
