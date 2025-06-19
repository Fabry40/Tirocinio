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

      //console.log(`💬 Risposta da ${modelName}:\n`, response.data.choices[0].message.content);
      return response.data.choices[0].message.content;
    } catch (error) {
      //console.error(`❌ Errore con ${modelName}:`, error.response?.data || error.message);
      return null;
    }
  }

  static generateUMLPrompt(traccia) {
  
      return `Sei uno studente che deve creare un modello UML delle classi a partire da una traccia fornita da un docente.
L'obiettivo è interpretare la traccia in modo semplice, diretto e neutro.

Rappresenta:
- tutte le classi e i loro attributi principali, con tipo e chiavi primarie se deducibili;
- eventuali enumerazioni;
- tutte le relazioni tra le classi, prestando particolare attenzione alle associazioni:

REGOLE PER LE CLASSI:
1. Identifica OGNI sostantivo o concetto principale nella traccia come potenziale classe
2. Usa nomi singolari e in PascalCase (es: "Utente", "Prodotto", "OrdineAcquisto")
3. Se nella traccia vengono menzionate entità simili, valuta se sono classi separate o una sola classe
4. Includi classi di supporto se logicamente necessarie (es: se c'è "ordine" e "prodotto", considera "DettaglioOrdine")
5. Non creare classi per semplici attributi (es: non creare classe "Nome" se è solo un attributo)


REGOLE PER LE ASSOCIAZIONI:
1. Se due classi sono collegate da un verbo o da una frase che indica una relazione, crea sempre un'associazione
2. Identifica con precisione la direzione della relazione (chi "ha" chi, chi "usa" chi, chi "gestisce" chi)
3. Dedotti la molteplicità dal contesto della traccia:
   - Parole come "uno", "alcuni", "molti", "tutti" indicano molteplicità specifica
   - Se non specificato, ragiona logicamente (es: un cliente può avere molti ordini = 1 a *)
4. Se la relazione ha attributi propri (date, quantità, etc.), usa associationClass
5. Usa composition solo quando una classe non può esistere senza l'altra
6. Usa inheritance solo quando c'è esplicita gerarchia (è un tipo di...)

Per ogni associazione specifica:
- il nome della relazione (verbo o frase descrittiva dalla traccia)
- la molteplicità esatta per entrambi i lati
- la direzionalità (navigabilità) quando è chiara dal contesto
- eventuali nomi dei ruoli quando sono menzionati nella traccia

Evita modelli avanzati, come classi astratte, controller, state machine o normalizzazioni eccessive.
Interpreta ciò che è scritto nella traccia in modo il più possibile diretto e scolastico.

La traccia è la seguente:
"${traccia}"

GENERA SOLO questo JSON (senza testo aggiuntivo):

{
  "classes": [
    {
      "name": "NomeEsatto",
      "attributes": [
        { "name": "nomeEsatto", "type": null }
      ],
      "methods": [ "nomeMetodoEsatto" ]
    }
  ],
  "relations": [
    {
      "from": "ClasseOrigine",
      "to": "ClasseDestinazione",
      "type": "association|composition|inheritance|associationClass",
      "name": "nomeRelazione",
      "multiplicity": "molteplicità_origine",
      "multiplicityTarget": "molteplicità_destinazione",
      "direction": "bidirectional|unidirectional",
      "role": "nomeRuolo",
      "attributes": [ "attributiAssociationClass" ]
    }
  ],
  "enumerations": [
    {
      "name": "NomeEnum",
      "values": [ "VALORE1", "VALORE2" ]
    }
  ]
}

`;

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

