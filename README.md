# UML Comparator - Sistema di Valutazione UML

Sistema per confrontare modelli UML generati da LLM con modelli di riferimento. Utilizzato per le sperimentazioni della tesi sui diagrammi delle classi UML.

## Metriche di Valutazione
- **UMLComparator**: similarità strutturale (0.0-1.0) - 40% classi + 20% attributi + 20% metodi + 20% relazioni
- **SimilaritaNumeroErrori**: conteggio categorie di errore (0-7) - Classi, Attributi, Associazioni, Molteplicità, Enumerazioni, Generalizzazioni, Attributi ID

---

## Struttura del Progetto

```
Applicazione/
├── Back-end/                    # Codice sorgente principale
│   ├── config.js               # ⚙️ Configurazione esperimenti
│   ├── prompt.js               # 💬 Prompt per LLM (modificabile per RQ2)
│   ├── index.js                # 🚀 Entry point
│   ├── Gemini.js               # 🤖 Integrazione Google Gemini
│   ├── OpenRouterIA.js         # 🤖 Integrazione OpenRouter (DeepSeek, Meta)
│   └── .env                    # 🔑 API Keys (da creare)
├── Traccia/                    # 📄 PDF delle tracce
├── UmlAtteso/                  # ✅ XMI di riferimento (docente)
├── Sperimentazioni/            # 👥 XMI degli studenti
└── risultati/                  # 📊 Log di output con timestamp
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
npm start
```

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

### Esempio Configurazione Base
```javascript
export const experiment = "main";
export const aiProvider = "deepSeek";
export const pdfFile = "Fotografia.pdf";
export const xmiFile = "Fotografia.xmi";
export const logFile = "Fotografia";
export const directoryCampioni = ""; // Vuoto per esperimento "main"
```

---

## Research Questions - Configurazioni Sperimentali

### RQ1: Confronto tra LLM
**Obiettivo**: Valutare come diversi modelli si comportano sulla stessa traccia  
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
**Cosa cambia**: contenuto di `Back-end/prompt.js`  
**Cosa rimane fisso**: traccia, LLM, UML atteso

```javascript
export const aiProvider = "deepSeek";  // FISSO
export const pdfFile = "Fotografia.pdf";  // FISSO  
export const logFile = "RQ2_PromptV1";
// Modifica prompt.js tra un test e l'altro
```

### RQ3: Riscrittura Traccia
**Obiettivo**: Migliorare chiarezza della traccia mantenendo la semantica  
**Cosa cambia**: file PDF della traccia  
**Cosa rimane fisso**: prompt ottimizzato (da RQ2), LLM, UML atteso

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
**Modalità batch**: analizza tutti gli XMI degli studenti + genera modello LLM

```javascript
export const experiment = "Voto";  // Modalità batch
export const directoryCampioni = "../Sperimentazioni/Fotografia";
export const logFile = "RQ4_StudentiVsAI";
```

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

## Troubleshooting & FAQ

### Problemi Comuni

| Problema | Causa | Soluzione |
|----------|-------|-----------|
| **Similarità = 0** | Nessuna classe matchata | Verifica percorsi PDF/XMI, controlla nomi classi |
| **Errore API** | Chiave mancante/invalida | Controlla `.env`, verifica quota API |
| **Log vuoto (modalità Voto)** | Cartella studenti vuota | Verifica `directoryCampioni` e presenza file .xmi |
| **JSON malformato** | Risposta AI corrotta | Riprova, il sistema ha fallback automatici |
| **Timeout** | Rate limiting API | Aspetta qualche minuto e riprova |

### FAQ

**Q: Quale LLM funziona meglio?**  
A: Gemini > DeepSeek > Meta (ma dipende dalla traccia)

**Q: Come interpreto "Errori non attendibili"?**  
A: Sono possibili falsi positivi, concentrati sugli "Errori attendibili"

**Q: Posso modificare le soglie delle metriche?**  
A: Sì, nei file `umlComparator.js` e `Voto.js`

**Q: Come visualizzo i diagrammi?**  
A: Copia il codice PlantUML dai log su [plantuml.com](https://www.plantuml.com/plantuml/uml/)

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
