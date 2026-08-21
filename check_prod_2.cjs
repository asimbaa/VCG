const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('requestfailed', request => console.log('REQUEST FAILED:', request.url(), request.failure()?.errorText));
  page.on('response', response => {
    if (!response.ok()) console.log('RESPONSE NOT OK:', response.url(), response.status());
  });
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  const { spawn } = require('child_process');
  const server = spawn('npm', ['run', 'start'], {
    env: { ...process.env, NODE_ENV: 'production', PORT: '3000' }
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await page.goto('http://localhost:3000');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await browser.close();
  server.kill();
})();
