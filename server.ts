import express from "express";
import path from "path";
import cors from "cors";
import dotenv from "dotenv";
import { OpenAI } from "openai";
import { createServer as createViteServer } from "vite";
import crypto from "crypto";

dotenv.config();

const app = express();
const PORT = Number(process.env.PORT) || 3000;

app.use(cors());
app.use(express.json());

// AI Chat Route
app.post("/api/chat", async (req, res) => {
  const apiKey = process.env.OPENAI_API_KEY;
  console.log("Chat request received. API Key present:", !!apiKey);
  if (!apiKey) {
    return res.status(500).json({ error: "OPENAI_API_KEY environment variable is missing" });
  }

  try {
    const openai = new OpenAI({ apiKey });
    const { messages } = req.body;
    
    // OpenAI requires messages in specific format: { role: "system" | "user" | "assistant", content: string }
    // The current frontend might be sending Gemini format: { role: 'user' | 'model', parts: [{ text: "..." }] }
    // We need to map it if needed, but let's check what the frontend sends.
    // I'll map frontend format to OpenAI format.
    const formattedMessages = messages.map((m: any) => ({
      role: m.role === 'model' ? 'assistant' : m.role,
      content: m.parts ? m.parts[0].text : m.content
    }));

    const response = await openai.chat.completions.create({
      model: "gpt-4o",
      messages: [
        {
          role: "system",
          content: "You are an elite Quantitative Trading Assistant. You must strictly and exclusively answer questions related to trading, finance, quantitative analysis, economics, or crypto markets. If a user asks a non-trading question, politely decline to answer. When explicitly asked for technical analysis on a ticker, list specific indicators (e.g., RSI(14), EMA(20) crossover EMA(50), MACD, VWAP). Do not autonomously execute trades. Wait for the 'EXECUTE' command to formulate trade parameters."
        },
        ...formattedMessages
      ]
    });

    res.json({ reply: response.choices[0].message.content });
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

// Vite middleware for development or Static serving for production
async function startServer() {
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

  // Only start the server if not running in a serverless environment like Vercel
  if (!process.env.VERCEL) {
    app.listen(PORT, "0.0.0.0", () => {
      console.log(`Server running on http://localhost:${PORT}`);
    });
  }
}

startServer();

export default app;
