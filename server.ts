import express from "express";
import path from "path";
import dotenv from "dotenv";
import { createServer as createViteServer } from "vite";
import { GoogleGenAI, Type } from "@google/genai";

// Load environment variables
dotenv.config();

const app = express();
const PORT = 3000;

app.use(express.json({ limit: "10mb" }));

// Initialize Gemini Client
let ai: GoogleGenAI | null = null;
const apiKey = process.env.GEMINI_API_KEY;

if (apiKey) {
  ai = new GoogleGenAI({
    apiKey: apiKey,
    httpOptions: {
      headers: {
        "User-Agent": "aistudio-build",
      },
    },
  });
} else {
  console.warn("WARNING: GEMINI_API_KEY environment variable is not set. Using simulated AI logic instead.");
}

// ==========================================
// API ENDPOINTS (AI FEATURE PROXIES)
// ==========================================

// 1. AI Scan Analyzer
app.post("/api/gemini/analyze-scan", async (req, res) => {
  const { image, itemType, qrCode, manualDetails } = req.body;

  if (!ai) {
    // Simulated AI response if key is missing
    return res.json({
      success: true,
      simulated: true,
      analysis: {
        itemName: itemType || "Industrial Copper Reels",
        sku: qrCode || "SKU-COP-4829",
        category: "Electrical Components",
        quantityInferred: 12,
        confidence: 0.94,
        mistakeDetected: false,
        mistakeDetails: "",
        suggestedZone: "Zone C (Heavy Storage)",
        suggestedShelf: "C-Row-3-Bay-2",
        justification: "Reels weigh 45lbs each. Lower tiers of heavy shelving are recommended to reduce load strain on high platforms and facilitate forklift access.",
        weight: "45 lbs",
        dimensions: "24\" x 24\" x 18\"",
      },
    });
  }

  try {
    let prompt = `You are the core intelligence of "Smart Warehouse AI". A warehouse manager is scanning or registering an item. `;
    if (manualDetails) {
      prompt += `The manager provided manual details: "${manualDetails}". `;
    }
    if (qrCode) {
      prompt += `The QR/RFID Code scanned: "${qrCode}". `;
    }
    if (itemType) {
      prompt += `Item type indicated: "${itemType}". `;
    }

    prompt += `Analyze this product and provide detailed, production-quality warehouse registry parameters as a JSON object.
    You must output a JSON object conforming exactly to this structure:
    {
      "itemName": "string (Title Case, e.g. Industrial Copper Reels)",
      "sku": "string (formatted SKU, e.g. SKU-COP-4829)",
      "category": "string (one of: Electrical, Heavy Machinery, Safety Gear, Electronics, Chemicals, Tools, Packaging)",
      "quantityInferred": "number (estimate quantity from inputs or image, default to 10)",
      "confidence": "number (0.0 to 1.0)",
      "mistakeDetected": "boolean (true if there are mismatches, odd quantities, or suspicious labels)",
      "mistakeDetails": "string (empty if no mistake, or details explaining the anomaly)",
      "suggestedZone": "string (one of: Zone A - Fast Moving, Zone B - Temperature Controlled, Zone C - Heavy Storage, Zone D - High Value/Secured, Zone E - Standard Rack)",
      "suggestedShelf": "string (shelf coordinate e.g. B-04-A or C-08-C)",
      "justification": "string (detailed logistics justification of why this shelf and zone is optimal based on the item's properties, weight, velocity, or safety constraints)",
      "weight": "string (estimate weight e.g. 15 lbs)",
      "dimensions": "string (estimate dimensions e.g. 12x12x12 in)"
    }
    Make sure the response is strict JSON. Do not include markdown wraps or anything except the raw JSON.`;

    let contents: any = prompt;

    // Handle Image if present
    if (image && image.startsWith("data:image")) {
      const base64Parts = image.split(",");
      const mimeType = base64Parts[0].split(";")[0].split(":")[1];
      const base64Data = base64Parts[1];

      const imagePart = {
        inlineData: {
          mimeType: mimeType,
          data: base64Data,
        },
      };

      contents = {
        parts: [
          imagePart,
          { text: prompt + " Also, look closely at this photo to infer the item name, count/quantity, condition, packaging, and any visible stock damage or labeling mistakes." }
        ]
      };
    }

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: contents,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            itemName: { type: Type.STRING },
            sku: { type: Type.STRING },
            category: { type: Type.STRING },
            quantityInferred: { type: Type.INTEGER },
            confidence: { type: Type.NUMBER },
            mistakeDetected: { type: Type.BOOLEAN },
            mistakeDetails: { type: Type.STRING },
            suggestedZone: { type: Type.STRING },
            suggestedShelf: { type: Type.STRING },
            justification: { type: Type.STRING },
            weight: { type: Type.STRING },
            dimensions: { type: Type.STRING },
          },
          required: [
            "itemName", "sku", "category", "quantityInferred", "confidence",
            "mistakeDetected", "mistakeDetails", "suggestedZone", "suggestedShelf",
            "justification", "weight", "dimensions"
          ]
        },
      }
    });

    const text = response.text || "{}";
    const result = JSON.parse(text);
    res.json({ success: true, simulated: false, analysis: result });
  } catch (error: any) {
    console.error("Gemini Scan Analysis Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 2. AI Storage Suggestion & Optimization
app.post("/api/gemini/suggest-storage", async (req, res) => {
  const { name, weight, dimensions, accessFrequency, temperatureSensitive, hazardous } = req.body;

  if (!ai) {
    return res.json({
      success: true,
      simulated: true,
      suggestion: {
        recommendedZone: hazardous ? "Zone F (Hazardous & Safety Vent)" : (temperatureSensitive ? "Zone B (Cold Storage)" : "Zone A (Fast Moving)"),
        shelfCoordinates: "A-Row-1-Bay-4",
        accessibilityScore: 9.8,
        safetyGuidelines: "Store below eye level to prevent forklift drop hazards. Ground electrostatic hazards properly.",
        allocationMapReason: `Based on access frequency (${accessFrequency}) and weight (${weight} lbs), this item was placed in highly accessible racks near dispatch dock to minimize retrieval times.`
      }
    });
  }

  try {
    const prompt = `Suggest the absolute best physical warehouse storage location for an item with the following specs:
    - Item Name: "${name}"
    - Weight: ${weight} lbs
    - Dimensions: "${dimensions}"
    - Retrieval Frequency (Velocity): "${accessFrequency}" (High, Medium, or Low)
    - Temperature Sensitive: ${temperatureSensitive ? "Yes" : "No"}
    - Hazardous/Fragile: ${hazardous ? "Yes" : "No"}

    Your warehouse layout is as follows:
    - Zone A (Fast Moving): Right next to the shipping dock. Best for high velocity, standard items under 30 lbs.
    - Zone B (Temperature Controlled / Cold Storage): Fully climate-controlled at 4°C. Best for electronics, perishable labels, and sensitive chemical components.
    - Zone C (Heavy Storage): Reinforced structural floor plates and lower shelves. Best for heavy metals, cables, reels, or gear exceeding 40 lbs.
    - Zone D (High Value / Secured Vault): Guarded key-card access. Best for high-value tools, computing nodes, or microprocessors.
    - Zone E (Standard Racks): General bulk shelving for slow/medium velocity standard packages.

    Analyze the item's requirements and provide optimal logistics advice. Return a strict JSON response:
    {
      "recommendedZone": "string (The chosen zone name from above)",
      "shelfCoordinates": "string (A coordinate e.g. B-05-C, C-12-A, D-01-B)",
      "accessibilityScore": "number (0.0 to 10.0 indicating how accessible/close to floor/docks it must be)",
      "safetyGuidelines": "string (specific safety instructions when handling/loading this item)",
      "allocationMapReason": "string (clear, rigorous physical explanation of why this zone/shelf choice is optimal based on physics, forklift speed, safety, or HVAC requirements)"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            recommendedZone: { type: Type.STRING },
            shelfCoordinates: { type: Type.STRING },
            accessibilityScore: { type: Type.NUMBER },
            safetyGuidelines: { type: Type.STRING },
            allocationMapReason: { type: Type.STRING },
          },
          required: ["recommendedZone", "shelfCoordinates", "accessibilityScore", "safetyGuidelines", "allocationMapReason"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json({ success: true, simulated: false, suggestion: result });
  } catch (error: any) {
    console.error("Gemini Storage Optimizer Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 3. AI Equipment Predictive Maintenance
app.post("/api/gemini/predict-maintenance", async (req, res) => {
  const { equipmentName, modelNo, currentRunHours, lastServiceDate, temperature, vibrationLevel, abnormalNoise, heavyLoadCycles } = req.body;

  if (!ai) {
    return res.json({
      success: true,
      simulated: true,
      prediction: {
        failureRisk: "Medium-High",
        daysToService: 14,
        healthIndicator: 68,
        warningFlags: ["Elevated bearing vibration detected", "Continuous heavy load cycles"],
        servicePlan: "Vibration exceeds safe threshold of 4.5mm/s. Scheduled maintenance must replace the main drive hydraulic seals and inspect the rotor bearings for friction micro-wear.",
        predictedFailurePoints: "Main rotor bearing assembly and pressure relief valves."
      }
    });
  }

  try {
    const prompt = `You are a Senior Predictive Maintenance Engineer for industrial warehouse robotics and machinery.
    Analyze telemetry data for:
    - Equipment Name: "${equipmentName}"
    - Model: "${modelNo}"
    - Cumulative Run Hours: ${currentRunHours} hours
    - Last Service Date: "${lastServiceDate}"
    - Operating Temperature: ${temperature}°C
    - Vibration Level: ${vibrationLevel} mm/s (standard safe is < 3.0 mm/s)
    - Unusual Noise Reported: ${abnormalNoise ? "Yes" : "No"}
    - Percent High-Load Cycles: ${heavyLoadCycles}%

    Predict its maintenance window, structural failures risks, and provide a preventative servicing list. Return a strict JSON response:
    {
      "failureRisk": "string (Low, Medium, High, or Critical)",
      "daysToService": "number (predicted number of days before a maintenance action is mandatory)",
      "healthIndicator": "number (0 to 100, where 100 is pristine health)",
      "warningFlags": "array of strings (any alarming telemetry readings noticed)",
      "servicePlan": "string (concise step-by-step preventative checklist for technicians)",
      "predictedFailurePoints": "string (likely physical component to give out first e.g. hydraulic fluid seals, motor shaft bearing)"
    }`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: {
          type: Type.OBJECT,
          properties: {
            failureRisk: { type: Type.STRING },
            daysToService: { type: Type.INTEGER },
            healthIndicator: { type: Type.INTEGER },
            warningFlags: {
              type: Type.ARRAY,
              items: { type: Type.STRING }
            },
            servicePlan: { type: Type.STRING },
            predictedFailurePoints: { type: Type.STRING },
          },
          required: ["failureRisk", "daysToService", "healthIndicator", "warningFlags", "servicePlan", "predictedFailurePoints"]
        }
      }
    });

    const result = JSON.parse(response.text || "{}");
    res.json({ success: true, simulated: false, prediction: result });
  } catch (error: any) {
    console.error("Gemini Maintenance Prediction Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});

// 4. AI Performance Report Insights
app.post("/api/gemini/generate-report", async (req, res) => {
  const { metrics } = req.body;

  if (!ai) {
    return res.json({
      success: true,
      simulated: true,
      reportText: `### 📊 AI Smart Warehouse Performance Audit
**Operational Efficiency**: Outstanding
- **Space Occupancy**: 78% (Within optimal range of 75%-85%).
- **Turnover Rate**: 4.8x annually, driven by highly efficient dispatch cycles in **Zone A**.
- **Average Scan Speed**: 2.4 seconds per item.

#### 💡 Recommendations
1. **Dynamic Re-allocation**: Space utilization in **Zone C (Heavy Storage)** is approaching 92%. Move inactive safety machinery and slow-moving packaging boxes to **Zone E** to prevent floor bottlenecks.
2. **Predictive Alert**: Forklift #3 is displaying continuous friction telemetry warnings. Perform hydraulic belt servicing immediately to prevent a critical shift shutdown.
3. **Audit Discrepancy**: Recent physical checks flagged a -5 reel mismatch at Bay 4. Recommend installing RFID automatic gateways at Dock-Row-2 to automatically track transit counts and reduce human logging error.`
    });
  }

  try {
    const prompt = `Write an Executive AI Report for a Warehouse Manager based on these metrics:
    - Space Occupancy across zones: ${JSON.stringify(metrics.zoneUtilization)}
    - Core Stats: Inventory Count: ${metrics.inventoryCount}, Alerts Resolved: ${metrics.alertsResolved}, Speed: ${metrics.scanSpeed}s/scan, High priority alerts: ${metrics.alertsCount}
    - Recent activities: ${JSON.stringify(metrics.recentActions)}

    Formatting requirements:
    Use clean Markdown. Make the report action-oriented, professional, logistics-savvy, and split into clear sections:
    1. Executive Summary
    2. Space Utilization & Zone Efficiencies
    3. AI Discrepancies and Audit Safeguards
    4. Predictive Maintenance Actions

    Suggest specific logistics adjustments to optimize operational throughput. Keep it concise, professional, and visually engaging with bullets.`;

    const response = await ai.models.generateContent({
      model: "gemini-3.5-flash",
      contents: prompt,
    });

    res.json({ success: true, simulated: false, reportText: response.text });
  } catch (error: any) {
    console.error("Gemini Report Generation Error:", error);
    res.status(500).json({ success: false, error: error.message });
  }
});


// ==========================================
// VITE AND STATIC ASSETS SERVING MIDDLEWARE
// ==========================================

async function startServer() {
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), "dist");
    app.use(express.static(distPath));
    app.get("*", (req, res) => {
      res.sendFile(path.join(distPath, "index.html"));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running at http://localhost:${PORT} in ${process.env.NODE_ENV || "development"} mode`);
  });
}

startServer();
