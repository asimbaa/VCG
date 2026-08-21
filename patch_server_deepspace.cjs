const fs = require('fs');

let content = fs.readFileSync('server.ts', 'utf8');

const newAgent = `    if (agentId === "creative") baseInstruction += "\\nACT AS LYRA (CREATIVE DIRECTOR): Focus on untouchable branding and aesthetic supremacy.";
    if (agentId === "DeepSpace") baseInstruction += "\\nACT AS DEEP SPACE COMPUTING CLUSTER (LOGISTICS & NEURAL SUPPORT): Focus on instantaneous tracking, global intercept algorithms, rerouting intelligence, logistics optimization, and securing physical/digital property chains.";
`;

content = content.replace(/    if \(agentId === "creative"\) baseInstruction \+= "\\nACT AS LYRA \(CREATIVE DIRECTOR\): Focus on untouchable branding and aesthetic supremacy\.";/, newAgent);

fs.writeFileSync('server.ts', content);
console.log("Added DeepSpace agent instruction.");
