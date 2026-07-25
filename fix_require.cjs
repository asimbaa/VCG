const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

// replace require with standard import
if (!server.includes('import { GoogleGenAI }')) {
    server = 'import { GoogleGenAI } from "@google/genai";\n' + server;
}

// replace `const { GoogleGenAI } = require("@google/genai");` with nothing, or we can just use the imported one.
server = server.replace('const { GoogleGenAI } = require("@google/genai");', '');

fs.writeFileSync('server.ts', server);
console.log("Fixed require");
