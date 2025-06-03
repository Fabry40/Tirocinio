# UML Comparator - JS

Questo progetto confronta un modello UML atteso (in formato `.xmi`) con un modello UML generato automaticamente da un'IA, a partire da una traccia in PDF. Il sistema calcola la similarità tra i due modelli e genera un report dettagliato.

## 🚀 Requisiti

- [Node.js](https://nodejs.org/) (versione 16 o superiore)
- [npm](https://www.npmjs.com/)

## ⚙️ Installazione

1. Clona il repository:

   ```bash
   git clone https://github.com/tuo-utente/uml-comparator.git
   cd uml-comparator/Back-end
1.Installa le dipendenze:
npm install

2.Crea il file .env nella cartella Back-end con il seguente contenuto (sostituisci le chiavi con quelle reali):
GEMINI_API_KEY="la_tua_chiave_gemini"
openrouter_API_KEY="la_tua_chiave_openrouter"


3. creare le seguenti cartelle nella cartella Back-end.
Back-end/
├── Traccia/         # Contiene i file PDF delle tracce
└── UmlAtteso/       # Contiene i file XMI dei modelli UML attesi

Configurazione
Nel file index.js, modifica le seguenti costanti (riga 10–12) per selezionare i file da confrontare:

const PDF_FILE = 'esempio.pdf';
const XMI_FILE = 'esempio.xmi';
const NAME_FILE = 'esempio';

Scegli l’IA da utilizzare (riga 24–26), mantenendo attiva solo una delle seguenti righe e commentando le altre:

let risultato = await OpenRouterIA.runMeta(contenuto);
let risultato = await OpenRouterIA.runDeepSeek(contenuto);
let  risultato = await GeminiAPI.getGeminiResponse(contenuto);
⚠️ Il programma utilizza solo l'ultima IA attiva. Non è progettato per gestire più risultati contemporaneamente.

Avvia il programma:
npm start

Output
Il file di log con i risultati verrà salvato nella cartella Back-end. Il nome del file sarà del tipo:
esempio_<data>.txt
