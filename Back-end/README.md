# UML Comparator - JS

Questo progetto confronta un modello UML atteso (in formato `.xmi`) con un modello UML generato automaticamente da un'IA, a partire da una traccia in PDF. Il sistema calcola la similarità tra i due modelli e genera un report dettagliato.

## 🚀 Requisiti

- [Node.js](https://nodejs.org/) (versione 16 o superiore)
- npm

## ⚙️ Installazione

1. **Installa le dipendenze:**
   ```bash
   npm install
   ```

2. **Crea il file `.env`** nella cartella `Back-end` con il seguente contenuto (sostituisci le chiavi con quelle reali):
   ```
   GEMINI_API_KEY="la_tua_chiave_gemini"
   openrouter_API_KEY="la_tua_chiave_openrouter"
   ```

3. **Crea le seguenti cartelle** nella cartella `Back-end`:
   ```
   Back-end/
   ├── Traccia/      # Contiene i file PDF delle tracce
   └── UmlAtteso/    # Contiene i file XMI dei modelli UML attesi
   ```

## 🛠️ Configurazione

- Nel file `index.js`, modifica le seguenti costanti (riga 10–12) per selezionare i file da confrontare e indicare il file Log:
  ```js
  const PDF_FILE = 'esempio.pdf'; //Nome del file PDF da analizzare
  const XMI_FILE = 'esempio.xmi'; //Nome del file XMI atteso
  const NAME_FILE = 'esempio'; // Nome del file di log
  ```

- Scegli l’IA da utilizzare (riga 24–26), mantenendo attiva solo una delle seguenti righe e commentando le altre:
  ```js
  let risultato = await OpenRouterIA.runMeta(contenuto);
  let risultato = await OpenRouterIA.runDeepSeek(contenuto);
  let risultato = await GeminiAPI.getGeminiResponse(contenuto);
  ```
  ⚠️ Il programma utilizza solo l'ultima IA attiva. Non è progettato per gestire più risultati contemporaneamente.

## ▶️ Avvio

Avvia il programma:
```bash
npm start
```

## 📄 Output

Il file di log con i risultati verrà salvato nella cartella `Back-end`. Il nome del file sarà del tipo:
```
esempio_<data>.txt
```
