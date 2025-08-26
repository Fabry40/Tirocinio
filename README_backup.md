# UML Comparator - Sistema di Valutazione UML

Sistema per confrontare modelli UML generati da LLM con modelli di riferimento usando due metriche:
- **UMLComparator**: similarità strutturale (0.0-1.0)
- **SimilaritaNumeroErrori**: categorie di errore (0-7)

---

## Installazione

```bash
cd Back-end
npm install
```

Crea `.env` con le tue API keys:
```env
GEMINI_API_KEY="la_tua_chiave_google_gemini"
openrouter_API_KEY="la_tua_chiave_openrouter"
```

**API Keys**:
- **Gemini**: [Google AI Studio](https://makersuite.google.com/app/apikey)
- **OpenRouter**: [OpenRouter.ai](https://openrouter.ai/)

---

## Configurazione (`Back-end/config.js`)

```javascript
export const experiment = "main";        // "main" o "Voto"
export const aiProvider = "deepSeek";    // "deepSeek", "gemini", "meta"
export const pdfFile = "Fotografia.pdf"; // Nome file in Traccia/
export const xmiFile = "Fotografia.xmi"; // Nome file in UmlAtteso/
export const logFile = "Fotografia";     // Prefisso log
export const directoryCampioni = "../Sperimentazioni/Fotografia"; // Solo per "Voto"
```

---

## Esecuzione

```bash
npm start
```

I risultati vengono salvati in `risultati/` con timestamp.

---

## Research Questions - Configurazioni

### RQ1: Confronto LLM
**Cosa cambia**: `aiProvider` (deepSeek → gemini → meta)  
**Cosa rimane fisso**: traccia, prompt, UML atteso

```javascript
export const aiProvider = "deepSeek";  // Cambia questo
export const pdfFile = "Fotografia.pdf";
export const logFile = "RQ1_Fotografia_DeepSeek";
```

### RQ2: Ottimizzazione Prompt
**Cosa cambia**: contenuto di `prompt.js`  
**Cosa rimane fisso**: traccia, LLM, UML atteso

```javascript
export const aiProvider = "deepSeek";  // FISSO
export const pdfFile = "Fotografia.pdf";  // FISSO
export const logFile = "RQ2_PromptV1";
```

### RQ3: Riscrittura Traccia
**Cosa cambia**: file PDF della traccia  
**Cosa rimane fisso**: prompt ottimizzato (da RQ2), LLM, UML atteso

```javascript
export const pdfFile = "Fotografia_clarified.pdf";  // Traccia chiarificata
export const logFile = "RQ3_TracciaChiarificata";
```

### RQ4: Validazione Metriche
**Modalità batch**: confronta studenti vs LLM

```javascript
export const experiment = "Voto";
export const directoryCampioni = "../Sperimentazioni/Fotografia";
export const logFile = "RQ4_StudentiVsAI";
```

---

## Interpretazione Output

### File di log (`risultati/`)
- **Similarità totale**: punteggio UMLComparator (0.0-1.0)
- **Errori attendibili**: numero errori affidabili
- **Classi/Attributi/Relazioni mancanti**: liste dettagliate

### Esempi di estrazione dati
```bash
# Similarità totale
grep "Similarità totale:" risultati/Fotografia.txt_*

# Errori per categoria
grep "SimilaritaNumeroErrori" risultati/*_voto.txt_*
```

---

## Struttura Files

```
Applicazione/
├── Back-end/           # Codice sorgente
├── Traccia/           # PDF tracce
├── UmlAtteso/         # XMI di riferimento
├── Sperimentazioni/   # XMI studenti
└── risultati/         # Output log
```

---

## Troubleshooting

| Problema | Soluzione |
|----------|-----------|
| Similarità = 0 | Verificare percorsi PDF/XMI |
| Errore API | Controllare chiavi in `.env` |
| Log vuoto | Verificare `directoryCampioni` |

---
## 5. Esempi di configurazione per replicare sperimentazioni

### **Esperimento "main" - Confronto XMI atteso con XMI generato da IA (RQ1)**
```javascript
export const experiment = "main";
export const aiProvider = "deepSeek";  // "deepSeek", "meta", "gemini"
export const pdfFile = "Fotografia.pdf";
export const xmiFile = "Fotografia.xmi";
export const logFile = "Fotografia";
export const directoryCampioni = ""; // Non serve
```

### **Esperimento "main" - Variazione prompt (RQ2)**
```javascript
export const experiment = "main";
export const aiProvider = "deepSeek";  // FISSO per RQ2
export const pdfFile = "Fotografia.pdf";  // FISSO per RQ2
export const xmiFile = "Fotografia.xmi";  // FISSO per RQ2
export const logFile = "RQ2_PromptBaseline";
export const directoryCampioni = ""; // Non serve
```
**Per RQ2**: Modifica SOLO il file `prompt.js`, mantieni tutto il resto uguale.

### **Esperimento "main" - Variazione traccia (RQ3)**
```javascript
export const experiment = "main";
export const aiProvider = "deepSeek";  // FISSO per RQ3 (stesso di RQ2)
export const pdfFile = "Fotografia_clarified.pdf";  // VARIABILE per RQ3
export const xmiFile = "Fotografia.xmi";  // FISSO per RQ3
export const logFile = "RQ3_TracciaChiarificata";
export const directoryCampioni = ""; // Non serve
```
**Per RQ3**: Usa il prompt ottimizzato da RQ2, cambia SOLO il PDF della traccia.

### **Esperimento "Voto" - Valutazione multipla studenti + IA (RQ4)**
```javascript
export const experiment = "Voto";
export const aiProvider = "gemini"; // "deepSeek", "meta", "gemini"
export const pdfFile = "Fotografia.pdf";
export const xmiFile = "Fotografia.xmi";
export const logFile = "Fotografia_voto";
export const directoryCampioni = "../Sperimentazioni/Fotografia";
```

**Note per l'esperimento "Voto"**:
- Assicurati che la cartella `Sperimentazioni/Fotografia/` contenga i file XMI degli studenti
- Il sistema analizzerà automaticamente tutti i file .xmi nella cartella
- Genererà anche un modello IA per confronto

---
## 6. Mappatura delle Research Questions

Definizioni ufficiali (come in tesi):
* RQ1: I Large Language Models (LLM) sono in grado di generare un diagramma UML valido e coerente a partire dalla stessa traccia, al variare del modello utilizzato?
* RQ2: È possibile migliorare la similarità tra il diagramma atteso e quello generato modificando la formulazione del prompt fornito all’LLM?
* RQ3: È possibile migliorare la similarità modificando la traccia stessa, mantenendone invariata la semantica ma riducendo ambiguità linguistiche?
* RQ4: La similarità è una metrica valida per valutare la vicinanza di una soluzione a quella richiesta?

| RQ | Focus operativo nel repo | Configurazione base | Comparazioni chiave |
|----|--------------------------|---------------------|----------------------|
| RQ1 | Confronto tra diversi LLM sulla stessa traccia | experiment="main"; fissare `pdfFile`/`xmiFile`; variare `aiProvider` | Serie di run provider (gemini/meta/deepSeek) con stesso prompt |
| RQ2 | Effetto della riformulazione del prompt | experiment="main"; fissare `aiProvider` | Prompt baseline vs varianti incrementali |
| RQ3 | Effetto della riscrittura della traccia (disambiguazione) | experiment="main"; fissare provider & prompt | Traccia originale vs versione chiarificata (es. `Fotografia_clarified.pdf`) |
| RQ4 | Validità della metrica di similarità | Set di log (LLM + studenti) | Correlazione con giudizio manuale / conteggio categorie |

---
## 6. Metodologia Sperimentale e Research Questions

### 6.1 Casi di Studio Utilizzati

Sono stati selezionati **5 casi di studio** di complessità crescente per valutare le capacità degli LLM:

1. **Sistema ToDo List** (Bassa Complessità)
   - Gestione semplice di attività con funzionalità base
   - **Risultati medi**: Gemini 0.92, Meta LLaMA 0.88, DeepSeek 0.85

2. **Sistema Fotografico** (Media Complessità) 
   - Gestione album fotografici con utenti e luoghi
   - Traccia utilizzata per esempi comparativi tra LLM

3. **Gestione Hackathon** (Media-Alta Complessità)
   - Sistema con team, partecipanti, giudici e valutazioni
   - **Risultati medi**: Gemini 0.78, Meta LLaMA 0.65, DeepSeek 0.60

4. **Sistema Aeroportuale** (Alta Complessità)
   - Gestione voli, passeggeri, equipaggi con relazioni complesse
   - **Risultati medi**: Gemini 0.61, Meta LLaMA 0.48, DeepSeek 0.45

5. **Sistema Autobus** (Validazione con studenti)
   - Utilizzato per confronto LLM vs studenti in modalità "Voto"

### 6.2 RQ1: Confronto tra LLM

**Obiettivo**: Valutare come diversi modelli LLM si comportano sulla stessa traccia.

I risultati della tesi hanno mostrato che **Google Gemini** generalmente supera **DeepSeek** e **Meta LLaMA**(potrebbe non essere disponibile) nella generazione di diagrammi UML, ma le differenze possono variare a seconda della complessità della traccia.

**Configurazione per RQ1**:
```javascript
export const experiment = "main";
export const aiProvider = "deepSeek";  // Cambia questo per testare diversi LLM
export const pdfFile = "Fotografia.pdf";
export const xmiFile = "Fotografia.xmi";
export const logFile = "RQ1_Fotografia_DeepSeek";
export const directoryCampioni = ""; // Non serve per esperimento "main"
```

**Come replicare l'esperimento**:
1. Configura come sopra con `aiProvider = "deepSeek"`
2. Esegui `npm start` 
3. Cambia `aiProvider = "gemini"` e `logFile = "RQ1_Fotografia_Gemini"`
4. Esegui di nuovo
5. Confronta i punteggi di similarità nei file di log

**Per aggiungere una nuova traccia**:
1. Aggiungi il PDF in `Traccia/NuovaTraccia.pdf`
2. Aggiungi il modello atteso in `UmlAtteso/NuovaTraccia.xmi`
3. Aggiorna la configurazione:
   ```javascript
   export const pdfFile = "NuovaTraccia.pdf";
   export const xmiFile = "NuovaTraccia.xmi";
   export const logFile = "RQ1_NuovaTraccia_DeepSeek";
   ```

### 6.3 RQ2: Impatto del Prompt (Seconda Sperimentazione)

**Research Question**: Come migliorare la similarità cambiando i prompt?

**Schema sperimentale**:
- **FISSO**: 
  - Traccia informale (es. `Fotografia.pdf`)
  - LLM (`deepSeek` o `gemini`)
  - UML atteso (`Fotografia.xmi`)
- **VARIABILE**: Prompt (`Back-end/prompt.js`)
- **METRICA**: Similarità UMLComparator

**Configurazione base**:
```javascript
export const experiment = "main";
export const aiProvider = "deepSeek";  // FISSO per questa RQ
export const pdfFile = "Fotografia.pdf";  // FISSO per questa RQ
export const xmiFile = "Fotografia.xmi";  // FISSO per questa RQ
export const logFile = "RQ2_PromptBaseline";
export const directoryCampioni = "";
```

**Risultati dell'evoluzione del prompt**:
- Prompt Base: 0.76 similarità
- Few-shot: 0.83 (+0.07)
- Chain-of-Thought: 0.85 (+0.09)
- **Prompt Ottimizzato**: 0.87 (+0.11)

**Prompt finale ottimizzato** (estratto dal file `prompt.js`):
```
Sei uno studente che deve creare un modello UML delle classi a partire da una traccia fornita da un docente.
L'obiettivo è interpretare la traccia in modo semplice, diretto e neutro.

REGOLE PER LE CLASSI:
1. Identifica OGNI sostantivo o concetto principale nella traccia come potenziale classe
2. Usa nomi singolari e in PascalCase (es: "Utente", "Prodotto")
...
GENERA SOLO questo JSON (senza testo aggiuntivo):
{
  "classes": [...],
  "relations": [...],
  "enumerations": [...]
}
```

**Come replicare RQ2**:
1. Configura con prompt baseline in `Back-end/prompt.js`
2. Esegui con `logFile = "RQ2_PromptV1"`
3. **CAMBIA SOLO IL PROMPT** in `prompt.js` (mantieni tutto il resto uguale)
4. Ri-esegui con `logFile = "RQ2_PromptV2"`
5. Confronta i miglioramenti nei file di log

**Risposta trovata**: Ho trovato dei prompt che riescono a dare una soluzione più corretta.

### 6.4 RQ3: Riformulazione della Traccia (Terza Sperimentazione)

**Research Question**: Come migliorare la similarità cambiando la traccia?

**Schema sperimentale**:
- **FISSO**: 
  - Prompt (`Back-end/prompt.js` - usa quello ottimizzato da RQ2)
  - LLM (`deepSeek` o `gemini`)
  - UML atteso (`Fotografia.xmi`)
- **VARIABILE**: Traccia (PDF originale vs chiarificato)
- **METRICA**: Similarità UMLComparator

**Configurazione per traccia originale**:
```javascript
export const experiment = "main";
export const aiProvider = "deepSeek";  // FISSO per questa RQ
export const pdfFile = "Fotografia.pdf";  // VARIABILE (originale)
export const xmiFile = "Fotografia.xmi";  // FISSO per questa RQ
export const logFile = "RQ3_TracciaOriginale";
export const directoryCampioni = "";
```

**Configurazione per traccia chiarificata**:
```javascript
export const experiment = "main";
export const aiProvider = "deepSeek";  // FISSO (stesso di sopra)
export const pdfFile = "Fotografia_clarified.pdf";  // VARIABILE (chiarificata)
export const xmiFile = "Fotografia.xmi";  // FISSO (stesso di sopra)
export const logFile = "RQ3_TracciaChiarificata";
export const directoryCampioni = "";
```

**Risultati**:
- Traccia Originale: 0.76 similarità
- Traccia Esplicita: 0.85 (+0.09)
- Traccia Semplificata: 0.87 (+0.11)

**Configurazione combinata** (Prompt ottimizzato da RQ2 + Traccia chiarificata):
- **Risultato finale**: 0.91 similarità (+0.15 rispetto al baseline)

**Come replicare RQ3**:
1. **Prima**: Usa il prompt ottimizzato ottenuto da RQ2
2. Crea `Traccia/Fotografia_clarified.pdf` con linguaggio più chiaro (stessa semantica, meno ambiguità)
3. Esegui con traccia originale: `pdfFile = "Fotografia.pdf"`, `logFile = "RQ3_orig"`
4. **CAMBIA SOLO LA TRACCIA**: `pdfFile = "Fotografia_clarified.pdf"`, `logFile = "RQ3_clarified"`
5. Confronta i miglioramenti

**Risposta trovata**: Ho trovato dei modi per scrivere la traccia in maniera più chiara.

### 6.5 RQ4: Validità delle Metriche

**Obiettivo**: Confrontare metriche automatiche con valutazione tradizionale.

**Configurazione per analisi studenti**:
```javascript
export const experiment = "Voto";
export const aiProvider = "gemini";
export const pdfFile = "Fotografia.pdf";
export const xmiFile = "Fotografia.xmi";
export const logFile = "RQ4_Fotografia_StudentiVsAI";
export const directoryCampioni = "../Sperimentazioni/Fotografia";
```

**Risultati del confronto**:

| Traccia | Studenti (30 elaborati) | LLM |
|---------|-------------------------|-----|
| **Autobus** | Media UMLComparator: 0.78<br>Media SimilaritaNumeroErrori: 3.27 | UMLComparator: 0.834<br>SimilaritaNumeroErrori: 4 |
| **Fotografia** | Media UMLComparator: 0.79<br>Media SimilaritaNumeroErrori: 3.33 | UMLComparator: 0.961<br>SimilaritaNumeroErrori: 3 |

**Pattern di errore più comuni negli studenti**:
1. **Attributi** (incompletezza): omissione di attributi descrittivi
2. **Molteplicità**: cardinalità errate (es. 1-1 invece di 1-*)  
3. **Relazioni**: fusione di classi in attributi stringa
4. **Attributi ID non richiesti**: aggiunta sistematica di ID superflui
5. **Enumerazioni parziali**: presenza ma con literal mancanti
6. **Naming**: uso di sinonimi non normalizzati

**Distribuzione errori studenti**:
- 2 errori: 10% studenti
- 3 errori: 50% studenti (valore modale)
- 4 errori: 30% studenti  
- 5 errori: 10% studenti

**Come replicare**:
1. Popola `Sperimentazioni/NomeTraccia/` con file XMI degli studenti
2. Configura modalità "Voto" e esegui
3. Analizza la distribuzione dei punteggi nel file di log
4. Confronta medie studenti vs LLM

### 6.6 Complementarità delle Metriche

**UMLComparator (0.0-1.0)**:
- Misura copertura strutturale quantitativa
- Formula: 40% classi + 20% attributi + 20% metodi + 20% relazioni
- Graduale: più errori → punteggio progressivamente più basso

**SimilaritaNumeroErrori (0-7)**:
- Conta categorie di errore presenti (binario per categoria)
- Categorie: Classi, Attributi, Associazioni, Molteplicità, Enumerazioni, Generalizzazioni, Attributi ID
- Rigido: anche 1 errore in una categoria → +1 al conteggio

**Relazione osservata**:
- SimilaritaNumeroErrori tende a +1.18 errori rispetto a valutazione manuale docente
- Le due metriche sono correlate ma non linearmente
- **Uso combinato raccomandato**: UMLComparator per ranking, SimilaritaNumeroErrori per feedback formativo

---
## 7. Avvio rapido
```bash
npm start
```
Assicurarsi che i percorsi configurati esistano prima dell'esecuzione.

---
## 8. Come leggere e interpretare gli output

### 8.1 Posizione dei file di output
Tutti i risultati vengono salvati nella cartella `risultati/` con nomi che includono timestamp:
```
risultati/
├── Fotografia.txt_2025-08-26T16-49-28-396+02-00.txt    # Esperimento main
├── Fotografia_voto.txt_2025-08-26T17-15-32-123+02-00.txt # Esperimento Voto
└── RQ1_Fotografia_DeepSeek.txt_2025-08-26T18-00-15-456+02-00.txt
```

### 8.2 Anatomia di un file di output (modalità "main")

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

### 8.3 Anatomia di un file di output (modalità "Voto")

La modalità Voto produce output più lunghi perché analizza tutti i file degli studenti:

```
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

### 8.5 Come estrarre dati per analisi statistiche

#### **Per un singolo esperimento**:
```bash
# Estrai la similarità totale
grep "Similarità totale:" risultati/Fotografia.txt_* | cut -d: -f2

# Estrai errori attendibili
grep "Errori attendibili:" risultati/Fotografia.txt_* | cut -d: -f2

# Estrai classi mancanti
grep "Classi mancanti:" risultati/Fotografia.txt_*
```

#### **Per confronti tra AI (RQ1)**:
1. Esegui esperimenti con aiProvider diversi
2. Confronta le "Similarità totale" nei file di log
3. Analizza le "Classi mancanti" per vedere pattern comuni

#### **Per analisi prompt (RQ2)**:
1. Modifica prompt.js e ri-esegui
2. Confronta i breakdown dei componenti (classSimilarity, relationSimilarity, ecc.)
3. Verifica se categorie specifiche migliorano

#### **Per analisi batch studenti (RQ4)**:
```bash
# Conta quanti studenti hanno score > 0.7
grep "UMLComparator" risultati/Fotografia_voto.txt_* | awk -F: '{if($2>0.7) count++} END{print count}'

# Distribuzione SimilaritaNumeroErrori
grep "SimilaritaNumeroErrori" risultati/Fotografia_voto.txt_* | cut -d: -f2 | sort | uniq -c
```

### 8.6 Troubleshooting interpretazione

#### **Problema**: Similarità totale = 0
**Causa**: Nessuna classe è stata matchata
**Soluzione**: Verifica che i nomi delle classi siano ragionevolmente simili

#### **Problema**: Errori non attendibili molto alti
**Causa**: Il sistema ha rilevato molti possibili falsi positivi
**Interpretazione**: Concentrati solo sugli "Errori attendibili"

#### **Problema**: relationSimilarity = 0 ma il modello sembra buono
**Causa**: Le relazioni hanno nomi di classe troppo diversi per essere matchate
**Soluzione**: Normale, l'AI spesso usa nomi diversi per le classi

#### **Problema**: SimilaritaNumeroErrori = 7 ma UMLComparator > 0.5
**Causa**: Il modello ha la struttura giusta ma mancano dettagli in tutte le categorie
**Interpretazione**: Modello incompleto ma non completamente sbagliato
I log hanno due formati principali:

### 8.1 Modalità `main` (singolo confronto LLM ↔ atteso)
Struttura a blocchi sequenziali:
1. Separatore iniziale
2. Provider
3. Estrazione testo traccia (contenuto PDF)
4. "primo step" – modello atteso (rappresentazione JSON derivata dall'XMI di riferimento)
5. "terzo step" / "quarto step" – modello generato dall'IA (JSON)
6. Risultato del confronto (similarità globale + breakdown componenti)
7. Report errori con classificazione (CRITICI / IMPORTANTI / MINORI / NON ATTENDIBILI)
8. Differenze dettagliate (liste: Classi mancanti/extra, Attributi mancanti/extra, Relazioni mancanti/extra, ecc.)

Estratto reale (ridotto):
```
---------------------- Inizio del processo ----------------------
Gemini
... (contenuto PDF estratto) ...
----------------------primo step stampo il Contenuto del PDF----------------------
... testo ...
---------------------- secondo step stampo il Model JSON dell'XMI----------------------
{ "classes": [...], "relations": [...], "enumerations": [] }
---------------------- terzo step stampo il risultato della IA----------------------
{ "classes": [...], "relations": [...], "enumerations": [] }
---------------------- quinto step stampo il risultato del confronto tra i due modelli----------------------
Similarità totale: 0.706
Dettagli: {"classSimilarity":0.723,"attributeSimilarity":0.53,"methodSimilarity":0.625,"relationSimilarity":0.929}
Classi abbinate: [{"from":"Hackathon","to":"Hackathon","similarity":1}, ...]
... ANALISI ERRORI E SUGGERIMENTI ...
==================== REPORT ERRORI ====================
Similarità: 70.6% - Status: MEDIO
Errori attendibili: 12
Errori non attendibili: 23
... elenco errori classificati ...
---------------------- DIFFERENZE DETTAGLIATE ----------------------
Classi mancanti: ["UtenteRegistrato", ...]
Classi extra: ["Utente", ...]
Attributi mancanti: [...]
Attributi extra: [...]
Relazioni mancanti: [...]
Relazioni extra: [...]
```

Interpretazione campi principali:
* Similarità totale: valore aggregato (≈ UMLComparator interno) espresso in [0,1] o percentuale.
* Dettagli: breakdown per dimensione.
* Report errori: conteggio distinto tra errori considerati affidabili (attendibili) e potenziali falsi positivi.
* Liste differenze: materiale utilizzabile per analisi qualitativa o calcolo di metriche alternative.

Regex utili per estrazione automatica (esempi):
* Similarità totale: `^Similarità totale: ([0-9]+\.[0-9]+)`
* Classi mancanti: `^Classi mancanti: \[(.*)\]`
* Errori attendibili: `^Errori attendibili: (\d+)`

### 8.2 Modalità `Voto` (batch studenti)
Formato riga sintetica per ciascun file (se implementato nel tuo branch):
```
file=<nome>.xmi; UMLComparator=<val>; SimilaritaNumeroErrori=<n>; categorie=[<lista>]
```
Esempio:
```
file=5311.xmi; UMLComparator=0.79; SimilaritaNumeroErrori=3; categorie=[Attributi,Naming,Enumerazioni]
```
Uso consigliato: copiare il file di log ed elaborare le righe con uno script per generare tabella (CSV) con colonne: file, UMLComparator, SimilaritaNumeroErrori, categorie.

### 8.3 Buone pratiche
* Conservare i log originali con timestamp per tracciabilità (non sovrascrivere).
* Includere nel testo della tesi il nome del file log e commit hash associato.
* Per analisi statistiche evitare l'uso diretto della sezione "Errori NON ATTENDIBILI" senza verifica: filtrare prima su tipologie rilevanti.

---
## 9. Metriche
### 9.1 UMLComparator (similarità strutturale aggregata)
Formula (pseudocodice semplificato):
1. Match classi con soglia Jaro‑Winkler ≥ 0.6 (greedy ordinato alfabeticamente).
2. classSim = max(0, (Σ similarityMatch / max(|A|,|B|)) − (unmatched / max(|A|,|B|)) * 0.8)
3. attrSim = media Jaro‑Winkler tra insiemi attributi delle classi matchate (concatenati in stringa normalizzata).
4. methodSim = analogo agli attributi.
5. relSim = relazioni matchate / max(relA, relB) con match basato su coppie (from,to,type) usando
   - similarità nomi classi ≥ 0.3 oppure coppia già matchata tra le classi.
6. Similarità finale = 0.4 * classSim + 0.2 * attrSim + 0.2 * methodSim + 0.2 * relSim (normalizzata e arrotondata a 3 decimali).

Componenti restituiti nei log (Dettagli): classSimilarity, attributeSimilarity, methodSimilarity, relationSimilarity.

Proprietà:
* Penalizzazione esplicita per classi mancanti/extra (fattore 0.8 nella sottrazione).
* Robustezza parziale a sinonimi (Jaro‑Winkler + normalizzazione alfanumerica). Non c'è una categoria “Naming” separata: differenze di naming incidono su classi/attributi/relazioni.
* Non considera semantica interna (tipi attributi, vincoli OCL, ecc.).

Soglie interne rilevanti:
* MIN_CLASS_SIMILARITY = 0.6 (match classe).
* THRESHOLD relazioni = 0.3 (per riuso similarità nei nomi durante il matching relazionale).

### 9.2 SimilaritaNumeroErrori (conteggio categorie con almeno una discrepanza)
Restituisce un intero 0–7: numero di categorie in cui è stato riscontrato ≥1 errore. Non è il numero totale di errori elementari.

Pipeline per ciascuna categoria (ordine):
1. Classi (presenza/nome, soglia Jaro‑Winkler 0.3)
2. Attributi (presenza/nome, soglia 0.3)
3. Associazioni (endpoint esatti)
4. Molteplicità (con equivalenze: *, 0..*, 1..*, ecc.)
5. Enumerazioni (nome, soglia 0.3)
6. Generalizzazioni (coppie padre->figlio)
7. Attributo id (presenza di attributi denominati id o terminanti in id conta come errore: design anti‑pattern)

Se una categoria presenta uno o più scostamenti si aggiunge 1 al conteggio e si registra l'etichetta (es. "Molteplicità").

Interpretazione rapida:
* 0–1: vicino al modello atteso (solo micro‑disallineamenti)
* 2–3: lacune moderate
* 4–5: modello parziale o naming diffuso errato
* 6–7: modello strutturalmente distante

Soglia di similarità usata internamente per nomi (classi/attributi/enumerazioni): 0.3 (più permissiva rispetto a MIN_CLASS_SIMILARITY=0.6 dell'UMLComparator).

Complementarità tra le metriche:
* UMLComparator fornisce un punteggio continuo ponderato utile per ranking.
* SimilaritaNumeroErrori fornisce diagnosi rapida sulle dimensioni compromesse (qualitativa categoriale).
* Casi divergenti (alto UMLComparator ma molte categorie; basso UMLComparator ma poche categorie) vanno analizzati manualmente: indicano rispettivamente omissioni semantiche localizzate vs errori diffusi ma superficiali.

Categorie effettive implementate: Classi, Attributi, Associazioni, Molteplicità, Enumerazioni, Generalizzazioni, Attributo id.

Nota: nel batch (mode Voto) il campo riportato come SimilaritaNumeroErrori è questo conteggio (0–7); la “Similarità totale” nei log singoli corrisponde invece all'UMLComparator.


---
## 10. Aggiungere una nuova traccia
1. Inserire `<Nuova>.pdf` in `Traccia/`.
2. Inserire `<Nuova>.xmi` in `UmlAtteso/`.
3. (Studenti) creare `Sperimentazioni/<Nuova>/` con i modelli raccolti.
4. Aggiornare `Config.js` e rieseguire.

---
## 11. Analisi aggregata (post-processing)
Esempi di elaborazioni consigliate sui log:
* Calcolo media / mediana UMLComparator per ogni provider.
* Distribuzione di SimilaritaNumeroErrori (frequenze 0–7).
* Confronto tra varianti di prompt: Δ medio per categoria.
* Identificazione modelli outlier (alto UMLComparator ma molti errori categoriali, e viceversa).

---
## 12. Troubleshooting
| Problema | Causa probabile | Soluzione |
|----------|-----------------|-----------|
| Punteggio UMLComparator = 0 | Percorsi XMI errati | Verificare `pdfFile` / `xmiFile` |
| Nessuna riga nel log (mode Voto) | `directoryCampioni` vuota o errata | Correggere percorso |
| Errore API | Chiave mancante o quota esaurita | Controllare `.env` |
| Troppe penalità Naming | Sinonimi non normalizzati | Uniformare nel prompt o introdurre mapping |


---
## 13. Riferimento rapido per RQ (che cosa estrarre)
| RQ | Focus | Indicatori minimi | Indicatori avanzati |
|----|-------|-------------------|---------------------|
| RQ1 | LLM diversi | UMLComparator, SimilaritaNumeroErrori per provider | classSimilarity, relationSimilarity, categorie mancanti per provider |
| RQ2 | Prompt rewriting | Δ UMLComparator, Δ SimilaritaNumeroErrori per versione prompt | Trend saturazione, variazioni per categoria (naming, attributi) |
| RQ3 | Traccia riscritta | Confronto originale vs clarified (UMLComparator, categorie) | Riduzione errori naming/vincoli %, differenza relationSimilarity |
| RQ4 | Validità metrica | Correlazione UMLComparator ↔ (7 - errori), esempi divergenti | Analisi outlier, curva cumulativa punteggi |


---
## 14. Contatti
Per chiarimenti tecnici: (aggiungere riferimento / email se opportuno).


