import fs from 'fs';

export class PlantUMLGenerator {

  static generatePlantUML(model) {
    const { classes = [], relations = [], enumerations = [] } = model;
    
    let plantUML = '@startuml\n';
    plantUML += '!define RECTANGLE class\n\n';
    
    // Genera le classi
    plantUML += this.generateClasses(classes);
    
    // Genera le enumerazioni
    plantUML += this.generateEnumerations(enumerations);
    
    // Genera le relazioni (filtrando quelle verso enumerazioni)
    plantUML += this.generateRelations(relations, enumerations);
    
    plantUML += '\n@enduml';
    
    return plantUML;
  }


  static generateClasses(classes) {
    let output = '';
    
    for (const cls of classes) {
      output += `class ${cls.name} {\n`;
      
      // Aggiungi attributi
      if (cls.attributes && cls.attributes.length > 0) {
        for (const attr of cls.attributes) {
          if (typeof attr === 'string') {
            output += `  ${attr}\n`;
          } else if (attr.name) {
            const type = attr.type ? ` : ${attr.type}` : '';
            output += `  ${attr.name}${type}\n`;
          }
        }
      }
      
      // Separatore tra attributi e metodi
      if (cls.attributes && cls.attributes.length > 0 && cls.methods && cls.methods.length > 0) {
        output += '  --\n';
      }
      
      // Aggiungi metodi
      if (cls.methods && cls.methods.length > 0) {
        for (const method of cls.methods) {
          output += `  ${method}()\n`;
        }
      }
      
      output += '}\n\n';
    }
    
    return output;
  }

  static generateEnumerations(enumerations) {
    if (!enumerations || enumerations.length === 0) {
      return '';
    }
    
    let output = '';
    
    for (const enumeration of enumerations) {
      output += `enum ${enumeration.name} {\n`;
      
      if (enumeration.values && enumeration.values.length > 0) {
        for (const value of enumeration.values) {
          output += `  ${value}\n`;
        }
      }
      
      output += '}\n\n';
    }
    
    return output;
  }


  static generateRelations(relations, enumerations = []) {
    if (!relations || relations.length === 0) {
      return '';
    }
    
    let output = '';
    
    // Crea un set con i nomi delle enumerazioni per filtrarle
    const enumNames = new Set(enumerations.map(e => e.name));
    
    for (const relation of relations) {
      const { from, to, type, name, multiplicity, attributes } = relation;
      
      // Salta le relazioni verso enumerazioni (non sono relazioni vere in UML)
      if (enumNames.has(to) || enumNames.has(from)) {
        continue;
      }
      
      let relationSymbol = '';
      let label = '';
      
      // Determina il simbolo della relazione in base al tipo
      switch (type) {
        case 'inheritance':
        case 'generalization':
          relationSymbol = ' --|> ';
          break;
        case 'composition':
          relationSymbol = ' *-- ';
          break;
        case 'aggregation':
          relationSymbol = ' o-- ';
          break;
        case 'association':
          relationSymbol = ' -- ';
          break;
        case 'associationClass':
          relationSymbol = ' -- ';
          break;
        case 'dependency':
          relationSymbol = ' ..> ';
          break;
        default:
          relationSymbol = ' -- ';
      }
      
      // Gestisci molteplicità in formato PlantUML
      let fromMultiplicity = '';
      let toMultiplicity = '';
      
      if (multiplicity && multiplicity !== 'undefined - undefined') {
        // Estrai molteplicità da formati come "1 - *", "1..* - 1..1", etc.
        const parts = multiplicity.split(' - ');
        if (parts.length === 2) {
          fromMultiplicity = parts[0].trim();
          toMultiplicity = parts[1].trim();
          
          // Converti formati comuni
          fromMultiplicity = fromMultiplicity.replace(/\.\./g, '..');
          toMultiplicity = toMultiplicity.replace(/\.\./g, '..');
          
          // Gestisci il formato "*" come "0..*"
          if (fromMultiplicity === '*') fromMultiplicity = '0..*';
          if (toMultiplicity === '*') toMultiplicity = '0..*';
        }
      }
      
      // Costruisci l'etichetta della relazione
      const labelParts = [];
      if (name && name !== 'generalization') {
        labelParts.push(name);
      }
      if (attributes && attributes.length > 0) {
        labelParts.push(`{${attributes.join(', ')}}`);
      }
      
      // Costruisci la relazione con molteplicità
      let relationLine = from;
      
      // Aggiungi molteplicità di partenza se presente
      if (fromMultiplicity) {
        relationLine += ` "${fromMultiplicity}"`;
      }
      
      relationLine += relationSymbol;
      
      // Aggiungi molteplicità di arrivo se presente
      if (toMultiplicity) {
        relationLine += ` "${toMultiplicity}"`;
      }
      
      relationLine += to;
      
      // Aggiungi etichetta se presente
      if (labelParts.length > 0) {
        relationLine += ` : ${labelParts.join(' ')}`;
      }
      
      output += `${relationLine}\n`;
    }
    
    output += '\n';
    return output;
  }


  static saveToFile(model, filePath) {
    const plantUML = this.generatePlantUML(model);
    
    try {
      fs.writeFileSync(filePath, plantUML, 'utf-8');
      console.log(`✅ File PlantUML salvato in: ${filePath}`);
    } catch (error) {
      console.error(`❌ Errore durante il salvataggio del file: ${error.message}`);
    }
  }

  static async convertXmiToPlantUML(xmiFilePath, outputPath) {
    try {
      const { UmlAtteso } = await import('./UmlAtteso.js');
      
      const jsonObj = UmlAtteso.parseXmiFile(xmiFilePath);
      const model = UmlAtteso.estraiModelCompatto(jsonObj);
      
      this.saveToFile(model, outputPath);
      return this.generatePlantUML(model);
    } catch (error) {
      console.error(`❌ Errore durante la conversione: ${error.message}`);
      return null;
    }
  }


  static generateStyledPlantUML(model, options = {}) {
    const {
      theme = 'default',
      showPackages = false,
      hideAttributes = false,
      hideMethods = false,
      direction = 'top to bottom direction'
    } = options;
    
    let plantUML = '@startuml\n';
    
    // Applica tema se specificato
    if (theme !== 'default') {
      plantUML += `!theme ${theme}\n`;
    }
    
    // Imposta direzione
    plantUML += `${direction}\n`;
    
    // Nascondi elementi se richiesto
    if (hideAttributes) {
      plantUML += 'hide attributes\n';
    }
    if (hideMethods) {
      plantUML += 'hide methods\n';
    }
    
    plantUML += '\n';
    
    // Genera il contenuto del modello
    const { classes = [], relations = [], enumerations = [] } = model;
    
    if (showPackages) {
      plantUML += 'package "Model" {\n';
    }
    
    plantUML += this.generateClasses(classes);
    plantUML += this.generateEnumerations(enumerations);
    plantUML += this.generateRelations(relations, enumerations);
    
    if (showPackages) {
      plantUML += '}\n';
    }
    
    plantUML += '\n@enduml';
    
    return plantUML;
  }
}
