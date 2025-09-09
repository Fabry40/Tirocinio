import { readdir } from 'fs/promises';
import { UmlAtteso } from './RQ1/UmlAtteso.js';
import { GeminiAPI } from './LLM/Gemini.js';
import { OpenRouterIA } from './LLM/OpenRouterIA.js';
import { UMLComparator } from './RQ1/UMLComparator.js';
import { Traccia } from './RQ1/Traccia.js';
import { Logger } from './Logger.js';
import { ErrorReporter } from './RQ3/ErrorReporter.js';
import { SimilaritaNumeroErrori } from './RQ4/Voto.js'; 
import { PlantUMLGenerator } from './plantUML.js';
// Importa la configurazione
import { experiment, pdfFile, xmiFile, logFile, directoryCampioni, aiProvider } from './config.js';

// Usa i valori dalla configurazione
const PDF_FILE = pdfFile;
const XMI_FILE = xmiFile;
const NAME_FILE = logFile;
const DIRECTORY_ATTESO = '../UmlAtteso';
const DIRECTORY_CAMPIONI = directoryCampioni;
const FILE_ESTENSIONE = '.xmi';

async function callAI(contenuto) {
  switch (aiProvider) {
    case "deepSeek":
      return await OpenRouterIA.runDeepSeek(contenuto);
    case "meta":
      return await OpenRouterIA.runMeta(contenuto);
    case "gemini":
      return await GeminiAPI.getGeminiResponse(contenuto);
    default:
      console.error(`❌ Provider IA non riconosciuto: ${aiProvider}`);
      console.error("Valori validi: 'deepSeek', 'meta', 'gemini'");
      return null;
  }
}

async function main() {
  console.log("Inizio del processo di confronto UML...");
  Logger.setLogFileName(`${NAME_FILE}.txt`);
  Logger.logToFile(`IA UTILIZZATA: ${aiProvider.toUpperCase()}`);
  Logger.logToFile(`esperimento : ${experiment}`);
  Logger.logToFile("\n---------------------- Inizio del processo ----------------------\n");

  const contenuto = await Traccia.PrintTxtPdf(PDF_FILE);
  Logger.logToFile("\n----------------------primo step stampo il Contenuto del PDF----------------------  \n" + contenuto);
  Logger.logToFile("📄 Contenuto PDF estratto!");
  const jsonObj = UmlAtteso.parseXmiFile(`${DIRECTORY_ATTESO}/${XMI_FILE}`);
  const modelA = UmlAtteso.estraiModelCompatto(jsonObj);
  Logger.logToFile("\n---------------------- secondo step stampo il Model JSON dell'XMI----------------------  \n" + JSON.stringify(modelA, null, 2));
  let risultato = await callAI(contenuto);
  Logger.logToFile("\n---------------------- terzo step stampo il risultato della IA----------------------  \n" + risultato);
  Logger.logToFile("🧠 Risultato IA ottenuto!");

  let modelB = null;
  
  // Controllo se la risposta della IA è valida
  if (!risultato) {
    Logger.logToFile("ERRORE: La IA ha restituito una risposta vuota o null");
    console.error("❌ Errore: La IA ha restituito una risposta vuota o null");
    return;
  }
  
  // Fai il parsing del JSON se risultato è una stringa
  if (typeof risultato === "string") {
    try {
      // Rimuovi eventuali delimitatori di code block
      let clean = risultato.trim();
      if (clean.startsWith("```json")) {
        clean = clean.slice(7);
      }
      if (clean.startsWith("```")) {
        clean = clean.slice(3);
      }
      if (clean.endsWith("```")) {
        clean = clean.slice(0, -3);
      }
      clean = clean.trim();
      
      if (!clean) {
        Logger.logToFile("ERRORE: Il contenuto JSON della IA è vuoto dopo la pulizia");
        console.error("❌ Errore: Il contenuto JSON della IA è vuoto");
        return;
      }
      
      // Log della risposta pulita per debug
      Logger.logToFile("JSON pulito da parsare: " + clean);
      
      modelB = JSON.parse(clean);
    } catch (e) {
      Logger.logToFile("ERRORE nel parsing del JSON della IA: " + e.message);
      Logger.logToFile("Contenuto che ha causato l'errore: " + risultato);
      console.error("❌ Errore nel parsing del JSON della IA:", e.message);
      
      // Prova a riparare JSON comuni
      try {
        let clean = risultato.trim();
        if (clean.startsWith("```json")) {
          clean = clean.slice(7);
        }
        if (clean.startsWith("```")) {
          clean = clean.slice(3);
        }
        if (clean.endsWith("```")) {
          clean = clean.slice(0, -3);
        }
        clean = clean.trim();
        
        // Prova a riparare virgolette singole con doppie
        clean = clean.replace(/'/g, '"');
        
        // Prova a rimuovere trailing commas
        clean = clean.replace(/,(\s*[}\]])/g, '$1');
        
        // Prova a estrarre solo la parte JSON (dal primo { all'ultimo })
        const firstBrace = clean.indexOf('{');
        const lastBrace = clean.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          clean = clean.substring(firstBrace, lastBrace + 1);
        }
        
        Logger.logToFile("Tentativo di riparazione JSON: " + clean);
        modelB = JSON.parse(clean);
        Logger.logToFile("✅ JSON riparato con successo!");
        console.log("✅ JSON riparato con successo!");
        
      } catch (e2) {
        Logger.logToFile("ERRORE anche nel tentativo di riparazione: " + e2.message);
        console.error("❌ Errore anche nel tentativo di riparazione:", e2.message);
        
        // Ultimo tentativo: cerca il JSON con regex
        try {
          const jsonMatch = risultato.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            let extractedJson = jsonMatch[0];
            extractedJson = extractedJson.replace(/'/g, '"');
            extractedJson = extractedJson.replace(/,(\s*[}\]])/g, '$1');
            Logger.logToFile("Tentativo di estrazione JSON con regex: " + extractedJson);
            modelB = JSON.parse(extractedJson);
            Logger.logToFile("✅ JSON estratto e parsato con successo!");
            console.log("✅ JSON estratto e parsato con successo!");
          } else {
            Logger.logToFile("❌ Impossibile trovare JSON valido nella risposta");
            console.error("❌ Impossibile trovare JSON valido nella risposta");
            return;
          }
        } catch (e3) {
          Logger.logToFile("ERRORE finale nel parsing: " + e3.message);
          console.error("❌ Errore finale nel parsing:", e3.message);
          return;
        }
      }
    }
  } else if (typeof risultato === "object") {
    // Se è già un oggetto, usalo direttamente
    modelB = risultato;
  } else {
    Logger.logToFile("ERRORE: Tipo di risposta IA non supportato: " + typeof risultato);
    console.error("❌ Errore: Tipo di risposta IA non supportato:", typeof risultato);
    return;
  }
  
  // Controllo che modelB sia valido e abbia le proprietà necessarie
  if (!modelB || !modelB.classes) {
    Logger.logToFile("ERRORE: Il modello della IA non contiene la proprietà 'classes' o è null");
    Logger.logToFile("ModelB ricevuto: " + JSON.stringify(modelB, null, 2));
    console.error("❌ Errore: Il modello della IA non contiene la proprietà 'classes' o è null");
    return;
  }
  
  Logger.logToFile("\n---------------------- quarto step stampo il Model JSON della IA---------------------- \n" + JSON.stringify(modelB, null, 2));

  // Confronto tra i modelli
  const result = UMLComparator.compareUMLModels(modelA, modelB);
  Logger.logToFile("\n---------------------- quinto step stampo il risultato del confronto tra i due modelli----------------------  \n");
  Logger.logToFile("Similarità totale: " + result.similarity);
  Logger.logToFile("Dettagli: " + JSON.stringify(result.details));
  Logger.logToFile("Classi abbinate: " + JSON.stringify(result.matchedClasses));

  // ANALISI ERRORI E SUGGERIMENTI
  Logger.logToFile("\n🔍 Analizzando le differenze...");
  Logger.logToFile("\n---------------------- ANALISI ERRORI E SUGGERIMENTI ----------------------\n");

  // Usa le differenze già calcolate da UMLComparator
  const differences = result.differences;
  const errorReport = ErrorReporter.generateErrorReport(differences, result.similarity);
  const formattedReport = ErrorReporter.formatReport(errorReport);

  // Stampa il report solo nel log
  Logger.logToFile(formattedReport);

  // Log delle differenze dettagliate
  Logger.logToFile("\n---------------------- DIFFERENZE DETTAGLIATE ----------------------\n");
  Logger.logToFile("Classi mancanti: " + JSON.stringify(differences.missingClasses.map(c => c.name), null, 2));
  Logger.logToFile("Classi extra: " + JSON.stringify(differences.extraClasses.map(c => c.name), null, 2));
  Logger.logToFile("Attributi mancanti: " + JSON.stringify(differences.missingAttributes, null, 2));
  Logger.logToFile("Attributi extra: " + JSON.stringify(differences.extraAttributes, null, 2));
  Logger.logToFile("Relazioni mancanti: " + JSON.stringify(differences.missingRelations, null, 2));
  Logger.logToFile("Relazioni extra: " + JSON.stringify(differences.extraRelations, null, 2));
  Logger.logToFile("Tipi relazione sbagliati: " + JSON.stringify(differences.wrongRelationTypes, null, 2));

  // GENERAZIONE PLANTUML
  Logger.logToFile("\n---------------------- GENERAZIONE PLANTUML ----------------------\n");
  try {
    const plantUMLAtteso = PlantUMLGenerator.generatePlantUML(modelA);
    const plantUMLIA = PlantUMLGenerator.generatePlantUML(modelB);
    
    Logger.logToFile("\n--- PLANTUML MODELLO ATTESO ---\n");
    Logger.logToFile(plantUMLAtteso);
    Logger.logToFile("\n--- PLANTUML MODELLO IA ---\n");
    Logger.logToFile(plantUMLIA);
  } catch (error) {
    Logger.logToFile("❌ Errore durante la generazione PlantUML: " + error.message);
  }
}

async function Voto() {
  Logger.setLogFileName(`${NAME_FILE}_voto.txt`);
  Logger.logToFile(`IA UTILIZZATA: ${aiProvider.toUpperCase()}`);
    Logger.logToFile(`esperimento : ${experiment}`);
  Logger.logToFile("\n---------------------- INIZIO ANALISI VOTO ----------------------\n");

  const modelProf = UmlAtteso.estraiModelCompatto(UmlAtteso.parseXmiFile(`${DIRECTORY_ATTESO}/${XMI_FILE}`));
  UmlAtteso.stampaModelCompatto(modelProf, Logger.logToFile);

  // PLANTUML del modello professore (riferimento)
  Logger.logToFile("\n--- PLANTUML MODELLO PROFESSORE (RIFERIMENTO) ---\n");
  try {
    const plantUMLProf = PlantUMLGenerator.generatePlantUML(modelProf);
    Logger.logToFile(plantUMLProf);
  } catch (error) {
    Logger.logToFile("❌ Errore durante la generazione PlantUML professore: " + error.message);
  }

  const files = await readdir(DIRECTORY_CAMPIONI);
  let risultatiVoto = [];
  let risultatiUML = [];
  for (const file of files) {
    if (file.endsWith(FILE_ESTENSIONE)) {
      Logger.logToFile(`\n========== FILE ANALIZZATO: ${file} ==========\n`);
      const modelStud = UmlAtteso.estraiModelCompatto(UmlAtteso.parseXmiFile(`${DIRECTORY_CAMPIONI}/${file}`));
      if (!modelStud || !Array.isArray(modelStud.classes)) {
        Logger.logToFile(`Modello studente non valido per file ${file}`);
        continue;
      }
      UmlAtteso.stampaModelCompatto(modelStud, Logger.logToFile);

      // Confronto con SimilaritaNumeroErrori
      const risultatoVoto = SimilaritaNumeroErrori.similaritaVoto(modelProf, modelStud, Logger.logToFile);
      risultatiVoto.push(risultatoVoto);
      Logger.logToFile("Similarità voto (SimilaritaNumeroErrori): " + risultatoVoto);

      // Confronto con UMLComparator
      const risultatoUML = UMLComparator.compareUMLModels(modelProf, modelStud);
      risultatiUML.push(risultatoUML.similarity);
      Logger.logToFile("Similarità voto (UMLComparator): " + risultatoUML.similarity);
      Logger.logToFile("Dettagli UMLComparator: " + JSON.stringify(risultatoUML.details));
      
      // PLANTUML per questo studente
      Logger.logToFile("\n--- PLANTUML MODELLO STUDENTE ---\n");
      try {
        const plantUMLStud = PlantUMLGenerator.generatePlantUML(modelStud);
        Logger.logToFile(plantUMLStud);
      } catch (error) {
        Logger.logToFile("❌ Errore durante la generazione PlantUML studente: " + error.message);
      }
    }
  }
  if (risultatiVoto.length > 0) {
    const mediaVoto = risultatiVoto.reduce((a, b) => a + b, 0) / risultatiVoto.length;
    Logger.logToFile(`\nMedia Similarità voto (SimilaritaNumeroErrori): ${mediaVoto.toFixed(2)}`);
  } else {
    Logger.logToFile("Nessun file XMI trovato.");
  }
  if (risultatiUML.length > 0) {
    const mediaUML = risultatiUML.reduce((a, b) => a + b, 0) / risultatiUML.length;
    Logger.logToFile(`Media Similarità voto (UMLComparator): ${mediaUML.toFixed(2)}`);
  }

  // Estrazione traccia e chiamata IA (fuori dal ciclo)
  const contenuto = await Traccia.PrintTxtPdf(PDF_FILE);
  let rispostaIA = await callAI(contenuto);
  if (!rispostaIA) {
    console.log("❌ Errore: la IA non ha restituito alcuna risposta.");
    return;
  }
  let modelIA = null;
  
  // Controllo se la risposta della IA è valida
  if (!rispostaIA) {
    Logger.logToFile("ERRORE: La IA ha restituito una risposta vuota o null");
    console.error("❌ Errore: La IA ha restituito una risposta vuota o null");
    return;
  }
  
  // Parsing JSON robusto (stesso del main)
  if (typeof rispostaIA === "string") {
    try {
      // Rimuovi eventuali delimitatori di code block
      let clean = rispostaIA.trim();
      if (clean.startsWith("```json")) {
        clean = clean.slice(7);
      }
      if (clean.startsWith("```")) {
        clean = clean.slice(3);
      }
      if (clean.endsWith("```")) {
        clean = clean.slice(0, -3);
      }
      clean = clean.trim();
      
      if (!clean) {
        Logger.logToFile("ERRORE: Il contenuto JSON della IA è vuoto dopo la pulizia");
        console.error("❌ Errore: Il contenuto JSON della IA è vuoto");
        return;
      }
      
      // Log della risposta pulita per debug
      Logger.logToFile("JSON pulito da parsare (IA): " + clean);
      
      modelIA = JSON.parse(clean);
    } catch (e) {
      Logger.logToFile("ERRORE nel parsing del JSON della IA: " + e.message);
      Logger.logToFile("Contenuto che ha causato l'errore: " + rispostaIA);
      console.error("❌ Errore nel parsing del JSON della IA:", e.message);
      
      // Prova a riparare JSON comuni
      try {
        let clean = rispostaIA.trim();
        if (clean.startsWith("```json")) {
          clean = clean.slice(7);
        }
        if (clean.startsWith("```")) {
          clean = clean.slice(3);
        }
        if (clean.endsWith("```")) {
          clean = clean.slice(0, -3);
        }
        clean = clean.trim();
        
        // Prova a riparare virgolette singole con doppie
        clean = clean.replace(/'/g, '"');
        
        // Prova a rimuovere trailing commas
        clean = clean.replace(/,(\s*[}\]])/g, '$1');
        
        // Prova a estrarre solo la parte JSON (dal primo { all'ultimo })
        const firstBrace = clean.indexOf('{');
        const lastBrace = clean.lastIndexOf('}');
        if (firstBrace !== -1 && lastBrace !== -1 && lastBrace > firstBrace) {
          clean = clean.substring(firstBrace, lastBrace + 1);
        }
        
        Logger.logToFile("Tentativo di riparazione JSON (IA): " + clean);
        modelIA = JSON.parse(clean);
        Logger.logToFile("✅ JSON IA riparato con successo!");
        console.log("✅ JSON IA riparato con successo!");
        
      } catch (e2) {
        Logger.logToFile("ERRORE anche nel tentativo di riparazione IA: " + e2.message);
        console.error("❌ Errore anche nel tentativo di riparazione IA:", e2.message);
        
        // Ultimo tentativo: cerca il JSON con regex
        try {
          const jsonMatch = rispostaIA.match(/\{[\s\S]*\}/);
          if (jsonMatch) {
            let extractedJson = jsonMatch[0];
            extractedJson = extractedJson.replace(/'/g, '"');
            extractedJson = extractedJson.replace(/,(\s*[}\]])/g, '$1');
            Logger.logToFile("Tentativo di estrazione JSON con regex (IA): " + extractedJson);
            modelIA = JSON.parse(extractedJson);
            Logger.logToFile("✅ JSON IA estratto e parsato con successo!");
            console.log("✅ JSON IA estratto e parsato con successo!");
          } else {
            Logger.logToFile("❌ Impossibile trovare JSON valido nella risposta IA");
            console.error("❌ Impossibile trovare JSON valido nella risposta IA");
            return;
          }
        } catch (e3) {
          Logger.logToFile("ERRORE finale nel parsing IA: " + e3.message);
          console.error("❌ Errore finale nel parsing IA:", e3.message);
          return;
        }
      }
    }
  } else if (typeof rispostaIA === "object") {
    // Se è già un oggetto, usalo direttamente
    modelIA = rispostaIA;
  } else {
    Logger.logToFile("ERRORE: Tipo di risposta IA non supportato: " + typeof rispostaIA);
    console.error("❌ Errore: Tipo di risposta IA non supportato:", typeof rispostaIA);
    return;
  }

  // Controllo che modelIA sia valido e abbia le proprietà necessarie
  if (!modelIA || !modelIA.classes) {
    Logger.logToFile("ERRORE: Il modello della IA non contiene la proprietà 'classes' o è null");
    Logger.logToFile("ModelIA ricevuto: " + JSON.stringify(modelIA, null, 2));
    console.error("❌ Errore: Il modello della IA non contiene la proprietà 'classes' o è null");
    return;
  }

  Logger.logToFile("\n========== MODELLO IA GENERATO ==========\n");
  UmlAtteso.stampaModelCompatto(modelIA, Logger.logToFile);

  // Confronto IA con SimilaritaNumeroErrori
  let risultatoIA = SimilaritaNumeroErrori.similaritaVoto(modelProf, modelIA, Logger.logToFile);
  Logger.logToFile("Similarità voto IA (SimilaritaNumeroErrori): " + risultatoIA);

  // Confronto IA con UMLComparator
  const risultatoUML_IA = UMLComparator.compareUMLModels(modelProf, modelIA);
  Logger.logToFile("Similarità voto IA (UMLComparator): " + risultatoUML_IA.similarity);
  Logger.logToFile("Dettagli UMLComparator IA: " + JSON.stringify(risultatoUML_IA.details));

  // PLANTUML per il modello IA
  Logger.logToFile("\n--- PLANTUML MODELLO IA ---\n");
  try {
    const plantUMLIA = PlantUMLGenerator.generatePlantUML(modelIA);
    Logger.logToFile(plantUMLIA);
  } catch (error) {
    Logger.logToFile("❌ Errore durante la generazione PlantUML IA: " + error.message);
  }
}

// Selezione dell'esperimento basata sulla configurazione
if (experiment === "Voto") {
  Voto();
} else if (experiment === "main") {
  main();
} else {
  console.error("❌ Esperimento non riconosciuto. Modifica 'experiment' in Config.js.");
  console.error("Valori validi: 'Voto' o 'main'");
}