import { PlantUMLGenerator } from './plantUML.js';
import { UmlAtteso } from './UmlAtteso.js';

// Esempio di utilizzo del generatore PlantUML

// Test con un modello di esempio
const exempleModel = {
  classes: [
    {
      name: "Person",
      attributes: [
        { name: "name", type: "String" },
        { name: "age", type: "int" },
        { name: "email", type: "String" }
      ],
      methods: ["getName", "setName", "getAge", "setAge"]
    },
    {
      name: "Student",
      attributes: [
        { name: "studentId", type: "String" },
        { name: "major", type: "String" }
      ],
      methods: ["getStudentId", "getMajor"]
    },
    {
      name: "Course",
      attributes: [
        { name: "courseId", type: "String" },
        { name: "title", type: "String" },
        { name: "credits", type: "int" }
      ],
      methods: ["getCourseId", "getTitle"]
    }
  ],
  relations: [
    {
      from: "Student",
      to: "Person",
      type: "inheritance",
      name: "extends"
    },
    {
      from: "Student",
      to: "Course",
      type: "association",
      name: "enrolls",
      multiplicity: "1 - *"
    }
  ],
  enumerations: [
    {
      name: "Grade",
      values: ["A", "B", "C", "D", "F"]
    }
  ]
};

// Genera PlantUML dal modello di esempio
console.log("=== ESEMPIO DI CONVERSIONE JSON TO PLANTUML ===\n");
const plantUMLCode = PlantUMLGenerator.generatePlantUML(exempleModel);
console.log(plantUMLCode);

console.log("\n=== ESEMPIO CON STILI ===\n");
const styledPlantUML = PlantUMLGenerator.generateStyledPlantUML(exempleModel, {
  theme: 'bluegray',
  direction: 'left to right direction',
  showPackages: true
});
console.log(styledPlantUML);

// Funzione per testare la conversione da file XMI
export function testXmiConversion(xmiFile = '../UmlAtteso/Fotografia.xmi') {
  console.log(`\n=== CONVERSIONE DA FILE XMI: ${xmiFile} ===\n`);
  
  try {
    const jsonObj = UmlAtteso.parseXmiFile(xmiFile);
    const model = UmlAtteso.estraiModelCompatto(jsonObj);
    
    console.log("Modello estratto:");
    UmlAtteso.stampaModelCompatto(model);
    
    console.log("\n--- PLANTUML GENERATO ---\n");
    const plantUML = PlantUMLGenerator.generatePlantUML(model);
    console.log(plantUML);
    
    // Salva il file PlantUML
    const outputFile = `../risultati/${xmiFile.split('/').pop().replace('.xmi', '.puml')}`;
    PlantUMLGenerator.saveToFile(model, outputFile);
    
    return plantUML;
  } catch (error) {
    console.error(`Errore durante la conversione: ${error.message}`);
    return null;
  }
}

// Esegui il test se il file viene eseguito direttamente
if (import.meta.url === `file://${process.argv[1]}`) {
  // Testa con il modello di esempio
  
  // Testa con un file XMI (decommentare per testare)
  // testXmiConversion('../UmlAtteso/Fotografia.xmi');
}
