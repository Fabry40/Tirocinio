import { readdir } from 'fs';
import { MnipolatoreXmi } from './UmlAtteso.js';
import { GeminiAPI } from './Gemini.js';
import { OpenRouterIA } from './OpenrouterIA.js';
import { UMLComparator } from './UmlComparator.js';
import { MnipolatorePdf } from './Traccia.js';
import { Logger } from './Logger.js';
import { DifferenceAnalyzer } from './DifferenceAnalyzer.js';
import { ErrorReporter } from './ErrorReporter.js';

const PDF_FILE = 'Hackathon.pdf'; //Nome del file PDF da analizzare
const XMI_FILE = 'Hackathon.xmi'; //Nome del file XMI atteso
const NAME_FILE = 'Hackathon'; // Nome del file di log

async function main() {
  console.log("Inizio del processo di confronto UML...");
  Logger.setLogFileName(`${NAME_FILE}.txt`);
  Logger.logToFile("\n---------------------- Inizio del processo ----------------------\n");

  const contenuto = await MnipolatorePdf.PrintTxtPdf(PDF_FILE);
  Logger.logToFile("\n----------------------primo step stampo il Contenuto del PDF----------------------  \n" + contenuto);
  Logger.logToFile("📄 Contenuto PDF estratto!");
  const jsonObj = MnipolatoreXmi.parseXmiFile(`./UmlAtteso/${XMI_FILE}`);
  const modelA = MnipolatoreXmi.estraiModelCompatto(jsonObj);
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

  // Summary finale solo nel log
  Logger.logToFile(`\n📊 RIEPILOGO FINALE:`);
  Logger.logToFile(`   Similarità: ${(result.similarity * 100).toFixed(1)}%`);
  Logger.logToFile(`   Errori attendibili: ${errorReport.summary.totalErrors}`);
  Logger.logToFile(`   Errori non attendibili: ${errorReport.errors.nonReliable.length}`);
  Logger.logToFile(`   Status: ${errorReport.summary.status}`);

  if (errorReport.summary.totalErrors === 0 && errorReport.errors.nonReliable.length === 0) {
    Logger.logToFile(`\n🎉 PERFETTO! La traccia genera un UML corrispondente al 100%!`);
  } else if (errorReport.summary.totalErrors === 0) {
    Logger.logToFile(`\n✅ OTTIMO! Solo possibili problemi non attendibili (da verificare manualmente).`);
    Logger.logToFile(`💡 Concentrati sui suggerimenti attendibili per migliorare la traccia.`);
  } else {
    Logger.logToFile(`\n💡 Segui i suggerimenti attendibili sopra per migliorare la traccia.`);
    if (errorReport.errors.nonReliable.length > 0) {
      Logger.logToFile(`⚠️  Gli errori non attendibili potrebbero essere falsi positivi.`);
    }
  }

  console.log("Processo di confronto UML completato!");
}
main()

