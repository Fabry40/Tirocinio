import fs from 'fs';
import { DateTime } from 'luxon';

export class Logger {
  static logFileName = 'log.txt';

  static setLogFileName(baseName) {
    // Ottieni la data/ora corrente in Europe/Rome
    const romeTime = DateTime.now().setZone('Europe/Rome');
    const dateStr = romeTime.toISO().replace(/[:.]/g, '-');
    Logger.logFileName = `${baseName}_${dateStr}.txt`;
  }

  static logToFile(message) {
    fs.appendFileSync(Logger.logFileName, message + '\n');
  }
}