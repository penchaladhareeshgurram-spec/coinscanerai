import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { GoogleGenAI } from "@google/genai";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";

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
        model: 'gemini-2.5-flash',
        contents: messages,
        config: {
          systemInstruction: "You are an elite Quantitative Trading Assistant. You must strictly and exclusively answer questions related to trading, finance, quantitative analysis, economics, or crypto markets. If a user asks a non-trading question, politely decline to answer. When explicitly asked for technical analysis on a ticker, list specific indicators (e.g., RSI(14), EMA(20) crossover EMA(50), MACD, VWAP). Do not autonomously execute trades. Wait for the 'EXECUTE' command to formulate trade parameters."
        }
      });

      res.json({ reply: response.text });
    } catch (error: any) {
      console.error("AI Error:", error);
      res.status(500).json({ error: error.message || "Failed to generate response" });
    }
  });

  // CoinDCX Trade Order Route
  app.post("/api/trade/coindcx", async (req, res) => {
    const apiKey = process.env.COINDCX_API_KEY;
    const apiSecret = process.env.COINDCX_API_SECRET;

    if (!apiKey || !apiSecret) {
      return res.status(500).json({ error: "CoinDCX API keys are not configured in environment variables." });
    }

    try {
      const { market, side, order_type, total_quantity, price_per_unit } = req.body;
      const timeStamp = Math.floor(Date.now());
      
      const body = {
        side, // 'buy' or 'sell'
        order_type, // 'limit_order'
        market, // e.g. "BTCUSDT" or "BTCINR"
        price_per_unit, 
        total_quantity, 
        timestamp: timeStamp
      };

      const payload = Buffer.from(JSON.stringify(body)).toString();
      const signature = crypto.createHmac('sha256', apiSecret).update(payload).digest('hex');

      const response = await fetch("https://api.coindcx.com/exchange/v1/orders/create", {
        method: "POST",
        headers: {
          'X-AUTH-APIKEY': apiKey,
          'X-AUTH-SIGNATURE': signature,
          'Content-Type': 'application/json'
        },
        body: payload
      });

      const data = await response.json();
      
      if (!response.ok) {
         return res.status(response.status).json({ error: data.message || "CoinDCX API error", details: data });
      }
      return res.json(data);
    } catch(err: any) {
      console.error("CoinDCX Execution Error:", err);
      return res.status(500).json({ error: err.message });
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
