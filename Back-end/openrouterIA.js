import axios from 'axios';
import 'dotenv/config';

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

      console.log(`💬 Risposta da ${modelName}:\n`, response.data.choices[0].message.content);
      return response.data.choices[0].message.content;
    } catch (error) {
      console.error(`❌ Errore con ${modelName}:`, error.response?.data || error.message);
      return null;
    }
  }

  static generateUMLPrompt(traccia) {
  return `Sei uno studente che deve creare un diagramma UML delle classi a partire da una traccia fornita da un docente. L'obiettivo è interpretare la traccia in modo semplice, diretto e neutro, senza ottimizzazioni avanzate o scelte architetturali personali. Usa PlantUML e rappresenta:

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
    }

    static async runMeta(traccia) {
      const prompt = OpenRouterIA.generateUMLPrompt(traccia);
      // Meta LLaMA 4 (Maveric)
      return await OpenRouterIA.callOpenRouterModel('meta-llama/llama-4-maverick:free', prompt);
    }

    static async runDeepSeek(traccia) {
      const prompt = OpenRouterIA.generateUMLPrompt(traccia);
      // DeepSeek V3 (0324)
      return await OpenRouterIA.callOpenRouterModel('deepseek/deepseek-chat-v3-0324:free', prompt);
    }

}

