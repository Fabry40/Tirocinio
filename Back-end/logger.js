import fs from 'fs';

export class Logger {
  static logFileName = 'log.txt';

  static setLogFileName(fileName) {
    Logger.logFileName = fileName;
  }

  static logToFile(message) {
    fs.appendFileSync(Logger.logFileName, message + '\n');
  }
}
