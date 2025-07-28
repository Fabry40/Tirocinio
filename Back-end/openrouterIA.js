import axios from 'axios';
import 'dotenv/config';
import { getUMLPrompt } from './prompt.js';

const API_KEY = process.env.openrouter_API_KEY;
const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

export class OpenRouterIA {
  // Funzione generica per chiamare un modello su OpenRouter
  static async callOpenRouterModel(modelName, prompt) {
    try {
      const response = await axios.post(
        endpoint,
        {
          model: modelName,
          messages: [
            { role: 'system', content: 'You are a helpful assistant.' },
            { role: 'user', content: prompt },
          ],
        },
        {
          headers: {
            'Authorization': `Bearer ${API_KEY}`,
            'X-Title': 'My Test App',
            'Content-Type': 'application/json',
          },
        }
      );

      //console.log(`💬 Risposta da ${modelName}:\n`, response.data.choices[0].message.content);
      return response.data.choices[0].message.content;
    } catch (error) {
      //console.error(`❌ Errore con ${modelName}:`, error.response?.data || error.message);
      return null;
    }
  }

  static async runMeta(traccia) {
    const prompt = getUMLPrompt(traccia);
      // Meta LLaMA 4 (Maveric)
      return await OpenRouterIA.callOpenRouterModel('meta-llama/llama-3.1-405b-instruct:free', prompt);
    }

    static async runDeepSeek(traccia) {
      const prompt = getUMLPrompt(traccia);
      // DeepSeek: R1 0528
      return await OpenRouterIA.callOpenRouterModel('deepseek/deepseek-chat-v3-0324:free', prompt);
    }

}

