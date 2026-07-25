const fs = require('fs');
let server = fs.readFileSync('server.ts', 'utf8');

// The route might be duplicated, let's remove everything after `// Vite middleware for development`
const splitToken = '// Vite middleware for development';
const parts = server.split(splitToken);

if (parts.length > 1) {
    let topPart = parts[0];
    let bottomPart = splitToken + parts[1];

    // Find the deep research route in the bottom part, actually we'll just cut out ALL deep research stuff and re-add it cleanly at the end of the top part.
    
    // First, let's remove the deep research routes from the bottom part.
    // They start with `app.post("/api/gemini/deep-research",`
    
    // Actually, it's easier to just strip them by splitting at `app.post("/api/gemini/deep-research"`
    const bottomClean = bottomPart.split('app.post("/api/gemini/deep-research"')[0];
    
    const deepResearchRoute = `
// Deep Research API
app.post("/api/gemini/deep-research", async (req, res) => {
  try {
    const { prompt } = req.body;
    if (!prompt) return res.status(400).json({ error: "No prompt provided" });
        
    const { GoogleGenAI } = require("@google/genai");
    const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
    
    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        tools: [{ googleSearch: {} }],
        systemInstruction: "You are a Deep Research AI tasked with finding high-growth strategic banking technology providers. Return a concise, structured analysis of targets with specific growth metrics, valuations, and equity recommendation strategies.",
      },
    });
    
    const chunks = response.candidates?.[0]?.groundingMetadata?.groundingChunks;
    const urls = chunks ? chunks.map((c) => c.web?.uri).filter(Boolean) : [];
    res.json({ text: response.text, urls });
  } catch (error) {
    console.error("Deep Research Error:", error);
    res.status(500).json({ error: error.message });
  }
});
`;

    // Reconstruct
    const newServer = topPart + deepResearchRoute + "\n" + bottomClean;
    fs.writeFileSync('server.ts', newServer);
    console.log("Fixed server.ts routes");
}
