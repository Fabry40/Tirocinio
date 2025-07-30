# UML Comparator - JS

Questo progetto confronta modelli UML con configurazione flessibile tramite file `Config.js`.

## 🚀 Requisiti

- [Node.js](https://nodejs.org/) (versione 16 o superiore)
- npm

## ⚙️ Installazione

1. **Installa le dipendenze:**
   ```bash
   npm install
   ```

2. **Crea il file `.env`** nella cartella `Back-end`:
   ```
   GEMINI_API_KEY="la_tua_chiave_gemini"
   openrouter_API_KEY="la_tua_chiave_openrouter"
   ```

3. **Crea le cartelle necessarie** nella cartella `Back-end`:
   ```
   Back-end/
   Traccia/      # File PDF delle tracce
   UmlAtteso/    # File XMI di riferimento (docente)      
   risultati/    # Cartella per i file log di output
   Sperimentazioni  # File XMI degli studenti 
   ```

## 🛠️ Configurazione

**Modifica il file `Config.js`** per scegliere:

### Esempi di configurazione per replicare sperimentazioni:

#### **Esperimento "main" - Confronto XMI atteso con XMI con IA:** esperimento RQ1 
```javascript
export const experiment = "main";
export const aiProvider = "deepSeek";  // "deepSeek", "meta", "gemini"
export const pdfFile = "Fotografia.pdf";
export const xmiFile = "Fotografia.xmi";
export const logFile = "Fotografia";
export const directoryCampioni = "";//non serve
```

#### **Esperimento "main" - Confronto XMI atteso con XMI con IA cambiano il promt:** esperimento RQ2 e RQ3
```javascript
export const experiment = "main";
export const aiProvider = "deepSeek";  
export const pdfFile = "Fotografia.pdf";
export const xmiFile = "Fotografia.xmi";
export const logFile = "Fotografia";
export const directoryCampioni = "";//non serve
```
#### modifica anche il file prompt.js per cambiare il prompt

#### **Esperimento "Voto" - Valutazione multipla anche IA rsipetto XMIAtteso:** esperimento RQ4
```javascript
export const experiment = "Voto";
export const aiProvider = "gemini"; // "deepSeek", "meta", "gemini"
export const pdfFile = "Fotografia.pdf";
export const xmiFile = "Fotografia.xmi";
export const logFile = "Fotografia_voto";
export const directoryCampioni = "./Album";
```

## ▶️ Avvio

```bash
npm start
```

## 📋 Replicazione delle sperimentazioni

### Per replicare una sperimentazione esistente:
1. Modifica `Config.js` con i parametri desiderati
2. Assicurati che i file PDF/XMI esistano nelle cartelle corrette
3. Avvia con `npm start`
4. I risultati saranno nel file di log specificato

### Per aggiungere una nuova sperimentazione:
1. Aggiungi i file PDF e XMI nelle cartelle appropriate
2. Modifica `Config.js` con i nuovi nomi dei file
3. Scegli l'esperimento (`"main"` o `"Voto"`) e l'IA
4. Avvia il programma

### Parametri di configurazione:

| Parametro | Descrizione | Valori |
|-----------|-------------|---------|
| `experiment` | Tipo di sperimentazione | `"main"`, `"Voto"` |
| `aiProvider` | IA da utilizzare | `"deepSeek"`, `"meta"`, `"gemini"` |
| `pdfFile` | File PDF della traccia | Nome file in `Traccia/` |
| `xmiFile` | File XMI di riferimento | Nome file in `UmlAtteso/` |
| `logFile` | Nome base del log | Stringa senza estensione |
| `directoryCampioni` | Cartella file studenti | Percorso cartella |

## 📄 Output

I file di log vengono salvati nella cartella `risultati` con formato:
- Esperimento "main": `nomeFile.txt`  
- Esperimento "Voto": `nomeFile_voto.txt`

**✨ Non serve più modificare il codice: tutto è configurabile tramite `Config.js`!**

## 📊 Dati raw delle sperimentazioni

I dati raw delle sperimentazioni sono disponibili nelle cartelle:
- [`Sperimentazioni/Fotografia`](Sperimentazioni/Fotografia): file XMI prodotti dagli studenti (esperimento "Voto")
- [`Sperimentazioni/Autobus`](Sperimentazioni/Autobus): file XMI di un altro set di sperimentazione
- [`/risultati`](/risultati): file di log generati dagli esperimenti

### Come leggere i dati

- I file `.xmi` sono in formato XML/XMI e possono essere aperti con un editor di testo, strumenti UML o analizzati tramite script.

