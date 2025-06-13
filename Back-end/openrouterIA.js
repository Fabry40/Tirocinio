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
  
 return `Sei uno studente universitario che deve modellare un sistema software a partire da una traccia.  
Genera SOLO un oggetto JSON che descriva il modello UML delle classi, SENZA alcuna spiegazione, testo aggiuntivo o PlantUML.  

Il JSON deve avere questa struttura:

{
  "classes": [
    {
      "name": "NomeClasse",
      "attributes": [
        { "name": "nomeAttributo", "type": null }
      ],
      "methods": [ "nomeMetodo" ]
    }
  ],
  "relations": [
    {
      "from": "ClasseA",
      "to": "ClasseB",
      "type": "association|composition|inheritance|associationClass",
      "name": "nomeRuoloOpzionale", 
      "multiplicity": "molteplicità",
      "attributes": [ "nomeAttributoAssociationClass" ]
    }
  ],
  "enumerations": [
    {
      "name": "NomeEnum",
      "values": [ "VALORE1", "VALORE2" ]
    }
  ]
}

REGOLE FONDAMENTALI:
- Usa ESATTAMENTE i nomi dalla traccia (non rinominare mai).
- Identifica le gerarchie: se vengono descritti ruoli o sottotipi, sono sottoclassi di una classe generale.
- Per ogni classe, elenca TUTTI gli attributi e metodi menzionati nella traccia.

REGOLE PER LE RELAZIONI (PRIORITÀ MASSIMA):
- LEGGI ATTENTAMENTE ogni frase per identificare TUTTE le relazioni tra entità
- Per ogni relazione, specifica SEMPRE tutti i campi obbligatori:
  * "type": "association" (collegamento generico), "composition" (parte di un tutto), "inheritance" (gerarchia), "associationClass" (relazione con attributi)
  * "name": il nome/ruolo della relazione se presente nel testo
  * "multiplicity": la molteplicità esatta dalla traccia ("1 - 1", "1 - *", "* - *", "1..* - 1", etc.)
- Usa "associationClass" quando la relazione ha attributi propri
- NON omettere relazioni: ogni verbo di azione/collegamento indica una potenziale relazione
- Analizza frasi come "X gestisce Y", "X contiene Y", "X partecipa a Y", "X assegna a Y"

REGOLE AGGIUNTIVE:
- Mantieni le molteplicità esatte dalla traccia
- Se ci sono enum/stati, aggiungile in "enumerations"
- Non aggiungere elementi non esplicitamente menzionati nella traccia

TRACCIA:
"${traccia}"`;


    }

    static async runMeta(traccia) {
      const prompt = OpenRouterIA.generateUMLPrompt(traccia);
      // Meta LLaMA 4 (Maveric)
      return await OpenRouterIA.callOpenRouterModel('meta-llama/llama-4-maverick:free', prompt);
    }

    static async runDeepSeek(traccia) {
      const prompt = OpenRouterIA.generateUMLPrompt(traccia);
      // DeepSeek: R1 0528
      return await OpenRouterIA.callOpenRouterModel('deepseek/deepseek-chat-v3-0324:free', prompt);
    }

}

