# Comparatori UML

Sistema per confrontare modelli UML generati da LLM con modelli di riferimento. Utilizzato per le sperimentazioni della tesi sui diagrammi delle classi UML.


---

## Struttura del Progetto

```
Applicazione/
├── Back-end/                   # Codice sorgente principale
│   ├── config.js               # ⚙️ Configurazione esperimenti
│   ├── prompt.js               # 📝 Prompt per LLM (modificabile per RQ2)
│   ├── index.js                # 🚀 Entry point principale
│   ├── Logger.js               # 📊 Sistema di logging
│   ├── plantUML.js             # 📊 Generatore PlantUML
│   ├── LLM/                    # 🤖 Provider di intelligenza artificiale
│   │   ├── Gemini.js           #   → Integrazione Google Gemini
│   │   └── OpenRouterIA.js     #   → Integrazione OpenRouter (DeepSeek, Meta)
│   ├── RQ1/                    # 🔬 Componenti core per Research Question 1
│   │   ├── Traccia.js          #   → Elaborazione PDF delle tracce
│   │   ├── UmlAtteso.js        #   → Parser file XMI di riferimento
│   │   └── umlComparator.js    #   → Algoritmi di confronto UML
│   ├── RQ3/                    # 📋 Research Question 3 - Error Reporting
│   │   └── ErrorReporter.js    #   → Sistema di report errori
│   ├── RQ4/                    # 📊 Research Question 4 - Validation
│   │   └── Voto.js             #   → Sistema di valutazione e metriche
│   └── .env                    # 🔑 API Keys (da creare)
├── Traccia/                    # 📄 PDF delle tracce
├── UmlAtteso/                  # ✅ XMI di riferimento (docente)
├── Sperimentazioni/            # 👥 XMI degli studenti organizzati per traccia
│   ├── Autobus/               #   → Diagrammi studenti per traccia Autobus
│   ├── Fotografia/            #   → Diagrammi studenti per traccia Fotografia
│   └── ...                    #   → Altre tracce
├── risultati/                  # 📈 Log di output con timestamp
└── Prompt/                     # 📝 Versioni storiche dei prompt
    ├── PromptFinale.txt        #   → Prompt ottimizzato finale
    └── promptIntermedio.txt    #   → Versioni intermedie
```

---

## Quick Start

1. **Installa dipendenze**:
```bash
cd Back-end
npm install
```

2. **Configura API Keys** - Crea `.env`:
```env
GEMINI_API_KEY="la_tua_chiave_google_gemini"
openrouter_API_KEY="la_tua_chiave_openrouter"
```

3. **Ottieni le chiavi**:
   - **Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey) (gratuita)
   - **OpenRouter**: [OpenRouter.ai](https://openrouter.ai/) (a pagamento)

4. **Esegui**:
```bash
cd Back-end
npm start
# oppure
node index.js
```

---

## File di Configurazione Chiave

### 📄 Back-end/config.js - Controllo Esperimenti
```javascript
export const experiment = "main";      // "main" o "Voto"
export const aiProvider = "gemini";    // "deepSeek", "gemini", "meta"  
export const pdfFile = "ToDo.pdf";     // File in Traccia/
export const xmiFile = "ToDo.xmi";     // File in UmlAtteso/
export const logFile = "ToDo";         // Prefisso per risultati/
export const directoryCampioni = "../Sperimentazioni/Autobus"; // Solo per "Voto"
```

### 📄 Back-end/.env - API Keys
```env
GEMINI_API_KEY="la_tua_chiave_google_gemini"
openrouter_API_KEY="la_tua_chiave_openrouter"
```

### 📄 Back-end/prompt.js - Template LLM
Contiene il prompt ottimizzato che viene inviato agli LLM. Modificabile per RQ2.

---

## Flussi di Lavoro

### 🔄 Modalità "main" - Singolo Confronto
1. **Traccia** → `RQ1/Traccia.js` → estrae testo da `Traccia/{pdfFile}`
2. **LLM** → `LLM/{provider}.js` → genera modello UML dalla traccia  
3. **Riferimento** → `RQ1/UmlAtteso.js` → carica modello da `UmlAtteso/{xmiFile}`
4. **Confronto** → `RQ1/umlComparator.js` → calcola similarità strutturale
5. **Report** → `RQ3/ErrorReporter.js` → classifica errori
6. **Output** → `Logger.js` → salva tutto in `risultati/`

### 📊 Modalità "Voto" - Batch Analysis  
1. **Batch Studenti** → elabora tutti gli XMI in `directoryCampioni`
2. **Valutazione** → `RQ4/Voto.js` → calcola metriche per ogni studente
3. **Modello LLM** → genera modello AI dalla stessa traccia
4. **Confronto** → confronta performance studenti vs AI
5. **Statistiche** → media, migliore, peggiore performance

---

## Configurazione Esperimenti

### Parametri Principali (`Back-end/config.js`)

| Parametro | Valori | Descrizione |
|-----------|--------|-------------|
| `experiment` | `"main"`, `"Voto"` | Modalità: singolo confronto, batch studenti |
| `aiProvider` | `"deepSeek"`, `"gemini"`, `"meta"` | Modello LLM da utilizzare |
| `pdfFile` | `"Fotografia.pdf"` | Nome traccia in `Traccia/` |
| `xmiFile` | `"Fotografia.xmi"` | Nome modello atteso in `UmlAtteso/` |
| `logFile` | `"Fotografia"` | Prefisso file di output |
| `directoryCampioni` | `"../Sperimentazioni/Fotografia"` | Cartella XMI studenti (solo per "Voto") |
---

## Research Questions - Configurazioni Sperimentali

### RQ1: Confronto tra LLM
**Obiettivo**: Valutare come diversi modelli si comportano sulla stessa traccia  
**File coinvolti**: `Back-end/LLM/` (Gemini.js, OpenRouterIA.js), `Back-end/RQ1/`  
**Cosa cambia**: `aiProvider` (deepSeek → gemini → meta)  
**Cosa rimane fisso**: traccia, prompt, UML atteso

```javascript
// Test con DeepSeek
export const aiProvider = "deepSeek";
export const pdfFile = "Fotografia.pdf";
export const logFile = "RQ1_Fotografia_DeepSeek";

// Test con Gemini (cambia solo aiProvider)
export const aiProvider = "gemini";
export const pdfFile = "Fotografia.pdf";
export const logFile = "RQ1_Fotografia_Gemini";
```

### RQ2: Ottimizzazione Prompt
**Obiettivo**: Migliorare i risultati modificando solo il prompt  
**File coinvolti**: `Back-end/prompt.js`, `Prompt/` (versioni storiche)  
**Cosa cambia**: contenuto di `Back-end/prompt.js`  
**Cosa rimane fisso**: traccia, LLM, UML atteso (config.js deve rimanere invariato)

```javascript
export const aiProvider = "deepSeek";  // FISSO
export const pdfFile = "Fotografia.pdf";  // FISSO  
export const logFile = "RQ2_PromptV1";
// Modifica prompt.js tra un test e l'altro
// Salva versioni in Prompt/ per tracciare le modifiche
```

### RQ3: Riscrittura Traccia
**Obiettivo**: Migliorare chiarezza della traccia mantenendo la semantica  
**File coinvolti**: `Back-end/RQ3/ErrorReporter.js`, `Traccia/`  
**Cosa cambia**: file PDF della traccia  
**Cosa rimane fisso**: prompt ottimizzato (da `Prompt/PromptFinale.txt`), LLM, UML atteso

```javascript
// Traccia originale
export const pdfFile = "Fotografia.pdf";
export const logFile = "RQ3_TracciaOriginale";

// Traccia chiarificata
export const pdfFile = "Fotografia_Modificata.pdf";
export const logFile = "RQ3_TracciaModificata";
```

### RQ4: Validazione Metriche
**Obiettivo**: Confrontare metriche automatiche con valutazione tradizionale  
**File coinvolti**: `Back-end/RQ4/Voto.js`, `Sperimentazioni/`  
**Modalità batch**: analizza tutti gli XMI degli studenti + genera modello LLM

```javascript
export const experiment = "Voto";  // Modalità batch
export const directoryCampioni = "../Sperimentazioni/Fotografia";
export const logFile = "RQ4_StudentiVsAI";
```

---

## Descrizione dei Componenti per Cartella

### 📁 Back-end/LLM/ - Provider di Intelligenza Artificiale
- **Gemini.js**: Integrazione con Google Gemini API
- **OpenRouterIA.js**: Integrazione con OpenRouter per DeepSeek e Meta

### 📁 Back-end/RQ1/ - Core Components (Research Question 1)
- **Traccia.js**: Estrazione testo da file PDF delle tracce
- **UmlAtteso.js**: Parser e normalizzazione file XMI di riferimento
- **umlComparator.js**: Algoritmi di confronto strutturale tra modelli UML

### 📁 Back-end/RQ3/ - Error Analysis (Research Question 3)
- **ErrorReporter.js**: Sistema avanzato di classificazione e report errori

### 📁 Back-end/RQ4/ - Validation (Research Question 4)
- **Voto.js**: Metriche di valutazione e confronto batch studenti vs AI

### 📁 Prompt/ - Gestione Versioni Prompt
- **PromptFinale.txt**: Versione ottimizzata finale del prompt
- **promptIntermedio.txt**: Versioni di sviluppo e test

---

##  Come leggere e interpretare gli output

###  Posizione dei file di output
Tutti i risultati vengono salvati nella cartella `risultati/` con nomi che includono timestamp:
```
risultati/
├── Fotografia.txt_2025-08-26T16-49-28-396+02-00.txt    # Esperimento main
├── Fotografia_voto.txt_2025-08-26T17-15-32-123+02-00.txt # Esperimento Voto
└── RQ1_Fotografia_DeepSeek.txt_2025-08-26T18-00-15-456+02-00.txt
```

### Anatomia di un file di output (modalità "main")

#### **Sezione 1: Configurazione dell'esperimento**
```
IA UTILIZZATA: DEEPSEEK
esperimento : main
---------------------- Inizio del processo ----------------------
```
**Cosa significa**: Mostra quale AI è stata usata e quale tipo di esperimento.

#### **Sezione 2: Contenuto della traccia**
```
----------------------primo step stampo il Contenuto del PDF----------------------
Un hackathon, ovvero una "maratona di hacking", è un evento durante il quale...
📄 Contenuto PDF estratto!
```
**Cosa significa**: Il testo estratto dal PDF della traccia che è stato inviato all'AI.

#### **Sezione 3: Modello di riferimento (Docente)**
```
---------------------- secondo step stampo il Model JSON dell'XMI----------------------
{
  "classes": [
    {
      "name": "Hackathon",
      "attributes": [
        {"name": "sede", "type": null},
        {"name": "titolo", "type": null}
      ],
      "methods": []
    }
  ],
  "relations": [
    {"from": "Organizzatore", "to": "Hackathon", "type": "association", "multiplicity": "1-*"}
  ],
  "enumerations": []
}
```
**Cosa significa**: La rappresentazione JSON del modello UML atteso (quello del docente), estratto dal file XMI.

#### **Sezione 4: Risposta dell'AI**
```
---------------------- terzo step stampo il risultato della IA----------------------
{
  "classes": [
    {
      "name": "Hackathon",
      "attributes": [
        {"name": "titolo", "type": "String"},
        {"name": "sede", "type": "String"}
      ]
    }
  ],
  "relations": [],
  "enumerations": []
}
```
**Cosa significa**: Il modello JSON generato dall'AI a partire dalla traccia PDF.

#### **Sezione 5: Risultati del confronto**
```
---------------------- quinto step stampo il risultato del confronto tra i due modelli----------------------
Similarità totale: 0.706
Dettagli: {"classSimilarity":0.723,"attributeSimilarity":0.53,"methodSimilarity":0.625,"relationSimilarity":0.929}
Classi abbinate: [{"from":"Hackathon","to":"Hackathon","similarity":1}]
```

**Come interpretare i numeri**:
- **Similarità totale**: Punteggio finale da 0 a 1 (70.6% in questo esempio)
  - 0.0-0.3: Modello molto diverso
  - 0.3-0.6: Modello parzialmente corretto
  - 0.6-0.8: Modello buono con alcune lacune
  - 0.8-1.0: Modello molto simile al riferimento

- **Dettagli per componente**:
  - `classSimilarity`: Quanto sono simili le classi (nomi e struttura)
  - `attributeSimilarity`: Quanto sono simili gli attributi
  - `methodSimilarity`: Quanto sono simili i metodi
  - `relationSimilarity`: Quanto sono simili le relazioni tra classi

#### **Sezione 6: Analisi degli errori**
```
==================== REPORT ERRORI ====================
Similarità: 70.6% - Status: MEDIO
Errori attendibili: 12
Errori non attendibili: 23

🔴 ERRORI CRITICI (5):
1. Classe mancante: UtenteRegistrato (CRITICO)
2. Relazione mancante: Team -> Utente (CRITICO)

🟠 ERRORI IMPORTANTI (4):
3. Attributo mancante: Hackathon.numeroMassimoDiIscrizioni (IMPORTANTE)

🟡 ERRORI MINORI (3):
6. Differenza naming: teamId vs team_id (MINORE)
```

**Come interpretare**:
- **Errori CRITICI**: Mancano elementi fondamentali del dominio
- **Errori IMPORTANTI**: Mancano dettagli significativi ma non essenziali
- **Errori MINORI**: Differenze di stile o naming
- **Errori NON ATTENDIBILI**: Potrebbero essere falsi positivi

#### **Sezione 7: Differenze dettagliate**
```
---------------------- DIFFERENZE DETTAGLIATE ----------------------
Classi mancanti: ["UtenteRegistrato", "Giudice"]
Classi extra: ["Utente"]
Attributi mancanti: [{"classe":"Hackathon","attributo":"numeroMassimoDiIscrizioni"}]
Relazioni mancanti: [{"from":"Team","to":"Utente","type":"association"}]
```

**Uso pratico**: Queste liste ti dicono esattamente cosa è stato omesso o aggiunto dall'AI rispetto al modello atteso.

#### **Sezione 8: Codice PlantUML**
```
---------------------- GENERAZIONE PLANTUML ----------------------
--- PLANTUML MODELLO ATTESO ---
@startuml
class Hackathon {
  +sede: String
  +titolo: String
}
class Organizzatore
Organizzatore --> Hackathon
@enduml

--- PLANTUML MODELLO IA ---
@startuml
class Hackathon {
  +titolo: String
  +sede: String
}
@enduml
```

**Come usarlo**: Copia questi codici su [PlantUML Online](https://www.plantuml.com/plantuml/uml/) per visualizzare i diagrammi.

###  Anatomia di un file di output (modalità "Voto")

La modalità Voto produce output più lunghi perché analizza tutti i file degli studenti:

```
========== INIZIO ANALISI VOTO ==========
{modello studente in formato JSON}
Similarità voto (SimilaritaNumeroErrori): 3
Similarità voto (UMLComparator): 0.79


========== FILE ANALIZZATO: 5311.xmi ==========
{modello studente in formato JSON}
Similarità voto (SimilaritaNumeroErrori): 3
Similarità voto (UMLComparator): 0.79

========== FILE ANALIZZATO: 5321.xmi ==========
{altro modello studente}
Similarità voto (SimilaritaNumeroErrori): 5
Similarità voto (UMLComparator): 0.45

...

Media Similarità voto (SimilaritaNumeroErrori): 3.2
Media Similarità voto (UMLComparator): 0.67

========== MODELLO IA GENERATO ==========
{modello generato dall'AI}
Similarità voto IA (SimilaritaNumeroErrori): 2
Similarità voto IA (UMLComparator): 0.83
```

il primo modello è sempre l'UML atteso

### 8.4 Metriche: cosa significano i numeri

#### **UMLComparator (0.0 - 1.0)**
- Misura la **similarità strutturale complessiva**
- Formula: 40% classi + 20% attributi + 20% metodi + 20% relazioni
- **Esempio**: 0.706 = 70.6% di similarità

#### **SimilaritaNumeroErrori (0 - 7)**
- Conta il **numero di categorie di errore** presenti
- **Categorie**: Classi, Attributi, Associazioni, Molteplicità, Enumerazioni, Generalizzazioni, Attributo id
- **Esempio**: 3 = errori in 3 categorie su 7

**Relazione tra le metriche**:
- **UMLComparator alto + SimilaritaNumeroErrori basso**: Modello molto buono
- **UMLComparator basso + SimilaritaNumeroErrori alto**: Modello con molti problemi
- **UMLComparator alto + SimilaritaNumeroErrori alto**: Struttura buona ma omissioni localizzate
- **UMLComparator basso + SimilaritaNumeroErrori basso**: Errori diffusi ma non categoriali

---

## Interpretazione dei Risultati

### File di Output (`risultati/`)
I log vengono salvati con timestamp, esempio: `Fotografia.txt_2025-08-26T16-49-28-396+02-00.txt`

- **Errori attendibili vs non attendibili**: Distinzione tra errori reali e possibili falsi positivi

### Sezioni Importanti nei Log
1. **Contenuto PDF**: Testo estratto dalla traccia
2. **Modello atteso**: JSON del docente (da XMI)
3. **Modello generato**: JSON dell'AI
4. **Confronto dettagliato**: Classi/attributi/relazioni mancanti/extra
5. **PlantUML**: Codice per visualizzare i diagrammi

### Comandi Utili per Analisi
```bash
# Estrai tutte le similarità
grep "Similarità totale:" risultati/*.txt

# Conta errori per categoria  
grep "SimilaritaNumeroErrori" risultati/*_voto.txt

# Trova classi mancanti comuni
grep "Classi mancanti:" risultati/RQ1_*.txt
```

---

## Casi di Studio Disponibili

Il sistema include 5 tracce di complessità crescente:

| Traccia | Complessità | Descrizione | Risultati Tipici (Gemini) |
|---------|-------------|-------------|---------------------------|
| **ToDo.pdf** | Bassa | Gestione semplice attività | ~0.90 similarità |
| **Fotografia.pdf** | Media | Album fotografici con utenti | ~0.85 similarità |
| **Hackathon.pdf** | Media-Alta | Team, partecipanti, giudici | ~0.75 similarità |
| **Aeroporto.pdf** | Alta | Voli, passeggeri, equipaggi | ~0.60 similarità |
| **Autobus.pdf** | Validazione | Confronto con studenti | Media studenti: 0.78 |

**Come aggiungere nuove tracce**:
1. Aggiungi `NuovaTraccia.pdf` in `Traccia/`
2. Aggiungi `NuovaTraccia.xmi` in `UmlAtteso/`
3. (Opzionale) Crea `Sperimentazioni/NuovaTraccia/` con XMI degli studenti

---
## Metriche di Valutazione SPOSTARE
- **UMLComparator**: similarità strutturale (0.0-1.0) - 40% classi + 20% attributi + 20% metodi + 20% relazioni
- **SimilaritaNumeroErrori**: conteggio categorie di errore (0-7) - Classi, Attributi, Associazioni, Molteplicità, Enumerazioni, Generalizzazioni, Attributi ID


## Troubleshooting & FAQ

### Problemi Comuni

| Problema | Causa | File Coinvolto | Soluzione |
|----------|-------|----------------|-----------|
| **Similarità = 0** | Nessuna classe matchata | `RQ1/umlComparator.js` | Verifica percorsi PDF/XMI, controlla nomi classi |
| **Errore API** | Chiave mancante/invalida | `LLM/*.js`, `.env` | Controlla `.env`, verifica quota API |
| **Log vuoto (modalità Voto)** | Cartella studenti vuota | `RQ4/Voto.js` | Verifica `directoryCampioni` e presenza file .xmi |
| **JSON malformato** | Risposta AI corrotta | `LLM/*.js` | Riprova, il sistema ha fallback automatici |
| **Timeout** | Rate limiting API | `LLM/*.js` | Aspetta qualche minuto e riprova |
| **Percorso non trovato** | Struttura cartelle errata | `config.js` | Verifica percorsi relativi corretti |

### Struttura Cartelle per Debug
```bash
# Verifica struttura corretta
ls -la Back-end/LLM/          # Deve contenere Gemini.js, OpenRouterIA.js
ls -la Back-end/RQ1/          # Deve contenere Traccia.js, UmlAtteso.js, umlComparator.js  
ls -la Back-end/RQ3/          # Deve contenere ErrorReporter.js
ls -la Back-end/RQ4/          # Deve contenere Voto.js
ls -la Traccia/               # Deve contenere i PDF
ls -la UmlAtteso/             # Deve contenere gli XMI di riferimento
ls -la Sperimentazioni/       # Deve contenere cartelle per traccia con XMI studenti
```

### FAQ

**Q: Quale LLM funziona meglio?**  
A: Gemini > DeepSeek > Meta (ma dipende dalla traccia)

**Q: Come interpreto "Errori non attendibili"?**  
A: Sono possibili falsi positivi, concentrati sugli "Errori attendibili"

**Q: Posso modificare le soglie delle metriche?**  
A: Sì, nei file `umlComparator.js` e `Voto.js`

**Q: Come visualizzo i diagrammi?**  
A: Copia il codice PlantUML dai log su [plantuml.com](https://www.plantuml.com/plantuml/uml/)

**Q: Dove trovo il codice per una specifica Research Question?**  
A: RQ1→`Back-end/RQ1/`, RQ2→`Back-end/prompt.js`, RQ3→`Back-end/RQ3/`, RQ4→`Back-end/RQ4/`

**Q: Come aggiungo un nuovo provider LLM?**  
A: Crea un nuovo file in `Back-end/LLM/` seguendo il pattern di `Gemini.js`

**Q: Dove modifico i criteri di valutazione?**  
A: Metriche in `RQ1/umlComparator.js` e `RQ4/Voto.js`, classificazione errori in `RQ3/ErrorReporter.js`

---

## Sviluppo e Manutenzione

### 🏗️ Aggiungere una nuova Research Question
1. Crea cartella `Back-end/RQ{N}/`
2. Implementa la logica specifica
3. Integra in `index.js` 
4. Aggiorna `config.js` se necessario

### 🤖 Aggiungere un nuovo LLM Provider
1. Crea `Back-end/LLM/NuovoProvider.js`
2. Implementa metodi standard (`runModel`, gestione errori)
3. Aggiungi switch case in `index.js`
4. Aggiorna `config.js` con nuovo provider

### 📊 Modificare le Metriche
- **Similarità strutturale**: modifica `RQ1/umlComparator.js`
- **Conteggio errori**: modifica `RQ4/Voto.js`  
- **Classificazione errori**: modifica `RQ3/ErrorReporter.js`

---

---

## Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| Similarità = 0 | Verificare percorsi PDF/XMI |
| Errore API | Controllare chiavi in `.env` |
| Log vuoto | Verificare `directoryCampioni` |
