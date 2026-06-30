import { GoogleGenerativeAI, SchemaType } from "@google/generative-ai";

const geminiApiKey = typeof process !== "undefined" ? process.env?.GEMINI_API_KEY : "";
const genAI = new GoogleGenerativeAI(geminiApiKey || "");
const aiModel = genAI.getGenerativeModel({ 
  model: "gemini-1.5-flash",
  generationConfig: {
    responseMimeType: "application/json",
  }
});

export type DocumentType = "INVOICE" | "RESUME" | "MEMO" | "REPORT";

export interface GeneratedDocument {
  type: DocumentType;
  title: string;
  data: any; // Specific to the document type
}

const invoiceSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    companyName: { type: SchemaType.STRING },
    companyTaxId: { type: SchemaType.STRING, description: "Tax ID such as ABN (Australia), EIN (US), or VAT" },
    companyAddress: { type: SchemaType.STRING },
    clientName: { type: SchemaType.STRING },
    clientTaxId: { type: SchemaType.STRING, description: "Client Tax ID such as ABN, EIN, or VAT" },
    clientAddress: { type: SchemaType.STRING },
    invoiceNumber: { type: SchemaType.STRING },
    date: { type: SchemaType.STRING },
    dueDate: { type: SchemaType.STRING },
    currency: { type: SchemaType.STRING, description: "Currency symbol (e.g., $, A$, €, £)" },
    taxName: { type: SchemaType.STRING, description: "Name of the tax (e.g., GST, VAT, Sales Tax)" },
    isTaxInclusive: { type: SchemaType.BOOLEAN, description: "True if the region typically uses tax-inclusive pricing (e.g., Australia/UK)" },
    items: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          description: { type: SchemaType.STRING },
          quantity: { type: SchemaType.NUMBER },
          unitPrice: { type: SchemaType.NUMBER },
          amount: { type: SchemaType.NUMBER },
        },
        required: ["description", "quantity", "unitPrice", "amount"],
      },
    },
    subtotal: { type: SchemaType.NUMBER },
    taxRate: { type: SchemaType.NUMBER, description: "Tax rate as a percentage (e.g., 10 for 10%)" },
    taxAmount: { type: SchemaType.NUMBER },
    total: { type: SchemaType.NUMBER },
    notes: { type: SchemaType.STRING },
  },
  required: ["companyName", "clientName", "invoiceNumber", "date", "items", "subtotal", "total"],
};

const resumeSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    fullName: { type: SchemaType.STRING },
    title: { type: SchemaType.STRING },
    contact: {
      type: SchemaType.OBJECT,
      properties: {
        email: { type: SchemaType.STRING },
        phone: { type: SchemaType.STRING },
        location: { type: SchemaType.STRING },
        website: { type: SchemaType.STRING },
      },
    },
    summary: { type: SchemaType.STRING },
    experience: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          company: { type: SchemaType.STRING },
          position: { type: SchemaType.STRING },
          startDate: { type: SchemaType.STRING },
          endDate: { type: SchemaType.STRING },
          description: {
            type: SchemaType.ARRAY,
            items: { type: SchemaType.STRING },
          },
        },
        required: ["company", "position", "startDate", "description"],
      },
    },
    education: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          institution: { type: SchemaType.STRING },
          degree: { type: SchemaType.STRING },
          year: { type: SchemaType.STRING },
        },
        required: ["institution", "degree"],
      },
    },
    skills: {
      type: SchemaType.ARRAY,
      items: { type: SchemaType.STRING },
    },
  },
  required: ["fullName", "experience", "education", "skills"],
};

const memoSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    to: { type: SchemaType.STRING },
    from: { type: SchemaType.STRING },
    date: { type: SchemaType.STRING },
    subject: { type: SchemaType.STRING },
    body: { type: SchemaType.STRING, description: "The main content of the memo, can include markdown." },
  },
  required: ["to", "from", "date", "subject", "body"],
};

const reportSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    title: { type: SchemaType.STRING },
    author: { type: SchemaType.STRING },
    date: { type: SchemaType.STRING },
    content: { type: SchemaType.STRING, description: "The full report content in Markdown format." },
  },
  required: ["title", "content"],
};

const documentSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    type: {
      type: SchemaType.STRING,
      description: "The type of document to generate. Must be one of: INVOICE, RESUME, MEMO, REPORT",
      enum: ["INVOICE", "RESUME", "MEMO", "REPORT"],
    },
    title: { type: SchemaType.STRING, description: "A short title for the document" },
    invoiceData: invoiceSchema,
    resumeData: resumeSchema,
    memoData: memoSchema,
    reportData: reportSchema,
  },
  required: ["type", "title"],
};

export async function generateDocument(prompt: string): Promise<GeneratedDocument> {
  try {
    const response = await aiModel.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `You are an expert document creator. Based on the user's request, generate the appropriate document data.
      
          User Request: "${prompt}"
          
          Instructions:
          1. Determine the best document type (INVOICE, RESUME, MEMO, or REPORT).
          2. Fill out the corresponding data object (e.g., if type is INVOICE, fill out invoiceData).
          3. Make up realistic placeholder data for any missing information that is typically required for that document type, unless the user explicitly provided it.
          4. Ensure calculations for invoices are correct.
          5. Use professional language and formatting.
          6. For invoices, accurately extract and include Tax IDs (like Australian ABNs or US EINs) and use the correct currency symbol (e.g., A$ for AUD, $ for USD).
          7. For invoices, determine the correct tax structure for the region (e.g., GST for Australia/NZ, VAT for UK, Sales Tax for US). Set \`taxName\` accordingly.
          8. For invoices, ALWAYS provide \`unitPrice\` as the NET (tax-exclusive) price. If the user provides a tax-inclusive price, reverse-calculate the net price. Set \`isTaxInclusive\` to true if the region typically displays prices inclusive of tax by default.`
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: documentSchema,
      }
    });

    const text = response.response.text();
    if (!text) throw new Error("No response from AI");

    const result = JSON.parse(text);
    
    let data;
    switch (result.type) {
      case "INVOICE": data = result.invoiceData; break;
      case "RESUME": data = result.resumeData; break;
      case "MEMO": data = result.memoData; break;
      case "REPORT": data = result.reportData; break;
      default: data = result.reportData; result.type = "REPORT"; break;
    }

    return {
      type: result.type as DocumentType,
      title: result.title,
      data,
    };
  } catch (error) {
    console.error("Error generating document:", error);
    throw error;
  }
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

const strategicAdviceSchema: any = {
  type: SchemaType.OBJECT,
  properties: {
    summary: { type: SchemaType.STRING },
    recommendations: {
      type: SchemaType.ARRAY,
      items: {
        type: SchemaType.OBJECT,
        properties: {
          title: { type: SchemaType.STRING },
          description: { type: SchemaType.STRING },
          impact: { type: SchemaType.STRING, enum: ['High', 'Medium', 'Low'] },
        },
        required: ['title', 'description', 'impact'],
      },
    },
    marketOutlook: { type: SchemaType.STRING },
    liquidityScore: { type: SchemaType.NUMBER },
  },
  required: ['summary', 'recommendations', 'marketOutlook', 'liquidityScore'],
};

export async function generateStrategicAdvice(treasuryData: any, recentTransactions: any[]): Promise<StrategicAdvice> {
  try {
    const response = await aiModel.generateContent({
      contents: [{
        role: "user",
        parts: [{
          text: `You are the Valourian Capital Strategist, an elite AI financial advisor for high-net-worth individuals and institutional clients.
      
          Analyze the following treasury data and recent transactions to provide brilliant, high-value strategic advice.
          
          Treasury Data: ${JSON.stringify(treasuryData)}
          Recent Transactions: ${JSON.stringify(recentTransactions)}
          
          Instructions:
          1. Provide a concise executive summary of the current financial position.
          2. Offer 3-4 specific, actionable recommendations for capital allocation or risk management.
          3. Provide a brief market outlook based on the current context.
          4. Assign a liquidity score from 0-100 based on the treasury health.
          5. Use a sophisticated, institutional tone.`
        }]
      }],
      generationConfig: {
        responseMimeType: "application/json",
        responseSchema: strategicAdviceSchema,
      }
    });

    const text = response.response.text();
    if (!text) throw new Error("No response from Strategist");

    return JSON.parse(text);
  } catch (error) {
    console.error("Error generating strategic advice:", error);
    throw error;
  }
}
