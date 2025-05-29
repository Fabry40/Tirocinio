import { readdir } from 'fs';
import { MnipolatoreXmi } from './MnipolatoreXmi.js';
import { GeminiAPI } from './gamini.js';
import {OpenRouterIA} from './openrouterIA.js';
import {UMLComparator} from './umlComparator.js';
import { PlantUMLParser } from './PalantumlParser.js';
import { MnipolatorePdf } from './MnipolatorePdf.js';
import { Logger } from './logger.js';

  const PDF_FILE = 'Hackathon.pdf';//
  const XMI_FILE = 'Hackathon.xmi';
  const NAME_FILE = 'Hackathon';

async function main() {
  Logger.setLogFileName(`${NAME_FILE}.txt`);
  Logger.logToFile("\n---------------------- Inizio del processo ----------------------\n");
  
  const contenuto = await MnipolatorePdf.PrintTxtPdf(PDF_FILE);
  const jsonObj = MnipolatoreXmi.parseXmiFile(`./Risultato/${XMI_FILE}`);
  Logger.logToFile("\n----------------------primo step stampo il Contenuto del PDF----------------------  \n" + contenuto);
  const modelA = MnipolatoreXmi.estraiModelCompatto(jsonObj);
  Logger.logToFile("\n---------------------- secondo step stampo il Model JSON dell'XMI----------------------  \n" + JSON.stringify(modelA, null, 2));

  //let risultato = await OpenRouterIA.runMeta(contenuto);
  let risultato = await OpenRouterIA.runDeepSeek(contenuto);
  //let  risultato = await GeminiAPI.getGeminiResponse(contenuto);
  Logger.logToFile("\n---------------------- terzo step stampo il risultato della IA----------------------  \n" + risultato);




  const modelB = PlantUMLParser.parse(risultato);
  Logger.logToFile("\n---------------------- quarto step stampo il Model JSON della IA---------------------- \n" + JSON.stringify(modelB, null, 2));




  const result = UMLComparator.compareUMLModels(modelA, modelB);
  Logger.logToFile("\n---------------------- quinto step stampo il risultato del confronto tra i due modelli----------------------  \n");
  Logger.logToFile("Similarità totale: " + result.similarity);
  Logger.logToFile("Dettagli: " + JSON.stringify(result.details));
  Logger.logToFile("Classi abbinate: " + JSON.stringify(result.matchedClasses));
}

main();