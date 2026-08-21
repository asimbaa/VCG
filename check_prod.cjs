const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch({ args: ['--no-sandbox', '--disable-setuid-sandbox'] });
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  // Starting the production server
  const { spawn } = require('child_process');
  const server = spawn('npm', ['run', 'start'], {
    env: { ...process.env, NODE_ENV: 'production', PORT: '3000' }
  });
  
  server.stdout.on('data', (data) => console.log('SERVER STDOUT:', data.toString()));
  server.stderr.on('data', (data) => console.error('SERVER STDERR:', data.toString()));
  
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await page.goto('http://localhost:3000');
  await new Promise(resolve => setTimeout(resolve, 3000));
  
  await browser.close();
  server.kill();
})();
