export class ErrorReporter {
  static generateErrorReport(differences, similarity) {
    const report = {
      summary: {
        totalErrors: 0,
        similarity: similarity,
        status: similarity >= 0.8 ? 'BUONO' : similarity >= 0.6 ? 'MEDIO' : 'SCARSO'
      },
      errors: {
        critical: [],
        important: [],
        minor: [],
        nonReliable: [] 
      },
      suggestions: []
    };

    // ERRORI CRITICI - Classi mancanti
    if (differences.missingClasses.length > 0) {
      differences.missingClasses.forEach(cls => {
        report.errors.critical.push({
          type: 'CLASSE_MANCANTE',
          message: `Manca la classe "${cls.name}"`,
          suggestion: `Aggiungi nella traccia: "Il sistema deve gestire una classe ${cls.name} che rappresenta..."`
        });
        report.summary.totalErrors++;
      });
    }

    // ERRORI IMPORTANTI - Relazioni mancanti (ESCLUSE le associazioni)
    if (differences.missingRelations.length > 0) {
      differences.missingRelations.forEach(rel => {
        let suggestionText = '';
        let isAssociation = false;
        
        switch (rel.type) {
          case 'inheritance':
            suggestionText = `"${rel.from} eredita da ${rel.to}" o "${rel.from} è un tipo di ${rel.to}"`;
            break;
          case 'composition':
            suggestionText = `"${rel.from} è composto da ${rel.to}" o "${rel.from} contiene ${rel.to}"`;
            break;
          case 'aggregation':
            suggestionText = `"${rel.from} aggrega ${rel.to}" o "${rel.from} ha ${rel.to}"`;
            break;
          case 'association':
          default:
            suggestionText = `"${rel.from} è associato a ${rel.to}"`;
            isAssociation = true;
        }
        
        const errorObj = {
          type: isAssociation ? 'ASSOCIAZIONE_MANCANTE' : 'RELAZIONE_MANCANTE',
          message: `Manca la relazione ${rel.type} tra "${rel.from}" e "${rel.to}"`,
          suggestion: `Specifica nella traccia: ${suggestionText}`
        };

        if (isAssociation) {
          report.errors.nonReliable.push(errorObj);
        } else {
          report.errors.important.push(errorObj);
          report.summary.totalErrors++;
        }
      });
    }

    // ERRORI IMPORTANTI/NON ATTENDIBILI - Tipo di relazione sbagliato
    if (differences.wrongRelationTypes.length > 0) {
      differences.wrongRelationTypes.forEach(wrong => {
        const isAssociationError = wrong.expected.type === 'association' || wrong.actual.type === 'association';
        
        const errorObj = {
          type: 'TIPO_RELAZIONE_SBAGLIATO',
          message: `Relazione tra "${wrong.expected.from}" e "${wrong.expected.to}": trovato "${wrong.actual.type}", atteso "${wrong.expected.type}"`,
          suggestion: `Chiarisci nella traccia il tipo di relazione specifica`
        };

        if (isAssociationError) {
          report.errors.nonReliable.push(errorObj);
        } else {
          report.errors.important.push(errorObj);
          report.summary.totalErrors++;
        }
      });
    }

    // ERRORI MINORI - Attributi mancanti
    if (differences.missingAttributes.length > 0) {
      differences.missingAttributes.forEach(item => {
        const attrs = item.attributes.map(a => a.name || a).join(', ');
        report.errors.minor.push({
          type: 'ATTRIBUTI_MANCANTI',
          message: `Nella classe "${item.className}" mancano gli attributi: ${attrs}`,
          suggestion: `Specifica nella traccia: "La classe ${item.className} deve avere i seguenti attributi: ${attrs}"`
        });
        report.summary.totalErrors++;
      });
    }

    // ERRORI MINORI - Classi extra
    if (differences.extraClasses.length > 0) {
      differences.extraClasses.forEach(cls => {
        report.errors.minor.push({
          type: 'CLASSE_EXTRA',
          message: `Generata classe non richiesta: "${cls.name}"`,
          suggestion: `Rimuovi dalla traccia riferimenti ambigui che potrebbero aver causato questa classe`
        });
        report.summary.totalErrors++;
      });
    }

    // NON ATTENDIBILI - Attributi extra (SPOSTATO DA MINORI)
    if (differences.extraAttributes.length > 0) {
      differences.extraAttributes.forEach(item => {
        const attrs = item.attributes.map(a => a.name || a).join(', ');
        report.errors.nonReliable.push({
          type: 'ATTRIBUTI_EXTRA',
          message: `Nella classe "${item.className}" sono stati generati attributi non richiesti: ${attrs}`,
          suggestion: `Rimuovi dalla traccia riferimenti a questi attributi se non necessari`
        });
        // Non aumentiamo totalErrors per attributi extra
      });
    }

    // NON ATTENDIBILI - Tutte le relazioni extra (SPOSTATO DA MINORI)
    if (differences.extraRelations.length > 0) {
      differences.extraRelations.forEach(rel => {
        report.errors.nonReliable.push({
          type: 'RELAZIONE_EXTRA',
          message: `Generata relazione non richiesta: ${rel.type} tra "${rel.from}" e "${rel.to}"`,
          suggestion: `Rimuovi dalla traccia riferimenti ambigui che potrebbero aver causato questa relazione`
        });
        // Non aumentiamo totalErrors per relazioni extra
      });
    }

    return report;
  }

  static formatReport(report) {
    let output = [];
    
    output.push(`\n==================== REPORT ERRORI ====================`);
    output.push(`Similarità: ${(report.summary.similarity * 100).toFixed(1)}% - Status: ${report.summary.status}`);
    output.push(`Errori attendibili: ${report.summary.totalErrors}`);
    output.push(`Errori non attendibili: ${report.errors.nonReliable.length}`);
    output.push(`========================================================\n`);

    if (report.errors.critical.length > 0) {
      output.push(`🔴 ERRORI CRITICI (${report.errors.critical.length}):`);
      report.errors.critical.forEach((error, i) => {
        output.push(`  ${i + 1}. ${error.message}`);
        output.push(`     💡 Suggerimento: ${error.suggestion}`);
        output.push('');
      });
    }

    if (report.errors.important.length > 0) {
      output.push(`🟠 ERRORI IMPORTANTI (${report.errors.important.length}):`);
      report.errors.important.forEach((error, i) => {
        output.push(`  ${i + 1}. ${error.message}`);
        output.push(`     💡 Suggerimento: ${error.suggestion}`);
        output.push('');
      });
    }

    if (report.errors.minor.length > 0) {
      output.push(`🟡 ERRORI MINORI (${report.errors.minor.length}):`);
      report.errors.minor.forEach((error, i) => {
        output.push(`  ${i + 1}. ${error.message}`);
        output.push(`     💡 Suggerimento: ${error.suggestion}`);
        output.push('');
      });
    }

    // SEZIONE NON ATTENDIBILI (include associazioni, attributi extra, relazioni extra)
    if (report.errors.nonReliable.length > 0) {
      output.push(`⚠️  ERRORI NON ATTENDIBILI (${report.errors.nonReliable.length}):`);
      output.push(`    ℹ️  L'IA spesso genera contenuti extra o ha difficoltà con le associazioni`);
      output.push(`    ℹ️  Questi errori potrebbero essere falsi positivi - verifica manualmente`);
      output.push('');
      report.errors.nonReliable.forEach((error, i) => {
        output.push(`  ${i + 1}. ${error.message}`);
        output.push(`     💡 Suggerimento: ${error.suggestion}`);
        output.push(`     ⚠️  Nota: Verifica manualmente se questo elemento è realmente problematico`);
        output.push('');
      });
    }

    if (report.summary.totalErrors === 0 && report.errors.nonReliable.length === 0) {
      output.push(`✅ NESSUN ERRORE RILEVATO! UML perfettamente corrispondente.`);
    } else if (report.summary.totalErrors === 0) {
      output.push(`✅ NESSUN ERRORE ATTENDIBILE! Solo possibili problemi da verificare manualmente.`);
    }

    output.push(`========================================================\n`);
    
    return output.join('\n');
  }
}