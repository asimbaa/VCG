const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  const { spawn } = require('child_process');
  const server = spawn('npm', ['run', 'start'], {
    env: { ...process.env, NODE_ENV: 'production', PORT: '3000' }
  });
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await page.goto('http://localhost:3000');
  await new Promise(resolve => setTimeout(resolve, 5000));
  
  const content = await page.content();
  console.log(content);
  
  await browser.close();
  server.kill();
})();
