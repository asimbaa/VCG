const fs = require('fs');
let content = fs.readFileSync('server.ts', 'utf8');

// The new sdk is instantiated as const ai = new GoogleGenAI(...)
const initCode = `
const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY || "");
const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY || "" });
`;

content = content.replace(/const genAI = new GoogleGenerativeAI\(process\.env\.GEMINI_API_KEY \|\| ""\);/, initCode);

fs.writeFileSync('server.ts', content);
console.log("Added new ai initialization");
