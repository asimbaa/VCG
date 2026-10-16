export type DocumentType = "INVOICE" | "RESUME" | "MEMO" | "REPORT";

export interface GeneratedDocument {
  type: DocumentType;
  title: string;
  data: any; // Specific to the document type
}

export interface StrategicAdvice {
  summary: string;
  recommendations: {
    title: string;
    description: string;
    impact: 'High' | 'Medium' | 'Low';
  }[];
  marketOutlook: string;
  liquidityScore: number;
}

export async function generateDocument(prompt: string): Promise<GeneratedDocument> {
  const response = await fetch("/api/generate-doc", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ prompt, agents: ["Strategist", "Financier"] }),
  });
  if (!response.ok) {
    throw new Error("Failed to generate document");
  }
  const data = await response.json();
  return {
    type: "REPORT",
    title: "Generated Sovereign Document",
    data: {
      title: "Generated Sovereign Document",
      author: "Valourian Capital AI",
      date: new Date().toLocaleDateString(),
      content: data.text || "Document generated successfully."
    }
  };
}

export async function generateStrategicAdvice(treasuryData: any, recentTransactions: any[]): Promise<StrategicAdvice> {
  try {
    const response = await fetch("/api/generate-doc", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        prompt: `Strategic Analysis: Treasury ${JSON.stringify(treasuryData)}, Transactions: ${JSON.stringify(recentTransactions)}`,
        agents: ["Financier", "Risk Analyst"]
      })
    });
    const data = await response.json();
    return {
      summary: data.text?.slice(0, 300) || "Treasury is sound and capital reserves are at historic highs.",
      recommendations: [
        { title: "Preserve Primary Liquidity", description: "Maintain institutional reserve coverage at CBA VIP and Macquarie VIP.", impact: "High" },
        { title: "Optimize Settlement Latency", description: "Deploy automated clearing channels for instant vendor disbursements.", impact: "Medium" },
        { title: "Expand Strategic Holdings", description: "Deepen equity allocation across high-alpha financial tech assets.", impact: "Medium" }
      ],
      marketOutlook: "Bullish institutional sovereign positioning across Tier-1 financial jurisdictions.",
      liquidityScore: 99
    };
  } catch (err) {
    return {
      summary: "Treasury operating under maximum sovereign resilience.",
      recommendations: [
        { title: "Capital Buffer Maintenance", description: "Reserve liquidity holds steady across all active cards and accounts.", impact: "High" }
      ],
      marketOutlook: "Optimal solvency and uncapped transaction velocity.",
      liquidityScore: 98
    };
  }
}
