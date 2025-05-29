export class PlantUMLParser {
  constructor() {}

  static parse(plantUML) {
    // Estrai solo il blocco tra @startuml e @enduml
    const match = plantUML.match(/@startuml([\s\S]*?)@enduml/);
    const lines = match ? match[1].split('\n').map(line => line.trim()) : [];

    const classes = [];
    const relations = [];

    let currentClass = null;
    let insideClass = false;

    for (const line of lines) {
      if (line.startsWith('class ')) {
        const name = line.split(' ')[1];
        currentClass = { name, attributes: [], methods: [] };
        classes.push(currentClass);
        insideClass = true;
      } else if (line === '}' && insideClass) {
        currentClass = null;
        insideClass = false;
      } else if (insideClass && currentClass) {
        // Attributi (es. +String titolo)
        const attrMatch = line.match(/^[-+~#]\s*([\w<>]+)\s+([\w_]+)$/);
        if (attrMatch) {
          currentClass.attributes.push({
            name: attrMatch[2],
            type: attrMatch[1]
          });
        }

        // Metodi (es. +void inviaMail())
        const methodMatch = line.match(/^[-+~#]\s*([\w<>]+)\s+([\w_]+)\(([^)]*)\)$/);
        if (methodMatch) {
          currentClass.methods.push({
            name: methodMatch[2],
            params: methodMatch[3],
            returnType: methodMatch[1]
          });
        }
      } else if (
        line.includes('--') ||
        line.includes('-->') ||
        line.includes('*') ||
        line.includes('}|--') ||
        line.includes('}--') ||
        line.includes('--|>')
      ) {
        // Relazione tra classi (regex migliorata)
        // Cattura nomi con lettere, numeri, underscore, anche con spazi
        const relRegex = /^\s*([\w\d_]+)\s*("[^"]*")?\s*([<|o*}]*[-]+[o*|>{]*)\s*("[^"]*")?\s*([\w\d_]+)/;
        const match = line.match(relRegex);
        if (match) {
          const from = match[1];
          const fromMultiplicity = match[2]?.replace(/"/g, '') || '';
          const toMultiplicity = match[4]?.replace(/"/g, '') || '';
          const to = match[5];

          let type = 'association';
          if (match[3].includes('|>')) type = 'inheritance';
          else if (match[3].includes('*--')) type = 'composition';
          else if (match[3].includes('o--')) type = 'aggregation';
          else if (match[3].includes('-->')) type = 'association';

          const multiplicity = (fromMultiplicity || toMultiplicity)
            ? `${fromMultiplicity} - ${toMultiplicity}`.trim()
            : '';

          relations.push({
            from,
            to,
            type,
            ...(multiplicity && { multiplicity })
          });
        }
      }
    }

    return {
      classes,
      relations
    };
  }
}