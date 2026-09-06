const fs = require('fs');
let content = fs.readFileSync('index.html', 'utf8');

if (!content.includes('apple-mobile-web-app-capable')) {
    content = content.replace(
        '<meta name="viewport" content="width=device-width, initial-scale=1.0" />',
        `<meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="theme-color" content="#020617" />
    <meta name="mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-capable" content="yes" />
    <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
    <meta name="apple-mobile-web-app-title" content="Valourian" />`
    );
    fs.writeFileSync('index.html', content);
}
