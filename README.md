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
- Nel file `index.js`, Scegli quale processo avviare(riga:180-181):
  ```js
    Voto();//Calcola la similarita sia su file campione sia su IA
    main();//permette di eseguire il calsolo di similarita con l'algoritmo Nikiforova 
  ```
  - Nel file `index.js` modifica le seguenti costanti riga 14 per indicare il file Log:
  ```js
  const NAME_FILE = 'esempio'; // Nome del file di log
  ```
- Nel file `index.js`, quando si seleziona il metodo Main(), modifica le seguenti costanti riga 12–13 per selezionare i file da confrontare :
  ```js
  const PDF_FILE = 'esempio.pdf'; //Nome del file PDF da analizzare
  const XMI_FILE = 'esempio.xmi'; //Nome del file XMI atteso
  ```
  - Nel file `index.js`, quando si seleziona il metodo Voto(), modifica le seguenti costanti (riga 12–14) per selezionare i file da confrontare:
  ```js
   const DIRECTORY_ATTESO = './UmlAtteso';//DIRECTORY dove prendere l'UMLatteso 
   const DIRECTORY_CAMPIONI = './Album';//DIRECTORY dove prendere i campioni da testare
   const FILE_ESTENSIONE = '.xmi';// estensione dei file
   const XMI_FILE_Traccia_Prof = 'Fotografia.xmi'; //Nome del file XMI atteso
   const PDF_FILE_Traccia_Prof = 'Fotografia.pdf'; //Nome del file PDF da analizzare
  ```

- Scegli l’IA da utilizzare (per main() riga 24–26 e per voto() riga 140-141), mantenendo attiva solo una delle seguenti righe e commentando le altre:
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
esempio<data>.txt
```
