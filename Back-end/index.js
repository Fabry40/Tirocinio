import { readdir } from 'fs/promises';
import { UmlAtteso } from './UmlAtteso.js';
import { GeminiAPI } from './Gemini.js';
import { OpenRouterIA } from './OpenRouterIA.js';
import { UMLComparator } from './UMLComparator.js';
import { Traccia } from './Traccia.js';
import { Logger } from './logger.js';
import { DifferenceAnalyzer } from './DifferenceAnalyzer.js';
import { ErrorReporter } from './ErrorReporter.js';
import { VotoComparator } from './Voto.js';

const PDF_FILE = 'Aeroporto.pdf'; //Nome del file PDF da analizzare
const XMI_FILE = 'Autobus.xmi'; //Nome del file XMI atteso
const NAME_FILE = 'Fotografia'; // Nome del file di log

async function main() {
  console.log("Inizio del processo di confronto UML...");
  Logger.setLogFileName(`${NAME_FILE}.txt`);
  Logger.logToFile("\n---------------------- Inizio del processo ----------------------\n");

  const contenuto = await Traccia.PrintTxtPdf(PDF_FILE);
  Logger.logToFile("\n----------------------primo step stampo il Contenuto del PDF----------------------  \n" + contenuto);
  Logger.logToFile("📄 Contenuto PDF estratto!");
  const jsonObj = UmlAtteso.parseXmiFile(`./UmlAtteso/${XMI_FILE}`);
  const modelA = UmlAtteso.estraiModelCompatto(jsonObj);
  Logger.logToFile("\n---------------------- secondo step stampo il Model JSON dell'XMI----------------------  \n" + JSON.stringify(modelA, null, 2));

  //let risultato = await OpenRouterIA.runMeta(contenuto);
  let risultato = await OpenRouterIA.runDeepSeek(contenuto);
  //let  risultato = await GeminiAPI.getGeminiResponse(contenuto);
  Logger.logToFile("\n---------------------- terzo step stampo il risultato della IA----------------------  \n" + risultato);
  Logger.logToFile("🧠 Risultato IA ottenuto!");

  let modelB = null;
  // Fai il parsing del JSON se modelB è una stringa
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
      modelB = JSON.parse(clean);
    } catch (e) {
      Logger.logToFile("ERRORE nel parsing del JSON della IA: " + e.message);
      return;
    }
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

  const differences = DifferenceAnalyzer.analyzeDifferences(modelA, modelB);
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

  

 
}
const DIRECTORY_ATTESO = './UmlAtteso';
const DIRECTORY_CAMPIONI = './Album';
const FILE_ESTENSIONE = '.xmi';
const XMI_FILE_Traccia_Prof = 'Fotografia.xmi'; //Nome del file XMI atteso
const PDF_FILE_Traccia_Prof = 'Fotografia.pdf'; //Nome del file PDF da analizzare

async function Voto() {
  Logger.setLogFileName(`${NAME_FILE}_voto.txt`);
  Logger.logToFile("\n---------------------- INIZIO ANALISI VOTO ----------------------\n");

  const modelProf = UmlAtteso.estraiModelCompatto(UmlAtteso.parseXmiFile(`${DIRECTORY_ATTESO}/${XMI_FILE_Traccia_Prof}`));
  UmlAtteso.stampaModelCompatto(modelProf, Logger.logToFile);

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

      // Confronto con VotoComparator
      const risultatoVoto = VotoComparator.similaritaVoto(modelProf, modelStud);
      risultatiVoto.push(risultatoVoto);
      Logger.logToFile("Similarità voto (VotoComparator): " + risultatoVoto);

      // Confronto con UMLComparator
      const risultatoUML = UMLComparator.compareUMLModels(modelProf, modelStud);
      risultatiUML.push(risultatoUML.similarity);
      Logger.logToFile("Similarità voto (UMLComparator): " + risultatoUML.similarity);
      Logger.logToFile("Dettagli UMLComparator: " + JSON.stringify(risultatoUML.details));
    }
  }
  if (risultatiVoto.length > 0) {
    const mediaVoto = risultatiVoto.reduce((a, b) => a + b, 0) / risultatiVoto.length;
    Logger.logToFile(`\nMedia Similarità voto (VotoComparator): ${mediaVoto.toFixed(2)}`);
  } else {
    Logger.logToFile("Nessun file XMI trovato.");
  }
  if (risultatiUML.length > 0) {
    const mediaUML = risultatiUML.reduce((a, b) => a + b, 0) / risultatiUML.length;
    Logger.logToFile(`Media Similarità voto (UMLComparator): ${mediaUML.toFixed(2)}`);
  }

  // Estrazione traccia e chiamata IA (fuori dal ciclo)
  const contenuto = await Traccia.PrintTxtPdf(PDF_FILE_Traccia_Prof);
  //let rispostaIA = await OpenRouterIA.runDeepSeek(contenuto);
  let  rispostaIA = await GeminiAPI.getGeminiResponse(contenuto);
  if (!rispostaIA) {
  console.log("❌ Errore: la IA non ha restituito alcuna risposta.");
  return;
}
  let modelIA = null;
  if (typeof rispostaIA === "string") {
    try {
      let clean = rispostaIA.trim();
      if (clean.startsWith("```json")) clean = clean.slice(7);
      if (clean.startsWith("```")) clean = clean.slice(3);
      if (clean.endsWith("```")) clean = clean.slice(0, -3);
      modelIA = JSON.parse(clean);
    } catch (e) {
      Logger.logToFile("ERRORE nel parsing del JSON della IA: " + e.message);
      return;
    }
  }

  if (!modelIA || !Array.isArray(modelIA.classes)) {
    Logger.logToFile("Modello IA non valido o mancante proprietà 'classes'");
    return;
  }

  Logger.logToFile("\n========== MODELLO IA GENERATO ==========\n");
  UmlAtteso.stampaModelCompatto(modelIA, Logger.logToFile);

  // Confronto IA con VotoComparator
  let risultatoIA = VotoComparator.similaritaVoto(modelProf, modelIA);
  Logger.logToFile("Similarità voto IA (VotoComparator): " + risultatoIA);

  // Confronto IA con UMLComparator
  const risultatoUML_IA = UMLComparator.compareUMLModels(modelProf, modelIA);
  Logger.logToFile("Similarità voto IA (UMLComparator): " + risultatoUML_IA.similarity);
  Logger.logToFile("Dettagli UMLComparator IA: " + JSON.stringify(risultatoUML_IA.details));
}



Voto();
//main()