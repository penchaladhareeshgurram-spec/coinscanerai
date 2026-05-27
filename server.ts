import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = 3000;

  app.use(cors());
  app.use(express.json());

  // AI Chat Route
  app.post("/api/chat", async (req, res) => {
    const apiKey = process.env.GEMINI_API_KEY;
    console.log("Chat request received. API Key present:", !!apiKey);
    if (!apiKey) {
      return res.status(500).json({ error: "GEMINI_API_KEY environment variable is missing" });
    }

    try {
      const ai = new GoogleGenAI({ apiKey });
      const { messages } = req.body;
      
      const response = await ai.models.generateContent({
        model: 'gemini-2.5-pro',
        contents: messages,
        config: {
          systemInstruction: "You are a Quantitative Trading Assistant. You help clarify traders' doubts, provide deep technical and fundamental analysis when provided a specific ticker. When generating analysis or signals, explicitly list the specific technical indicators and parameters (e.g., RSI(14) value, EMA(20) crossover EMA(50), MACD histogram momentum, VWAP) that led to your conclusion. Do not execute trades autonomously. Wait for the 'EXECUTE' command before formatting final trade parameters. Provide clear Support/Resistance, Sentiment Analysis, and Risk/Reward."
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // Vite middleware for development
  if (process.env.NODE_ENV !== "production") {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: "spa",
    });
    app.use(vite.middlewares);
  } else {
    const distPath = path.join(process.cwd(), 'dist');
    app.use(express.static(distPath));
    // For React Router fallback
    app.get('*', (req, res) => {
      res.sendFile(path.join(distPath, 'index.html'));
    });
  }

  app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
