import express from 'express';
import { createServer as createViteServer } from 'vite';
import { GoogleGenAI } from '@google/genai';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  app.use(express.json());

  const vite = await createViteServer({
    server: { middlewareMode: true },
    appType: 'spa',
  });

  app.use(vite.middlewares);

  const ai = new GoogleGenAI({
    apiKey: process.env.GEMINI_API_KEY!,
    httpOptions: {
      headers: {
        'User-Agent': 'aistudio-build',
      },
    },
  });

  app.post('/api/estimate-price', async (req, res) => {
    const { region, landType, area } = req.body;
    
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.8-flash',
        contents: `Estimate the market price range in NPR for a ${area} ${landType} plot in ${region}, Nepal. Based on historical data and market trends, provide a low and high estimate and a brief explanation. Return the result in JSON format: { "low": number, "high": number, "explanation": string }`,
      });
      
      const result = JSON.parse(response.text || '{}');
      res.json(result);
    } catch (error) {
      console.error('Error estimating price:', error);
      res.status(500).json({ error: 'Failed to estimate price' });
    }
  });

  app.post('/api/generate-listing-image', async (req, res) => {
    const { prompt } = req.body;
    try {
      const response = await ai.models.generateContent({
        model: 'gemini-3.1-flash-lite-image',
        contents: prompt,
        config: { imageConfig: { aspectRatio: '16:9', imageSize: '1K' } }
      });
      const candidates = response.candidates;
      if (candidates && candidates[0] && candidates[0].content && candidates[0].content.parts) {
        for (const part of candidates[0].content.parts) {
          if (part.inlineData) {
            return res.json({ image: `data:image/png;base64,${part.inlineData.data}` });
          }
        }
      }
      res.status(500).json({ error: 'No image generated' });
    } catch (error) {
      console.error('Error generating image:', error);
      res.status(500).json({ error: 'Failed to generate image' });
    }
  });

  app.listen(3000, '0.0.0.0', () => {
    console.log('Server running on port 3000');
  });
}

startServer();
