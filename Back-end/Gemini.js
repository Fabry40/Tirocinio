import axios from 'axios';
import 'dotenv/config';
import { getUMLPrompt } from './prompt.js';

const API_KEY = process.env.GEMINI_API_KEY;

export class GeminiAPI {
  static async getGeminiResponse(traccia) {
    const prompt = getUMLPrompt(traccia);

    if (!API_KEY) {
      console.error('❌ Errore: La variabile d\'ambiente GEMINI_API_KEY non è impostata.');
      console.error('Assicurati di aver configurato la tua API key di Google Gemini');
      return null;
    }

    try {
      console.log('🤖 Chiamando Google Gemini...');
      const response = await axios.post(
        'https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent',
        {
          contents: [
            {
              parts: [
                {
                  text: prompt
                }
              ]
            }
          ]
        },
        {
          headers: {
            'Content-Type': 'application/json',
          },
          params: {
            key: API_KEY
          }
        }
      );

      const textResponse = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;

      if (textResponse) {
        console.log('✅ Risposta ricevuta da Gemini');
        return textResponse;
      } else {
        console.error('❌ Errore: Risposta da Gemini API non valida o testo non trovato.');
        console.error('Risposta completa:', JSON.stringify(response.data, null, 2));
        return null;
      }
    } catch (error) {
      console.error('❌ Errore durante la richiesta a Gemini API:');
      if (error.response) {
        console.error(`Status: ${error.response.status}`);
        console.error('Data:', error.response.data);
      } else if (error.request) {
        console.error('Nessuna risposta ricevuta:', error.request);
      } else {
        console.error('Errore nella configurazione:', error.message);
      }
      return null;
    }
  }
}