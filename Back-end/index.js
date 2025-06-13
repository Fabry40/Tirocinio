import { readdir } from 'fs';
import { MnipolatoreXmi } from './UmlAtteso.js';
import { GeminiAPI } from './Gamini.js';
import {OpenRouterIA} from './OpenrouterIA.js';
import {UMLComparator} from './UmlComparator.js';
import { PlantUMLParser } from './PalantumlParser.js';
import { MnipolatorePdf } from './Traccia.js';
import { Logger } from './Logger.js';

  const PDF_FILE = 'Hackathon.pdf';//Nome del file PDF da analizzare
  const XMI_FILE = 'Hackathon.xmi';//Nome del file XMI atteso
  const NAME_FILE = 'Hackathon';// Nome del file di log

async function main() {
  Logger.setLogFileName(`${NAME_FILE}.txt`);
  Logger.logToFile("\n---------------------- Inizio del processo ----------------------\n");
  
  const contenuto = await MnipolatorePdf.PrintTxtPdf(PDF_FILE);
  const jsonObj = MnipolatoreXmi.parseXmiFile(`./UmlAtteso/${XMI_FILE}`);
  Logger.logToFile("\n----------------------primo step stampo il Contenuto del PDF----------------------  \n" + contenuto);
  const modelA = MnipolatoreXmi.estraiModelCompatto(jsonObj);
  Logger.logToFile("\n---------------------- secondo step stampo il Model JSON dell'XMI----------------------  \n" + JSON.stringify(modelA, null, 2));

  //let risultato = await OpenRouterIA.runMeta(contenuto);
  let risultato = await OpenRouterIA.runDeepSeek(contenuto);
  //let  risultato = await GeminiAPI.getGeminiResponse(contenuto);
  Logger.logToFile("\n---------------------- terzo step stampo il risultato della IA----------------------  \n" + risultato);
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


  /*const modelB = PlantUMLParser.parse(risultato);
  Logger.logToFile("\n---------------------- quarto step stampo il Model JSON della IA---------------------- \n" + JSON.stringify(modelB, null, 2));*/




  const result = UMLComparator.compareUMLModels(modelA, modelB);
  Logger.logToFile("\n---------------------- quinto step stampo il risultato del confronto tra i due modelli----------------------  \n");
  Logger.logToFile("Similarità totale: " + result.similarity);
  Logger.logToFile("Dettagli: " + JSON.stringify(result.details));
  Logger.logToFile("Classi abbinate: " + JSON.stringify(result.matchedClasses));
}

main();