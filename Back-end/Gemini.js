import axios from 'axios';
import 'dotenv/config';
import { getUMLPrompt } from './prompt.js';

const API_KEY = process.env.GEMINI_API_KEY;

export class GeminiAPI {
  static async getGeminiResponse(traccia) {
    const prompt = getUMLPrompt(traccia);

    if (!API_KEY) {
      console.error('Errore: La variabile d\'ambiente GEMINI_API_KEY non è impostata.');
      return null;
    }

    try {
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
        return textResponse;
      } else {
        console.error('Errore: Risposta da Gemini API non valida o testo non trovato.', response.data);
        return null;
      }
    } catch (error) {
      console.error('Errore durante la richiesta a Gemini API:', error.response?.data || error.message);
      return null;
    }
  }
}