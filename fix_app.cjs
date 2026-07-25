const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// The file currently ends with:
//      </div>
//      </div>
//    </ErrorBoundary>
//  );
//}

// We will change it to:
content = content.replace(/<\/div>\s*<\/div>\s*<\/ErrorBoundary>/, '</div>\n    </ErrorBoundary>');

fs.writeFileSync('src/App.tsx', content);
