import axios from 'axios';
import 'dotenv/config';
import { getUMLPrompt } from '../prompt.js';

const API_KEY = process.env.openrouter_API_KEY;
const endpoint = 'https://openrouter.ai/api/v1/chat/completions';

export class OpenRouterIA {
  // Funzione generica per chiamare un modello su OpenRouter
  static async callOpenRouterModel(modelName, prompt) {
    // Verifica che l'API key sia configurata
    if (!API_KEY) {
      console.error(`❌ API KEY di OpenRouter non configurata!`);
      console.error(`Assicurati di aver impostato la variabile d'ambiente 'openrouter_API_KEY'`);
      return null;
    }

    try {
      console.log(`Chiamando ${modelName}...`);
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

      console.log(`✅ Risposta ricevuta da ${modelName}`);
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error(`❌ Errore con ${modelName}:`);
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error(`Data:`, error.response.data);
      } else if (error.request) {
        console.error(`Nessuna risposta ricevuta:`, error.request);
      } else {
        console.error(`Errore nella configurazione:`, error.message);
      }
      return null;
    }
  }

  static async runMeta(traccia) {
    const prompt = getUMLPrompt(traccia);
      // Meta LLaMA 4 (Maveric)
      return await OpenRouterIA.callOpenRouterModel('meta-llama/llama-3.1-405b-instruct:free', prompt);
      //console.log(`meta non disponibile`);
    }

    static async runDeepSeek(traccia) {
      const prompt = getUMLPrompt(traccia);
      // DeepSeek: R1 0528
      return await OpenRouterIA.callOpenRouterModel('deepseek/deepseek-r1-0528-qwen3-8b:free', prompt);
    }

}

