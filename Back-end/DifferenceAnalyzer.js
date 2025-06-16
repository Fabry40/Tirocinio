export class DifferenceAnalyzer {
  static analyzeDifferences(modelA, modelB) {
    const differences = {
      missingClasses: [],
      extraClasses: [],
      missingAttributes: [],
      extraAttributes: [],
      missingRelations: [],
      extraRelations: [],
      wrongRelationTypes: []
    };

    // Trova classi mancanti e extra
    const classNamesA = new Set(modelA.classes.map(c => c.name.toLowerCase()));
    const classNamesB = new Set(modelB.classes.map(c => c.name.toLowerCase()));

    differences.missingClasses = modelA.classes.filter(c => 
      !classNamesB.has(c.name.toLowerCase())
    );
    differences.extraClasses = modelB.classes.filter(c => 
      !classNamesA.has(c.name.toLowerCase())
    );

    // Analizza attributi per classi corrispondenti
    modelA.classes.forEach(classA => {
      const classB = modelB.classes.find(c => 
        c.name.toLowerCase() === classA.name.toLowerCase()
      );
      
      if (classB) {
        const attrsA = new Set((classA.attributes || []).map(a => 
          (a.name || a).toLowerCase()
        ));
        const attrsB = new Set((classB.attributes || []).map(a => 
          (a.name || a).toLowerCase()
        ));

        const missingAttrs = (classA.attributes || []).filter(a => 
          !attrsB.has((a.name || a).toLowerCase())
        );
        const extraAttrs = (classB.attributes || []).filter(a => 
          !attrsA.has((a.name || a).toLowerCase())
        );

        if (missingAttrs.length > 0) {
          differences.missingAttributes.push({
            className: classA.name,
            attributes: missingAttrs
          });
        }
        if (extraAttrs.length > 0) {
          differences.extraAttributes.push({
            className: classB.name,
            attributes: extraAttrs
          });
        }
      }
    });

    // Analizza relazioni
    differences.missingRelations = modelA.relations.filter(relA => 
      !modelB.relations.some(relB => 
        this.relationsMatch(relA, relB)
      )
    );

    differences.extraRelations = modelB.relations.filter(relB => 
      !modelA.relations.some(relA => 
        this.relationsMatch(relA, relB)
      )
    );

    // Trova relazioni con tipo sbagliato
    modelA.relations.forEach(relA => {
      const correspondingRelB = modelB.relations.find(relB => 
        (relA.from.toLowerCase() === relB.from.toLowerCase() && 
         relA.to.toLowerCase() === relB.to.toLowerCase()) ||
        (relA.from.toLowerCase() === relB.to.toLowerCase() && 
         relA.to.toLowerCase() === relB.from.toLowerCase())
      );
      
      if (correspondingRelB && relA.type !== correspondingRelB.type) {
        differences.wrongRelationTypes.push({
          expected: relA,
          actual: correspondingRelB
        });
      }
    });

    return differences;
  }

  static relationsMatch(relA, relB) {
    return (
      relA.from.toLowerCase() === relB.from.toLowerCase() &&
      relA.to.toLowerCase() === relB.to.toLowerCase() &&
      relA.type === relB.type
    ) || (
      relA.from.toLowerCase() === relB.to.toLowerCase() &&
      relA.to.toLowerCase() === relB.from.toLowerCase() &&
      relA.type === relB.type
    );
  }
}