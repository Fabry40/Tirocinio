import axios from 'axios';
import 'dotenv/config';

const API_KEY = process.env.GEMINI_API_KEY;

export class GeminiAPI {
  static async getGeminiResponse(traccia) {
    let prompt = `Sei uno studente che deve creare un diagramma UML delle classi a partire da una traccia fornita da un docente. L'obiettivo è interpretare la traccia in modo semplice, diretto e neutro, senza ottimizzazioni avanzate o scelte architetturali personali. Usa PlantUML e rappresenta:

    - tutte le classi e i loro attributi principali, con tipo e chiavi primarie se deducibili,
    - eventuali enumerazioni,
    - tutte le relazioni tra le classi (associazioni, composizioni, ereditarietà) indicando chiaramente:
      - la molteplicità,
      - la direzionalità,
      - eventuali nomi dei ruoli.

    Evita modelli avanzati, come classi astratte, controller, state machine o normalizzazioni eccessive. Interpreta ciò che è scritto nella traccia in modo il più possibile diretto e scolastico.

    La traccia è la seguente:

    "${traccia}"

    Genera solo un diagramma UML delle classi in sintassi PlantUML, aderente al significato esplicito della traccia. Fornisci esclusivamente il diagramma in sintassi PlantUML, racchiuso tra @startuml e @enduml.`;

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
        console.log('Risposta di Gemini:', textResponse);
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