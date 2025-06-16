import { PdfReader } from 'pdfreader';

export class MnipolatorePdf {
  static PrintTxtPdf(file) {
    return new Promise((resolve, reject) => {
      let pageTexts = [];
      let minY = null;
      let printedFileName = false;
      let resultTexts = [];

      new PdfReader().parseFileItems(`./traccia/${file}`, (err, item) => {
        if (err) {
          console.error("error:", err);
          reject(err);
        } else if (!item) {
          if (pageTexts.length > 0) {
            if (!printedFileName) {
             // console.log(`\n--- Contenuto di: ${file} ---`);
            }
            const pageContent = pageTexts.join(' ');
            console.log(pageContent);
            resultTexts.push(pageContent);
            pageTexts = [];
          }
          resolve(resultTexts.join('\n'));
        } else if (item.page) {
          if (pageTexts.length > 0) {
            if (!printedFileName) {
             // console.log(`\n--- Contenuto di: ${file} ---`);
              printedFileName = true;
            }
            const pageContent = pageTexts.join(' ');
            console.log(pageContent);
            resultTexts.push(pageContent);
            pageTexts = [];
          }
          minY = null;
        } else if (item.text) {
          if (minY === null || item.y < minY) {
            minY = item.y;
          }
          if (item.y !== minY) {
            if (!printedFileName) {
              //console.log(`\n--- Contenuto di: ${file} ---`);
              printedFileName = true;
            }
            pageTexts.push(item.text);
          }
        }
      });
    });
  }
}