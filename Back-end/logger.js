import fs from 'fs';
import path from 'path';
import { DateTime } from 'luxon';

export class Logger {
  static logFileName = 'log.txt';
  static resultsDir = './risultati';

  static setLogFileName(baseName) {
    // Ottieni la data/ora corrente in Europe/Rome
    const romeTime = DateTime.now().setZone('Europe/Rome');
    const dateStr = romeTime.toISO().replace(/[:.]/g, '-');
    
    // Salva il file nella cartella risultati (che deve esistere)
    Logger.logFileName = path.join(Logger.resultsDir, `${baseName}_${dateStr}.txt`);
  }

  static logToFile(message) {
    fs.appendFileSync(Logger.logFileName, message + '\n');
  }
}